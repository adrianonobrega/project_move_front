"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Trash2, Edit, ArrowLeft, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api, getImageUrl } from "@/lib/api";
import { Movie } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusModal } from "@/components/StatusModal";

export default function AdminDashboard() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [movieToDelete, setMovieToDelete] = useState<string | null>(null);

  useEffect(() => {
    const role = Cookies.get("user-role");
    const token = Cookies.get("netflix-token");

    if (!token || role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchMovies(token);
  }, [router]);

  const fetchMovies = async (token: string) => {
    try {
      const res = await api.get("/videos?limit=100", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovies(res.data.data || res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id: string) => {
    setMovieToDelete(id);
    setModalType("warning");
    setModalTitle("Tem certeza?");
    setModalMessage("Essa ação é irreversível. O filme, o vídeo e a capa serão apagados permanentemente.");
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!movieToDelete) return;

    const token = Cookies.get("netflix-token");
    try {
      await api.delete(`/videos/${movieToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMovies((prev) => prev.filter((m) => m.id !== movieToDelete));
      
      setModalOpen(false);
      
      setTimeout(() => {
        setModalType("success");
        setModalTitle("Excluído");
        setModalMessage("O filme foi removido com sucesso.");
        setMovieToDelete(null);
        setModalOpen(true);
      }, 300);

    } catch (error) {
      setModalType("error");
      setModalTitle("Erro");
      setModalMessage("Não foi possível excluir o filme.");
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      
      <StatusModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        actionLabel={modalType === "warning" ? "Sim, Excluir" : "Ok"}
        onAction={modalType === "warning" ? confirmDelete : undefined}
        cancelLabel="Cancelar"
        onCancel={modalType === "warning" ? () => setModalOpen(false) : undefined}
      />

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-red-600">Gerenciar Catálogo</h1>
          </div>
          
          <Link href="/admin/upload">
            <Button className="bg-red-600 hover:bg-red-700 font-bold">
              <Plus className="mr-2 h-4 w-4" /> Novo Filme
            </Button>
          </Link>
        </div>

        {movies.length === 0 ? (
          <div className="text-center text-gray-500 py-20">Nenhum filme encontrado.</div>
        ) : (
          <div className="grid gap-4">
            {movies.map((movie) => (
              <Card key={movie.id} className="bg-zinc-900 border-zinc-800 flex flex-row items-center p-4 gap-4 group hover:border-zinc-700 transition">
                <div className="relative w-16 h-24 flex-shrink-0 bg-black rounded overflow-hidden">
                  <Image 
                    src={getImageUrl(movie.coverUrl)} 
                    alt={movie.title} 
                    fill 
                    unoptimized 
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white truncate">{movie.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-1">{movie.description || "Sem descrição"}</p>
                  <div className="mt-2 text-xs text-gray-600 font-mono">{movie.id}</div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/edit/${movie.id}`}>
                    <Button variant="outline" size="icon" className="border-zinc-600 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-white transition">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Button 
                    variant="destructive" 
                    size="icon"
                    className="bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white border border-transparent hover:border-red-500 transition"
                    onClick={() => requestDelete(movie.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}