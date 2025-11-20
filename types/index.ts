export interface Movie {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;     
  hlsManifest: string;  
  folderPath: string;   
  rating?: number;
}