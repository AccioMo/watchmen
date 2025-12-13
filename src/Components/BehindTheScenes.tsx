'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageURL } from "../API/TMDB";

interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string;
}

interface BehindTheScenesProps {
    crew: CrewMember[];
}

export default function BehindTheScenes({ crew }: BehindTheScenesProps) {
    const router = useRouter();

    if (!crew || crew.length === 0) return null;

    return (
        <div className="lg:col-span-2 animate-fade-in-up">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
                Behind the Scenes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                {crew.map((member, i) => (
                    <div
                        key={`${member.id}-${i}`}
                        className="flex items-start gap-4 cursor-pointer group"
                        onClick={() => router.push(`/person/${member.id}`)}
                    >
                        <div className="w-12 h-12 rounded-full bg-white/10 flex-shrink-0 overflow-hidden group-hover:ring-2 group-hover:ring-purple-500 transition-all">
                            {member.profile_path ? (
                                <Image
                                    src={getImageURL(member.profile_path, 'tiny')}
                                    alt={member.name}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">N/A</div>
                            )}
                        </div>
                        <div>
                            <p className="text-white font-semibold text-lg group-hover:text-purple-400 transition-colors">{member.name}</p>
                            <p className="text-white/50 text-sm uppercase tracking-wide">{member.job}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
