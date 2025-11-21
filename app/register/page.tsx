"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StatusModal } from "@/components/StatusModal";

const registerSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter no mínimo 3 caracteres." }),
  email: z.string().email({ message: "Digite um email válido." }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter no mínimo 8 caracteres." })
    .regex(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
      message: "A senha deve ter letra maiúscula, minúscula e número.",
    }),
  confirmPassword: z.string(),
  
  address: z.object({
    zipCode: z.string().min(8, "CEP inválido").max(9),
    street: z.string().min(1, "Rua obrigatória"),
    number: z.string().min(1, "Número obrigatório"),
    city: z.string().min(1, "Cidade obrigatória"),
    state: z.string().length(2, "Estado (UF) inválido"),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: {
        zipCode: "",
        street: "",
        number: "",
        city: "",
        state: "",
      },
    },
  });

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let cep = e.target.value.replace(/\D/g, "");
    
    form.setValue("address.zipCode", cep);

    if (cep.length === 8) {
      setCepLoading(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_VIACEP_URL}/${cep}/json/`);        
        if (response.data.erro) {
          form.setError("address.zipCode", { message: "CEP não encontrado." });
        } else {
          // Preenche o que veio (pode vir vazio se for CEP único)
          if (response.data.logradouro) {
             form.setValue("address.street", response.data.logradouro);
             form.clearErrors("address.street");
          }
          
          if (response.data.localidade) {
             form.setValue("address.city", response.data.localidade);
             form.clearErrors("address.city");
          }

          form.setValue("address.state", response.data.uf);
          form.clearErrors("address.state");
          
          // Se a rua veio preenchida, pula pro número. Se não, foca na rua.
          if (response.data.logradouro) {
             form.setFocus("address.number");
          } else {
             form.setFocus("address.street");
          }
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
        form.setError("address.zipCode", { message: "Erro ao buscar CEP." });
      } finally {
        setCepLoading(false);
      }
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);

    try {
      await api.post("/users", {
        name: values.name,
        email: values.email,
        password: values.password,
        address: values.address,
      });

      setModalType("success");
      setModalTitle("Conta Criada!");
      setModalMessage("Seu cadastro foi realizado com sucesso. Faça login para começar.");
      setModalOpen(true);

    } catch (error: any) {
      console.error(error);
      setModalType("error");
      setModalTitle("Erro ao criar conta");
      
      if (error.response?.status === 409) {
        setModalMessage("Este email já está cadastrado no sistema.");
      } else {
        setModalMessage(error.response?.data?.message || "Ocorreu um erro inesperado.");
      }
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalType === "success") {
      router.push("/login");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black py-10">
      
      <StatusModal 
        isOpen={modalOpen}
        onClose={handleModalClose}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        actionLabel={modalType === "success" ? "Ir para Login" : "Tentar Novamente"}
        onAction={handleModalClose}
      />

      <div className="absolute inset-0 z-0 opacity-50 fixed">
        <Image
          src="https://assets.nflxext.com/ffe/siteui/vlv3/c38a2d52-138e-48a3-ab68-36787ece46b3/eeb03fc9-99bd-4e4f-b3aa-41f6344a80fb/BR-pt-20240101-popsignuptwoweeks-perspective_alpha_website_large.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <Card className="relative z-10 w-full max-w-lg bg-black/80 border-none text-white backdrop-blur-sm p-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2 text-center">Criar Conta</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-4">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider border-b border-gray-700 pb-1">Dados Pessoais</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} className="bg-[#333] border-none text-white focus-visible:ring-red-600" />
                      </FormControl>
                      <FormMessage className="text-orange-500 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} className="bg-[#333] border-none text-white focus-visible:ring-red-600" />
                      </FormControl>
                      <FormMessage className="text-orange-500 text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Min 8 chars" {...field} className="bg-[#333] border-none text-white focus-visible:ring-red-600" />
                        </FormControl>
                        <FormMessage className="text-orange-500 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Repita a senha" {...field} className="bg-[#333] border-none text-white focus-visible:ring-red-600" />
                        </FormControl>
                        <FormMessage className="text-orange-500 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider border-b border-gray-700 pb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Endereço
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="address.zipCode"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="00000000" 
                              {...field} 
                              onChange={handleCepChange}
                              maxLength={8}
                              className="bg-[#333] border-none text-white focus-visible:ring-red-600 pr-8" 
                            />
                            {cepLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-3 text-gray-400" />}
                          </div>
                        </FormControl>
                        <FormMessage className="text-orange-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          {/* REMOVI O READONLY AQUI */}
                          <Input placeholder="Cidade" {...field} className="bg-[#333] border-none text-white focus-visible:ring-red-600" />
                        </FormControl>
                        <FormMessage className="text-orange-500 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Rua</FormLabel>
                        <FormControl>
                          {/* REMOVI O READONLY AQUI */}
                          <Input placeholder="Nome da Rua" {...field} className="bg-[#333] border-none text-white focus-visible:ring-red-600" />
                        </FormControl>
                        <FormMessage className="text-orange-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.number"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>Nº</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} className="bg-[#333] border-none text-white focus-visible:ring-red-600" />
                        </FormControl>
                        <FormMessage className="text-orange-500 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem className="hidden"> 
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#e50914] hover:bg-[#c11119] text-white font-bold h-12 mt-6 text-lg"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                {loading ? "Criando conta..." : "Finalizar Cadastro"}
              </Button>

              <div className="mt-6 text-gray-400 text-sm text-center">
                Já tem uma conta? <Link href="/login" className="text-white hover:underline ml-1">Entrar agora.</Link>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}