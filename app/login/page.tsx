"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z.string().min(1, { message: "Digite sua senha." }),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email: values.email,
        password: values.password,
      });

      const { access_token, user } = response.data;

      Cookies.set("netflix-token", access_token, { expires: 0.25 }); // 6 horas
      Cookies.set("user-role", user.role);

      router.push("/");
      
    } catch (err: any) {
      console.error("Erro no login:", err);
      if (err.response?.status === 401) {
        setError("Email ou senha incorretos.");
      } else {
        setError("Erro ao conectar com o servidor. O Backend está rodando?");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black">
      <div className="absolute inset-0 z-0 opacity-50">
        <Image
          src="https://assets.nflxext.com/ffe/siteui/vlv3/c38a2d52-138e-48a3-ab68-36787ece46b3/eeb03fc9-99bd-4e4f-b3aa-41f6344a80fb/BR-pt-20240101-popsignuptwoweeks-perspective_alpha_website_large.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" /> {/* Máscara escura */}
      </div>

      <Card className="relative z-10 w-full max-w-md bg-black/75 border-none text-white backdrop-blur-sm p-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-6">Entrar</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Email" 
                        {...field} 
                        className="bg-[#333] border-none text-white h-12 rounded placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400"
                      />
                    </FormControl>
                    <FormMessage className="text-orange-500 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Senha" 
                        {...field} 
                        className="bg-[#333] border-none text-white h-12 rounded placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400"
                      />
                    </FormControl>
                    <FormMessage className="text-orange-500 text-xs" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-[#e50914] hover:bg-[#c11119] text-white font-bold h-12 mt-6"
                disabled={loading}
              >
                {loading ? "Carregando..." : "Entrar"}
              </Button>

              {error && (
                <div className="mt-4 p-3 bg-[#e87c03] rounded text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="mt-8 text-gray-400 text-sm">
                <div className="flex justify-between items-center">
                  <span>Lembre-se de mim</span>
                  <Link href="#" className="hover:underline">Precisa de ajuda?</Link>
                </div>
                <div className="mt-4">
                  Novo por aqui? <Link href="/register" className="text-white hover:underline">Assine agora.</Link>
                </div>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}