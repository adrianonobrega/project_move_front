"use client";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useRef } from "react";

export default function WatchPage() {
  const playerRef = useRef(null);

  // URL do seu vídeo no Backend
  const videoUrl = "http://localhost:3000/uploads/movies/adriano_teste/index.m3u8";

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src: videoUrl,
      type: "application/x-mpegURL"
    }]
  };

  const handlePlayerReady = (player: any) => {
    playerRef.current = player;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <h1 className="text-2xl mb-5">Teste de Player HLS</h1>
      
      <div className="w-full max-w-3xl border border-gray-700">
        <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
      </div>
      
      <p className="mt-4 text-gray-400">
        Testando para ver se reproduz o video.
      </p>
    </div>
  );
}