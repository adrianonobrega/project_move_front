"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LogOut, User, Search, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    Cookies.remove("netflix-token");
    Cookies.remove("user-role");
    router.push("/login");
    router.refresh();
  };

  if (!isMounted) return null;

  const token = Cookies.get("netflix-token");

  return (
    <nav 
      className={`w-full fixed top-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-black/95" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="px-4 md:px-16 py-4 flex flex-row items-center justify-between transition duration-500">
        
        <div className="flex items-center gap-8">
          {/* <Link href="/" className="text-red-600 text-3xl font-bold cursor-pointer">
            NETFLIX
          </Link> */}
          <div className="hidden md:flex flex-row gap-4 text-gray-300 text-sm">
            <Link href="/" className="hover:text-white transition font-medium">Início</Link>
            <Link href="#" className="hover:text-white transition">Séries</Link>
            <Link href="#" className="hover:text-white transition">Filmes</Link>
            <Link href="#" className="hover:text-white transition">Minha Lista</Link>
          </div>
        </div>

        <div className="flex flex-row items-center gap-6 text-white">
          <Search className="w-5 h-5 cursor-pointer hover:text-gray-300 transition" />
          <Bell className="w-5 h-5 cursor-pointer hover:text-gray-300 transition" />

          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer w-8 h-8 rounded hover:ring-2 hover:ring-white transition">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="bg-black border-gray-800 text-white w-56 mt-2">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-800">
                  <User className="mr-2 h-4 w-4" /> Gerenciar Perfis
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-white hover:bg-gray-800">
                  <LogOut className="mr-2 h-4 w-4" /> Sair da Netflix
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="destructive" size="sm">Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};