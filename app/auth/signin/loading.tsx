"use client";

import { Flame, Loader2 } from "lucide-react";

export default function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500">
      <div className="text-center text-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 mx-auto">
          <Flame className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">SDMIS Terrain</h1>
          <div className="flex items-center justify-center gap-2 text-white/70">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Chargement...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
