"use client";

import React, { useEffect } from "react";

export default function LegalPage() {
    useEffect(() => {
        document.title = "Legal - DEMETR";
    }, []);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white pt-24 px-6 md:px-12">
            <div className="max-w-4xl m-auto space-y-8">
                <h1 className="text-4xl md:text-5xl font-bold pb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Legal Disclaimer
                </h1>

                <div className="space-y-6 text-lg text-white/80 leading-relaxed font-light">
                    <p>
                        <strong>DEMETR</strong> does not host any files on its servers. All content is provided by non-affiliated third parties.
                    </p>

                    <p>
                        <strong>DEMETR</strong> does not accept responsibility for content hosted on third-party websites and does not have any involvement in the downloading/uploading of movies. We just act as a search engine indexer gathering links already available on the internet.
                    </p>

                    <p>
                        If you believe your copyrighted content is being shown on this site without permission, please contact the third-party file hosters directly, as we do not have control over their servers or content.
                    </p>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl mt-8">
                        <p className="text-sm text-white/60">
                            By using this site, you agree to this disclaimer and acknowledge that <strong>DEMETR</strong> is not liable for any third-party content.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
