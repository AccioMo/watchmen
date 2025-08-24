
export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg">
            <div className="pt-32 flex items-center justify-center min-h-[60vh]">
                <div className="glass-card glass-border p-8 rounded-2xl">
                    <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
