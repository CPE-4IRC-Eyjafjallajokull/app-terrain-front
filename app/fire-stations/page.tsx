"use client";

import { useFireStations } from "@/hooks/useFireStations";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, RefreshCw, Flame, Siren } from "lucide-react";

export default function FireStationsPage() {
  const { fireStations, isLoading, error, refetch } = useFireStations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
            <div className="absolute top-0 right-0 opacity-10">
              <Flame className="w-48 h-48 -mt-8 -mr-8" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Siren className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Centres de Secours
                  </h1>
                </div>
                <p className="text-primary-foreground/80 max-w-md">
                  Gérez et visualisez l&apos;ensemble des centres de secours du
                  territoire SDMIS
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={refetch}
                disabled={isLoading}
                className="shadow-lg"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="pb-2">
                <CardDescription>Total des centres</CardDescription>
                <CardTitle className="text-3xl font-bold text-primary">
                  {isLoading ? "..." : fireStations.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardDescription>Départements couverts</CardDescription>
                <CardTitle className="text-3xl font-bold">
                  {isLoading
                    ? "..."
                    : new Set(fireStations.map((s) => s.zipcode.slice(0, 2)))
                        .size}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardDescription>Villes</CardDescription>
                <CardTitle className="text-3xl font-bold">
                  {isLoading
                    ? "..."
                    : new Set(fireStations.map((s) => s.city)).size}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Content */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Liste des centres</CardTitle>
                  <CardDescription>
                    {isLoading
                      ? "Chargement..."
                      : `${fireStations.length} centre(s) de secours enregistré(s)`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {error ? (
                <div className="text-center py-12 text-destructive">
                  <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Erreur: {error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    className="mt-4"
                  >
                    Réessayer
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
                  <p>Chargement des centres de secours...</p>
                </div>
              ) : fireStations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Aucun centre de secours trouvé</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold">Nom</TableHead>
                      <TableHead className="font-semibold">Adresse</TableHead>
                      <TableHead className="font-semibold">
                        Code Postal
                      </TableHead>
                      <TableHead className="font-semibold">Ville</TableHead>
                      <TableHead className="font-semibold">
                        Coordonnées
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fireStations.map((station) => (
                      <TableRow
                        key={station.interest_point_id}
                        className="hover:bg-primary/5 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            {station.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {station.address}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            {station.zipcode}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {station.city}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md w-fit">
                            <MapPin className="w-3 h-3 text-primary" />
                            {station.latitude.toFixed(4)},{" "}
                            {station.longitude.toFixed(4)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
