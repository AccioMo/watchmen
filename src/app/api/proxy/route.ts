import { NextRequest, NextResponse } from 'next/server';

// Function to filter and copy headers
function getProxyHeaders(originalHeaders: Headers, type?: string) {
	const headers = new Headers();

	// CORS
	headers.set('Access-Control-Allow-Origin', '*');
	headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');

	if (type) {
		headers.set('Content-Type', type);
	}

	// Forward useful headers
	const allowedHeaders = [
		'content-length',
		'cache-control',
		'expires',
		'date',
		'last-modified',
		'etag',
		'accept-ranges'
	];

	allowedHeaders.forEach(header => {
		const value = originalHeaders.get(header);
		if (value) headers.set(header.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-'), value);
	});

	return headers;
}

export async function GET(request: NextRequest) {
	const url = request.nextUrl.searchParams.get('url');

	if (!url) {
		return new NextResponse('Missing URL parameter', { status: 400 });
	}

	try {
		// Forward client User-Agent or use a default one specific to generic browsers
		const clientUserAgent = request.headers.get('user-agent');

		// Parse the target URL to set correct Origin and Referer
		const targetUrl = new URL(url);

		const upstreamResponse = await fetch(url, {
			headers: {
				// Use client's UA if available, otherwise fallback
				...(clientUserAgent ? { 'User-Agent': clientUserAgent } : {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
				}),
				// mimic standard browser headers to avoid anti-bot protections
				'Referer': targetUrl.origin + '/',
				'Origin': targetUrl.origin,
				'Accept': '*/*',
				'Accept-Language': 'en-US,en;q=0.9',
				'Connection': 'keep-alive',
				'Sec-Fetch-Dest': 'empty',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Site': 'cross-site',
				'Pragma': 'no-cache',
				'Cache-Control': 'no-cache',
			},
		});

		if (!upstreamResponse.ok) {
			const errorBody = await upstreamResponse.text();
			console.error(`Proxy upstream error: ${upstreamResponse.status} for ${url} \nBody: ${errorBody.slice(0, 500)}`);
			return new NextResponse(`Failed to fetch source: ${upstreamResponse.statusText}. Body: ${errorBody.slice(0, 200)}`, { status: upstreamResponse.status });
		}

		const contentType = upstreamResponse.headers.get('content-type');
		const isM3U8 = contentType?.includes('application/vnd.apple.mpegurl') ||
			contentType?.includes('application/x-mpegurl') ||
			url.endsWith('.m3u8');

		if (isM3U8) {
			const text = await upstreamResponse.text();
			const baseUrl = new URL(url);

			// Rewrite m3u8 content
			const modifiedText = text.split('\n').map(line => {
				const trimmed = line.trim();
				if (!trimmed || trimmed.startsWith('#')) {
					return line;
				}

				// It's a URI line
				try {
					const absoluteUrl = new URL(trimmed, baseUrl.href).href;
					// Encode specifically for our query param
					return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
				} catch (e) {
					console.warn(`Failed to rewrite M3U8 URL: ${line}`, e);
					return line;
				}
			}).join('\n');

			return new NextResponse(modifiedText, {
				headers: {
					'Content-Type': 'application/vnd.apple.mpegurl',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		// FOR BINARY/VIDEO SEGMENTS: STREAM IT (Don't buffer)
		// NextResponse can take a ReadableStream directly
		return new NextResponse(upstreamResponse.body, {
			status: upstreamResponse.status,
			statusText: upstreamResponse.statusText,
			headers: getProxyHeaders(upstreamResponse.headers, contentType || 'application/octet-stream'),
		});

	} catch (error: any) {
		console.error('Proxy error:', error);
		return new NextResponse(`Proxy error: ${error.message}`, { status: 500 });
	}
}

export async function OPTIONS() {
	return new NextResponse(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		},
	});
}
