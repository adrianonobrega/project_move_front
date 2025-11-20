"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { Play, Info } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Movie } from "@/types";

export default function Home() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("netflix-token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchMovies() {
      try {
        const response = await axios.get("http://localhost:3000/videos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const movieList = response.data;
        setMovies(movieList);

        if (movieList.length > 0) {
          const randomIndex = Math.floor(Math.random() * movieList.length);
          setFeaturedMovie(movieList[randomIndex]);
        }
      } catch (error) {
        console.error("Erro ao buscar filmes:", error);

      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando catálogo...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Navbar />

      {/* --- DESTAQUE (BILLBOARD) --- */}
      {featuredMovie && (
        <div className="relative h-[56.25vw] max-h-[80vh] w-full">
          {/* Imagem de Fundo do Destaque */}
          <Image
            src={`http://localhost:3000${featuredMovie.coverUrl}`}
            alt={featuredMovie.title}
            fill
            className="object-cover brightness-[60%]"
            priority
          />
          
          {/* Gradiente inferior para misturar com a lista */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

          {/* Conteúdo do Destaque */}
          <div className="absolute bottom-[20%] left-4 md:left-16 max-w-xl p-4 space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold drop-shadow-xl">
              {featuredMovie.title}
            </h1>
            <p className="text-white text-sm md:text-lg drop-shadow-md line-clamp-3">
              {featuredMovie.description || "Assista agora este sucesso exclusivo da nossa plataforma."}
            </p>
            
            <div className="flex flex-row gap-3 mt-4">
              <Link href={`/watch/${featuredMovie.id}`}>
                <Button className="bg-white text-black hover:bg-white/80 text-lg px-8 py-6 font-bold flex items-center gap-2">
                  <Play className="fill-black w-6 h-6" /> Assistir
                </Button>
              </Link>
              
              <Button variant="secondary" className="bg-gray-500/70 text-white hover:bg-gray-500/50 text-lg px-8 py-6 font-bold flex items-center gap-2">
                <Info className="w-6 h-6" /> Mais Informações
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- LISTA DE FILMES (CARROUSSEL) --- */}
      <div className="pb-40 px-4 md:px-16 -mt-20 relative z-10">
        <h2 className="text-white text-xl md:text-2xl font-semibold mb-4">
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