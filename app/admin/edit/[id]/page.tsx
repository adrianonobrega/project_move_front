"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StatusModal } from "@/components/StatusModal";

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    const role = Cookies.get("user-role");
    const token = Cookies.get("netflix-token");
    if (!token || role !== "ADMIN") {
      router.push("/");
      return;
    }

    async function fetchMovie() {
      try {
        const res = await api.get(`/videos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTitle(res.data.title);
        setDescription(res.data.description || "");
      } catch (error) {
        console.error(error);
        router.push("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
  }, [id, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = Cookies.get("netflix-token");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      
      if (coverFile) {
        formData.append("cover", coverFile);
      }

      await api.patch(`/videos/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setModalType("success");
      setModalTitle("Atualizado!");
      setModalMessage("As alterações foram salvas com sucesso.");
      setModalOpen(true);

    } catch (error: any) {
      console.error(error);
      setModalType("error");
      setModalTitle("Erro");
      setModalMessage("Não foi possível salvar as alterações.");
      setModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalType === "success") {
      router.push("/admin/dashboard");
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      
      <StatusModal 
        isOpen={modalOpen}
        onClose={handleModalClose}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        actionLabel={modalType === "success" ? "Voltar para Dashboard" : "Tentar Novamente"}
        onAction={handleModalClose}
      />

      <div className="w-full max-w-2xl">
        <Link href="/admin/dashboard">
          <Button variant="ghost" className="text-gray-400 hover:text-white mb-6 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Dashboard
          </Button>
        </Link>

        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <Save className="w-6 h-6" /> Editar Filme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white">Título</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black border-zinc-700 text-white focus-visible:ring-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Sinopse</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex w-full min-h-[100px] rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Trocar Capa (Opcional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="bg-black border-zinc-700 text-zinc-400 file:bg-zinc-800 file:text-white cursor-pointer"
                />
                <p className="text-xs text-zinc-500">Deixe vazio para manter a capa atual.</p>
              </div>

              <Button type="submit" disabled={saving} className="w-full bg-red-600 hover:bg-red-700 font-bold py-6 text-lg mt-4">
                {saving ? <Loader2 className="animate-spin mr-2"/> : null}
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}