import Link from 'next/link';

export const metadata = {
    title: 'Categories - N4tflix',
    description: 'Browse movies by category',
};

const categories = [
    { name: 'Funny', href: '/funny', description: 'Comedy movies to make you laugh' },
    { name: 'Chill', href: '/chill', description: 'Relaxing movies for a quiet night' },
    { name: 'Romance', href: '/romance', description: 'Love stories and romantic dramas' },
    { name: 'Action', href: '/action', description: 'High-octane excitement and adventure' },
];

export default function CategoriesPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] pt-24 px-6 md:px-12 pb-12">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Categories
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl">
                        Explore our curated collection of movies across different genres and moods.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href={category.href}
                            className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                                <h2 className="text-2xl font-bold text-white mb-2 transform group-hover:-translate-y-1 transition-transform duration-300">
                                    {category.name}
                                </h2>
                                <p className="text-sm text-white/60 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                                    {category.description}
                                </p>
                            </div>

                            {/* Decorative background element/icon could go here */}
                            <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/20 transition-colors duration-300 transform group-hover:scale-110 group-hover:rotate-6">
                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.488 4.908a8.956 8.956 0 011.696 2.06c.094.167.112.368.049.55-.262.77-.39 1.579-.379 2.395a8.96 8.96 0 001.373 4.417c.105.176.1.397-.015.561a8.968 8.968 0 01-3.619 3.197c-.172.083-.377.054-.52-.075a8.948 8.948 0 00-4.63-1.895 8.91 8.91 0 00-2.883.136c-.191.036-.319.208-.291.401.12 1.353.486 2.664 1.066 3.868.077.159.034.351-.106.463a8.96 8.96 0 01-4.706 1.344c-.195 0-.374-.104-.474-.271a8.944 8.944 0 00-2.316-2.61 8.922 8.922 0 00-3.32-1.573c-.19-.047-.306-.24-.263-.43a8.98 8.98 0 011.196-2.905c.104-.176.098-.397-.015-.56a8.97 8.97 0 00-2.227-2.732 8.94 8.94 0 00-2.078-1.46c-.167-.087-.246-.289-.187-.468a8.955 8.955 0 011.967-3.69c.123-.146.326-.201.507-.132a8.94 8.94 0 005.148 1.096c.195-.01.36-.168.375-.363a8.928 8.928 0 01.367-2.673c.048-.19.215-.327.41-.337a8.96 8.96 0 014.28 1.076c.168.084.37.057.513-.07a8.948 8.948 0 004.298-5.32c.063-.186.257-.297.452-.258a8.92 8.92 0 012.396.966z" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
