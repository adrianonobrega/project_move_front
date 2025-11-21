"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { LogOut, User, Search, Bell, UploadCloud, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Settings } from "lucide-react";
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
import { Input } from "@/components/ui/input";

export const Navbar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setShowSearch(true);
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() !== "") {
      router.push(`/?search=${value}`);
    } else {
      router.push("/");
    }
  };

  const toggleSearch = () => {
    console.log("Clicou na lupa! Estado anterior:", showSearch); // Debug no Console F12
    setShowSearch((prev) => !prev);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearch(false);
    router.push("/");
  };

  const handleLogout = () => {
    Cookies.remove("netflix-token");
    Cookies.remove("user-role");
    router.push("/login");
  };

  if (!isMounted) return null;

  const token = Cookies.get("netflix-token");
  const role = Cookies.get("user-role");

  return (
    <nav 
      className={`w-full fixed top-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-black/95" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="px-4 md:px-16 py-4 flex flex-row items-center justify-between transition duration-500">
        
        <div className="flex items-center gap-8">
          <Link href="/" className="text-red-600 text-3xl font-bold cursor-pointer">
            NETFLIX
          </Link>
          <div className="hidden md:flex flex-row gap-4 text-gray-300 text-sm">
            <Link href="/" className="hover:text-white transition font-medium">Início</Link>
            <Link href="#" className="hover:text-white transition">Séries</Link>
            <Link href="#" className="hover:text-white transition">Filmes</Link>
          </div>
        </div>

        <div className="flex flex-row items-center gap-6 text-white">
          
          <div className={`flex items-center transition-all duration-300 ${
            showSearch ? "border border-white bg-black/50 px-2 py-1 rounded" : ""
          }`}>
            
            <Search 
              onClick={toggleSearch}
              className="w-6 h-6 cursor-pointer hover:text-gray-300 transition" 
            />
            
            <Input 
              ref={inputRef}
              className={`transition-all duration-300 ease-in-out bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 ${
                showSearch 
                  ? "w-48 md:w-64 ml-2 opacity-100 border-none"
                  : "w-0 p-0 border-0 opacity-0" 
              }`}
              placeholder="Títulos, gente e gêneros"
              value={searchQuery}
              onChange={handleSearch}
              onBlur={() => !searchQuery && setShowSearch(false)}
            />
            
            {showSearch && searchQuery && (
              <X onClick={clearSearch} className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white ml-1" />
            )}
          </div>

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
                
                {role === "ADMIN" && (
                  <>
                    <Link href="/admin/upload">
                      <DropdownMenuItem className="cursor-pointer hover:bg-gray-800">
                        <UploadCloud className="mr-2 h-4 w-4 text-red-500" /> Adicionar Filme
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="bg-gray-700" />

                    <Link href="/admin/dashboard">
                      <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white">
                        <Settings className="mr-2 h-4 w-4 text-red-500" /> Painel Admin
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="bg-gray-700" />
                  </>
                )}

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