import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import Link from "next/link";
import { ArrowRight, Building2, Truck, Flame } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Header />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
            <div className="absolute top-0 right-0 opacity-10">
              <Flame className="w-48 h-48 -mt-8 -mr-8" />
            </div>
            <div className="relative z-10 space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                SDMIS Terrain
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl">
                Application de gestion opérationnelle pour les équipes terrain
                du Service Départemental-Métropolitain d&apos;Incendie et de
                Secours.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Centres de secours */}
            <Card className="hover:shadow-lg transition-shadow border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>Centres de Secours</CardTitle>
                </div>
                <CardDescription>
                  Gestion des casernes et points d&apos;intérêt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Consultez la liste des centres de secours, leurs coordonnées
                  et localisations sur le territoire.
                </p>
                <Link href="/fire-stations">
                  <Button className="w-full" variant="default">
                    Voir les centres
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Véhicules */}
            <Card className="hover:shadow-lg transition-shadow border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>Véhicules</CardTitle>
                </div>
                <CardDescription>
                  Suivi en temps réel de la flotte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Suivez l&apos;état et la position des véhicules, filtrez par
                  type, statut ou centre d&apos;affectation.
                </p>
                <Link href="/vehicles">
                  <Button className="w-full" variant="default">
                    Voir les véhicules
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
