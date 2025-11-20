"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api"; 
import Cookies from "js-cookie";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ReviewSectionProps {
  movieId: string;
}

export const ReviewSection = ({ movieId }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [movieId]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/movie/${movieId}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Erro ao buscar reviews", error);
    }
  };

  const handleSubmit = async () => {
    const token = Cookies.get("netflix-token");
    if (!token) {
      alert("Faça login para avaliar!");
      return;
    }
    if (myRating === 0) {
      alert("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    setLoading(true);
    try {
      await api.post(
        "/reviews",
        {
          movieId,
          rating: myRating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setComment("");
      setMyRating(0);
      fetchReviews();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao enviar avaliação.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 max-w-4xl mx-auto px-4">
      <h3 className="text-2xl font-bold text-white mb-6">Avaliações e Comentários</h3>

      <div className="bg-zinc-900 p-6 rounded-lg mb-8 border border-zinc-800">
        <h4 className="text-lg font-semibold text-gray-200 mb-4">O que você achou?</h4>
        
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer transition-colors ${
                star <= (hoverRating || myRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-600"
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setMyRating(star)}
            />
          ))}
        </div>

        <textarea
          className="w-full bg-black text-white p-3 rounded border border-zinc-700 focus:border-red-600 outline-none min-h-[100px]"
          placeholder="Escreva seu comentário aqui..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 font-bold"
          >
            {loading ? "Enviando..." : "Publicar Avaliação"}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Seja o primeiro a avaliar este filme!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-zinc-900/50 p-4 rounded-md border border-zinc-800/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-red-900 text-white text-xs">
                      {review.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-white">{review.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
              
              <p className="mt-3 text-gray-300 text-sm">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};