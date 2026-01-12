"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  X,
  MapPin,
  Clock,
  Truck,
  AlertTriangle,
  Shield,
  Loader2,
  CheckCircle,
  Layers,
} from "lucide-react";
import type {
  Incident,
  IncidentEngagements,
  VehicleType,
} from "@/lib/incidents/types";
import { ReinforcementDialog } from "./reinforcement-dialog";

type IncidentDetailProps = {
  incident: Incident;
  engagements: IncidentEngagements | null;
  vehicleTypes: VehicleType[];
  isLoadingEngagements: boolean;
  onClose: () => void;
  onReinforcementSuccess?: () => void;
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPhaseStatusBadge(phase: { ended_at: string | null }) {
  if (phase.ended_at) {
    return (
      <Badge variant="secondary" className="text-xs">
        Terminée
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs">
      <CheckCircle className="w-3 h-3 mr-1" />
      En cours
    </Badge>
  );
}

export function IncidentDetail({
  incident,
  engagements,
  vehicleTypes,
  isLoadingEngagements,
  onClose,
  onReinforcementSuccess,
}: IncidentDetailProps) {
  const [isReinforcementDialogOpen, setIsReinforcementDialogOpen] =
    useState(false);

  // Check if incident is active (has at least one active phase)
  const hasActivePhases = incident.phases.some((phase) => !phase.ended_at);
  const activePhases = incident.phases.filter((phase) => !phase.ended_at);
  const isIncidentEnded = !!incident.ended_at;

  // Get vehicle count
  const vehicleCount = engagements?.vehicle_assignments?.length || 0;
  const activeVehicleCount =
    engagements?.vehicle_assignments?.filter((a) => !a.unassigned_at).length ||
    0;

  return (
    <>
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Détail de l&apos;incident
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  ID: {incident.incident_id.slice(0, 8)}...
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[550px]">
            <div className="p-4 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                {isIncidentEnded ? (
                  <Badge variant="secondary" className="text-sm">
                    Incident terminé
                  </Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-700 border border-orange-200 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Incident en cours
                  </Badge>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  Localisation
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  {incident.address && (
                    <p className="font-medium">{incident.address}</p>
                  )}
                  {(incident.zipcode || incident.city) && (
                    <p className="text-sm text-muted-foreground">
                      {[incident.zipcode, incident.city]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  )}
                  {incident.latitude && incident.longitude && (
                    <p className="text-xs text-muted-foreground">
                      {incident.latitude.toFixed(6)},{" "}
                      {incident.longitude.toFixed(6)}
                    </p>
                  )}
                  {!incident.address && !incident.city && (
                    <p className="text-sm text-muted-foreground italic">
                      Adresse non renseignée
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {incident.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlertTriangle className="w-4 h-4" />
                    Description
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm">{incident.description}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Dates
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Créé le</span>
                    <span className="font-medium">
                      {formatDate(incident.created_at)}
                    </span>
                  </div>
                  {incident.ended_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Terminé le</span>
                      <span className="font-medium">
                        {formatDate(incident.ended_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Phases */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Layers className="w-4 h-4" />
                    Phases ({incident.phases.length})
                  </div>
                </div>

                {incident.phases.length === 0 ? (
                  <div className="bg-muted/50 rounded-lg p-3 text-center text-sm text-muted-foreground">
                    Aucune phase définie
                  </div>
                ) : (
                  <div className="space-y-2">
                    {incident.phases
                      .sort((a, b) => a.priority - b.priority)
                      .map((phase) => (
                        <div
                          key={phase.incident_phase_id}
                          className="bg-muted/50 rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                #{phase.priority}
                              </Badge>
                              <span className="font-medium text-sm">
                                {phase.phase_type.label ||
                                  phase.phase_type.code}
                              </span>
                            </div>
                            {getPhaseStatusBadge(phase)}
                          </div>
                          {phase.started_at && (
                            <p className="text-xs text-muted-foreground">
                              Démarré à {formatDateShort(phase.started_at)}
                              {phase.ended_at &&
                                ` - Terminé à ${formatDateShort(phase.ended_at)}`}
                            </p>
                          )}
                          {phase.vehicle_assignments.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {phase.vehicle_assignments.length} véhicule(s)
                              assigné(s)
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Engaged Vehicles */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Truck className="w-4 h-4" />
                  Véhicules engagés ({activeVehicleCount}/{vehicleCount})
                </div>

                {isLoadingEngagements ? (
                  <div className="bg-muted/50 rounded-lg p-6 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Chargement...
                    </span>
                  </div>
                ) : !engagements ||
                  engagements.vehicle_assignments.length === 0 ? (
                  <div className="bg-muted/50 rounded-lg p-3 text-center text-sm text-muted-foreground">
                    Aucun véhicule engagé
                  </div>
                ) : (
                  <div className="space-y-2">
                    {engagements.vehicle_assignments.map((assignment) => (
                      <div
                        key={assignment.vehicle_assignment_id}
                        className={`bg-muted/50 rounded-lg p-3 space-y-1 ${
                          assignment.unassigned_at ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">
                              {assignment.vehicle.immatriculation}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {assignment.vehicle.vehicle_type.code}
                            </Badge>
                          </div>
                          {assignment.unassigned_at ? (
                            <Badge variant="secondary" className="text-xs">
                              Désengagé
                            </Badge>
                          ) : assignment.validated_at ? (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              Validé
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                              En attente
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Assigné le {formatDate(assignment.assigned_at)}
                        </p>
                        {assignment.phase_type && (
                          <p className="text-xs text-muted-foreground">
                            Phase:{" "}
                            {assignment.phase_type.label ||
                              assignment.phase_type.code}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Reinforcement Button */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  Demander des renforts
                </div>

                {!hasActivePhases ? (
                  <div className="bg-muted/50 rounded-lg p-3 text-center text-sm text-muted-foreground">
                    <p>Aucune phase active pour cet incident.</p>
                    <p className="text-xs mt-1">
                      Les demandes de renfort ne peuvent être faites que sur des
                      phases actives.
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsReinforcementDialogOpen(true)}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Demander des renforts
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Reinforcement Dialog */}
      <ReinforcementDialog
        open={isReinforcementDialogOpen}
        onOpenChange={setIsReinforcementDialogOpen}
        phases={activePhases}
        vehicleTypes={vehicleTypes}
        onSuccess={onReinforcementSuccess}
      />
    </>
  );
}
