"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { ArrowLeft, Calendar, Star } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ReviewSection } from "@/components/ReviewSection";
import { Movie } from "@/types";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/api";

export default function WatchPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const playerRef = useRef(null);

  useEffect(() => {
    async function fetchMovie() {
      const token = Cookies.get("netflix-token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/videos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMovie(data);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error(error);
      }
    }
    if (id) fetchMovie();
  }, [id, router]);

  useEffect(() => {
    if (movie && window.location.hash === "#info") {
      setTimeout(() => {
        const element = document.getElementById("info");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, [movie]); 

  if (!movie) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>;

  const videoUrl = `${process.env.NEXT_PUBLIC_API_URL}${movie.folderPath}/${movie.hlsManifest}`;
  
  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    poster: getImageUrl(movie.coverUrl),
    sources: [{
      src: videoUrl,
      type: "application/x-mpegURL"
    }]
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="w-full p-4 flex items-center gap-4 bg-black z-20">
        <Link href="/">
          <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-zinc-800">
            <ArrowLeft className="mr-2 h-5 w-5" /> Voltar para Home
          </Button>
        </Link>
      </header>

      <div className="w-full bg-black shadow-2xl shadow-red-900/10 relative">
        <div className="max-w-[1600px] mx-auto aspect-video border-b border-zinc-800">
          <VideoPlayer options={videoJsOptions} onReady={(player) => (playerRef.current = player)} />
        </div>
      </div>

      <div id="info" className="max-w-6xl mx-auto w-full px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">{movie.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1 text-green-400 font-bold">
                <Star className="w-4 h-4 fill-green-400" /> {movie.rating ? movie.rating.toFixed(1) : "N/A"}
              </span>
              <span className="border border-gray-600 px-2 py-0.5 rounded text-xs">HD</span>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">{movie.description}</p>
          </div>
        </div>
        <div className="border-t border-zinc-800 mt-12 pt-8">
           <ReviewSection movieId={movie.id} />
        </div>
      </div>
    </div>
  );
}