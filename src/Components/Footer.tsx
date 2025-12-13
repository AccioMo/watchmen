import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black/50 border-t border-white/5 py-12 mt-20 backdrop-blur-sm z-50 relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Brand / Copyright */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
              Watchmen
            </h2>
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} AccioMo. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
            <Link href="https://mozeggaf.vercel.app" className="hover:text-white transition-colors">Credits to null</Link>
            <Link href="https://mozeggaf.vercel.app/about" className="hover:text-white transition-colors">About</Link>
            <Link href="https://mozeggaf.vercel.app/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Legal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
