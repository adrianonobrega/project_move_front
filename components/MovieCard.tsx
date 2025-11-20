import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types";
import { PlayCircle } from "lucide-react";
import { getImageUrl } from "@/lib/api"; 

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Link href={`/watch/${movie.id}`}>
      <div className="group relative h-[12vw] min-h-[180px] bg-zinc-900 col-span rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10 hover:shadow-xl hover:shadow-black/50">
        
        <Image
          src={getImageUrl(movie.coverUrl)}
          alt={movie.title}
          fill
          unoptimized={true}
          className="object-cover rounded-md transition duration-300 group-hover:opacity-80"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-transparent to-transparent">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-200 transition mb-2 text-black">
            <PlayCircle className="w-6 h-6 fill-black" />
          </div>

          <h3 className="text-white font-bold text-sm drop-shadow-lg shadow-black">
            {movie.title}
          </h3>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-green-400 text-[10px] font-bold">98% Relevante</span>
            <span className="border border-gray-500 text-[10px] text-white px-1 rounded">HD</span>
          </div>
        </div>
      </div>
    </Link>
  );
};