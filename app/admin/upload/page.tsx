"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UploadCloud, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StatusModal } from "@/components/StatusModal"; 

const uploadSchema = z.object({
  title: z.string().min(2, { message: "O título deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  videoFile: z.instanceof(File, { message: "O arquivo de vídeo é obrigatório." }),
  coverFile: z.instanceof(File).optional(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    const role = Cookies.get("user-role");
    const token = Cookies.get("netflix-token");
    if (!token || role !== "ADMIN") {
      router.push("/");
    }
  }, [router]);

  const onSubmit = async (values: UploadFormValues) => {
    setLoading(true);
    const token = Cookies.get("netflix-token");

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("file", values.videoFile);
      if (values.coverFile) formData.append("cover", values.coverFile);

      await api.post("/videos/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setModalType("success");
      setModalTitle("Upload Concluído!");
      setModalMessage("O filme foi enviado e já está sendo processado. Ele aparecerá na Home em breve.");
      setModalOpen(true);

    } catch (error: any) {
      console.error(error);
      setModalType("error");
      setModalTitle("Falha no Upload");
      setModalMessage(error.response?.data?.message || "Ocorreu um erro ao conectar com o servidor. Tente novamente.");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalAction = () => {
    setModalOpen(false);
    if (modalType === "success") {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      
      <StatusModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        actionLabel={modalType === "success" ? "Voltar para Home" : "Tentar Novamente"}
        onAction={handleModalAction}
      />

      <div className="w-full max-w-2xl">
        <Link href="/">
          <Button variant="ghost" className="text-gray-400 hover:text-white mb-6 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Home
          </Button>
        </Link>

        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <UploadCloud className="w-6 h-6" /> Adicionar Novo Filme
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {loading && (
              <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                <Loader2 className="w-16 h-16 text-red-600 animate-spin mb-4" />
                <p className="text-white font-bold text-lg">Enviando arquivo...</p>
                <p className="text-zinc-400 text-sm">Não feche esta janela.</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Título do Filme</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Matrix" {...field} className="bg-black border-zinc-700 text-white" />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Sinopse</FormLabel>
                      <FormControl>
                        <textarea 
                          placeholder="Descrição do filme..." 
                          {...field} 
                          className="flex w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-600 min-h-[100px]" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoFile"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel className="text-white">Vídeo (Qualquer formato)</FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          type="file"
                          accept="video/*"
                          className="bg-black border-zinc-700 text-zinc-400 file:bg-zinc-800 file:text-white"
                          onChange={(event) => onChange(event.target.files && event.target.files[0])}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverFile"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel className="text-white">Capa (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          type="file"
                          accept="image/*"
                          className="bg-black border-zinc-700 text-zinc-400 file:bg-zinc-800 file:text-white"
                          onChange={(event) => onChange(event.target.files && event.target.files[0])}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 font-bold py-6 text-lg">
                  {loading ? "Enviando..." : "Fazer Upload"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}