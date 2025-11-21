"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UploadCloud, ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const uploadSchema = z.object({
  title: z.string().min(2, { message: "O título deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  videoFile: z.instanceof(File, { message: "O arquivo de vídeo é obrigatório." }),
  coverFile: z.instanceof(File).optional(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadPage() {
  const router = useRouter();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [serverError, setServerError] = useState("");

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    const role = Cookies.get("user-role");
    const token = Cookies.get("netflix-token");
    if (!token || role !== "ADMIN") {
      router.push("/");
    }
  }, [router]);

  const onSubmit = async (values: UploadFormValues) => {
    setStatus("uploading");
    setServerError("");

    const token = Cookies.get("netflix-token");

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("file", values.videoFile);
      
      if (values.coverFile) {
        formData.append("cover", values.coverFile);
      }

      await api.post("/videos/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 1000 * 60 * 30,
      });

      setStatus("success");
      setTimeout(() => router.push("/"), 3000);

    } catch (error: any) {
      console.error(error);
      setStatus("error");
      const message = error.response?.data?.message || error.message || "Erro ao conectar com o servidor.";
      
      if (error.response?.status === 413) {
        setServerError("Arquivo muito grande! O servidor backend recusou.");
      } else {
        setServerError(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        
        {status === "idle" && (
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white mb-6 pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Home
            </Button>
          </Link>
        )}

        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <UploadCloud className="w-6 h-6" /> Adicionar Novo Filme
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {status === "uploading" && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in">
                <Loader2 className="w-16 h-16 text-red-600 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Enviando...</h3>
                <p className="text-zinc-400 max-w-md">
                  Isso pode demorar dependendo do tamanho do vídeo. <br/>
                  Por favor, não feche a página.
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Upload Concluído!</h3>
                <p className="text-zinc-400">Redirecionando para a Home...</p>
              </div>
            )}

            {(status === "idle" || status === "error") && (
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
                            className="flex w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]" 
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
                            className="bg-black border-zinc-700 text-zinc-400 cursor-pointer file:bg-zinc-800 file:text-white file:border-0 file:mr-4 file:px-4 file:rounded-md hover:file:bg-zinc-700"
                            onChange={(event) => {
                              onChange(event.target.files && event.target.files[0]);
                            }}
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
                            className="bg-black border-zinc-700 text-zinc-400 cursor-pointer file:bg-zinc-800 file:text-white file:border-0 file:mr-4 file:px-4 file:rounded-md hover:file:bg-zinc-700"
                            onChange={(event) => {
                              onChange(event.target.files && event.target.files[0]);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  {status === "error" && (
                    <div className="p-4 bg-red-900/30 border border-red-900 rounded text-red-200 flex items-center gap-2">
                      <XCircle className="w-5 h-5 flex-shrink-0" /> 
                      <span className="text-sm font-medium">{serverError}</span>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold py-6 text-lg">
                    Fazer Upload
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}