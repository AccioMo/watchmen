import ActorCard from "./ActorCard";

interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string;
    order: number;
}

interface CastListProps {
    cast: CastMember[];
}

export default function CastList({ cast }: CastListProps) {
    if (!cast || cast.length === 0) return null;

    return (
        <section className="mb-20 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                    <span className="w-1 h-8 bg-purple-500 rounded-full"></span>
                    Top Cast
                </h2>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-8 snap-x custom-scrollbar">
                {cast.map((actor) => (
                    <ActorCard
                        key={actor.id}
                        id={actor.id}
                        name={actor.name}
                        character={actor.character}
                        profilePath={actor.profile_path}
                    />
                ))}
            </div>
        </section>
    );
}
