import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
};