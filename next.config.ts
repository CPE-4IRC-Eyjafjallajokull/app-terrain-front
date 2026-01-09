import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Désactive l'optimisation des images pour éviter les problèmes de chargement
  },
};

export default nextConfig;
