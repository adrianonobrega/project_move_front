"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Movie } from "@/types";
import { api, getImageUrl } from "@/lib/api"; 

export default function Home() {
  const router = useRouter();
  
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("netflix-token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchMovies() {
      try {
        const response = await api.get("/videos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const movieList: Movie[] = response.data;
        setMovies(movieList);

        if (movieList.length > 0) {
          const sortedByRating = [...movieList].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setFeaturedMovies(sortedByRating.slice(0, 5));
        }

      } catch (error) {
        console.error("Erro ao buscar filmes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, [router]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === featuredMovies.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1));
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>;
  }

  const currentMovie = featuredMovies[currentIndex];
  const matchScore = currentMovie?.rating ? Math.round(currentMovie.rating * 20) : null;

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Navbar />

      {currentMovie && (
        <div className="relative h-[56.25vw] max-h-[85vh] w-full group">
          
          <div className="absolute inset-0 w-full h-full">
             <Image
                key={currentMovie.id}
                src={getImageUrl(currentMovie.coverUrl)}
                alt={currentMovie.title}
                fill
                unoptimized
                className="object-cover brightness-[60%] transition-opacity duration-500"
                priority
              />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

          <div 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/60 rounded-full cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronLeft className="w-8 h-8" />
          </div>

          <div 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/60 rounded-full cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight className="w-8 h-8" />
          </div>

          <div className="absolute bottom-[35%] md:bottom-[25%] left-4 md:left-16 max-w-xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" key={`info-${currentMovie.id}`}>
            <h1 className="text-4xl md:text-6xl font-bold drop-shadow-xl">
              {currentMovie.title}
            </h1>

            {matchScore && (
              <div className="text-green-400 font-bold text-lg drop-shadow-md">
                {matchScore}% Relevante
              </div>
            )}

            <p className="text-white text-sm md:text-lg drop-shadow-md line-clamp-3 text-shadow-sm">
              {currentMovie.description || "Assista agora este sucesso exclusivo."}
            </p>
            
            <div className="flex flex-row gap-3 mt-4">
              <Link href={`/watch/${currentMovie.id}`}>
                <Button className="bg-white text-black hover:bg-white/80 text-lg px-8 py-6 font-bold flex items-center gap-2">
                  <Play className="fill-black w-6 h-6" /> Assistir
                </Button>
              </Link>
              
              <Button variant="secondary" className="bg-gray-500/70 text-white hover:bg-gray-500/50 text-lg px-8 py-6 font-bold flex items-center gap-2">
                <Info className="w-6 h-6" /> Mais Informações
              </Button>
            </div>
          </div>

          <div className="absolute bottom-40 right-16 flex gap-2 z-20">
            {featuredMovies.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                  idx === currentIndex ? "bg-white scale-110" : "bg-gray-500 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="pb-40 px-4 md:px-16 -mt-32 relative z-10">
        <h2 className="text-white text-xl md:text-2xl font-semibold mb-6 pl-1">
          Minha Lista
        </h2>
        
        {movies.length === 0 ? (
          <p className="text-gray-500">Nenhum filme disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}