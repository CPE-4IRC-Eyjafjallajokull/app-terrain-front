"use client";

import { use } from "react";
import { useIncidentDetail } from "@/hooks/useIncidentDetail";
import { Header } from "@/components/header";
import { VehicleEngagementList } from "@/components/incidents/vehicle-engagement-list";
import { CasualtiesSection } from "@/components/incidents/casualties-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  ArrowLeft,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: Promise<{ incidentId: string }>;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string, endedAt: string | null) {
  if (endedAt) {
    return (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1"
      >
        <CheckCircle className="w-3 h-3" />
        Terminé
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1"
    >
      <AlertTriangle className="w-3 h-3" />
      En cours
    </Badge>
  );
}

export default function IncidentDetailPage({ params }: PageProps) {
  const { incidentId } = use(params);

  const {
    situation,
    engagements,
    casualties,
    casualtyTypes,
    casualtyStatuses,
    isLoading,
    error,
    isSubmitting,
    refetch,
    addCasualty,
    editCasualty,
    removeCasualty,
  } = useIncidentDetail(incidentId);

  const incident = situation?.incident;
  const phases = situation?.phases_active || [];
  const firstPhaseId = phases[0]?.incident_phase_id || "";

  const fullAddress = incident
    ? [incident.address, incident.zipcode, incident.city]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/incidents">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour aux incidents
            </Button>
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {!isLoading && !error && incident && (
          <div className="space-y-6">
            {/* Incident Header Card */}
            <Card className="border-primary/10 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(incident.status, incident.ended_at)}
                      <span className="text-sm font-mono opacity-80">
                        #{incident.incident_id.slice(0, 8)}
                      </span>
                    </div>

                    {fullAddress && (
                      <div className="flex items-start gap-2 text-lg">
                        <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span>{fullAddress}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={refetch}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Actualiser
                  </Button>
                </div>
              </div>

              <CardContent className="pt-4 space-y-3">
                {/* Description */}
                {incident.description && (
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <p>{incident.description}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Créé le {formatDate(incident.created_at)}</span>
                  </div>
                  {incident.ended_at && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Terminé le {formatDate(incident.ended_at)}</span>
                    </div>
                  )}
                </div>

                {/* Active phases */}
                {phases.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {phases.map((phase) => (
                      <Badge
                        key={phase.incident_phase_id}
                        variant="outline"
                        className="bg-primary/5 border-primary/20"
                      >
                        {phase.phase_label || phase.phase_code}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicles Engaged */}
            <VehicleEngagementList
              assignments={engagements?.vehicle_assignments || []}
            />

            {/* Casualties Section */}
            <CasualtiesSection
              casualties={casualties}
              casualtyTypes={casualtyTypes}
              casualtyStatuses={casualtyStatuses}
              incidentPhaseId={firstPhaseId}
              onAdd={addCasualty}
              onEdit={editCasualty}
              onDelete={removeCasualty}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </main>
    </div>
  );
}
