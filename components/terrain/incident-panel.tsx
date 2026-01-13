"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  Shield,
  Truck,
  Navigation,
  ExternalLink,
  Loader2,
  CheckCircle,
  Flame,
} from "lucide-react";
import type {
  Incident,
  IncidentEngagements,
  IncidentCasualties,
  VehicleType,
  CasualtyCreate,
  CasualtyUpdate,
  Reinforcement,
  ReinforcementVehicleRequest,
} from "@/lib/incidents/types";
import { ReinforcementDialog } from "@/components/incidents/reinforcement-dialog";
import { CasualtiesSection } from "@/components/incidents/casualties-section";
import { toast } from "sonner";

type IncidentPanelProps = {
  incident: Incident;
  engagements: IncidentEngagements | null;
  casualties: IncidentCasualties | null;
  vehicleTypes: VehicleType[];
  currentVehicleId: string;
  onCasualtyUpdate: () => void;
  onReinforcementSuccess: () => void;
};

export function IncidentPanel({
  incident,
  engagements,
  casualties,
  vehicleTypes,
  currentVehicleId,
  onCasualtyUpdate,
  onReinforcementSuccess,
}: IncidentPanelProps) {
  const [isReinforcementOpen, setIsReinforcementOpen] = useState(false);
  const [casualtyTypes, setCasualtyTypes] = useState<
    { casualty_type_id: string; label: string | null; code: string | null }[]
  >([]);
  const [casualtyStatuses, setCasualtyStatuses] = useState<
    { casualty_status_id: string; label: string }[]
  >([]);
  const [isLoadingCasualtyData, setIsLoadingCasualtyData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reinforcements, setReinforcements] = useState<Reinforcement[]>([]);
  const [reinforcementRequests, setReinforcementRequests] = useState<
    Record<string, ReinforcementVehicleRequest[]>
  >({});
  const [areReinforcementsLoaded, setAreReinforcementsLoaded] =
    useState(false);
  const [isLoadingReinforcements, setIsLoadingReinforcements] =
    useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get active phases
  const activePhases = incident.phases?.filter((p) => !p.ended_at) || [];
  const activePhaseId = activePhases[0]?.incident_phase_id || "";

  // Get vehicle count from engagements
  const vehicleCount = engagements?.vehicle_assignments?.length || 0;
  const activeVehicleCount =
    engagements?.vehicle_assignments?.filter((a) => !a.unassigned_at).length ||
    0;

  // Get casualty count
  const casualtyCount = casualties?.stats?.total || 0;

  useEffect(() => {
    setReinforcements([]);
    setReinforcementRequests({});
    setAreReinforcementsLoaded(false);
  }, [incident.incident_id]);

  const fleetVehicles = useMemo(() => {
    const assignments = incident.phases.flatMap((phase) =>
      phase.vehicle_assignments.filter((assignment) => !assignment.unassigned_at),
    );

    const uniqueAssignments = new Map<string, (typeof assignments)[number]>();

    assignments.forEach((assignment) => {
      if (assignment.vehicle_id === currentVehicleId) return;
      if (!uniqueAssignments.has(assignment.vehicle_id)) {
        uniqueAssignments.set(assignment.vehicle_id, assignment);
      }
    });

    return Array.from(uniqueAssignments.values()).map((assignment) => {
      const engagement = engagements?.vehicle_assignments?.find(
        (item) => item.vehicle_id === assignment.vehicle_id,
      );

      return {
        vehicleId: assignment.vehicle_id,
        immatriculation: engagement?.vehicle.immatriculation || null,
        typeCode: engagement?.vehicle.vehicle_type.code || null,
        assignedAt: assignment.assigned_at || null,
        validatedAt: assignment.validated_at || null,
      };
    });
  }, [incident.phases, engagements, currentVehicleId]);

  // Load casualty types and statuses
  const loadCasualtyData = async () => {
    if (casualtyTypes.length > 0 && casualtyStatuses.length > 0) return;

    setIsLoadingCasualtyData(true);
    try {
      const [typesRes, statusesRes] = await Promise.all([
        fetch("/api/casualties/types"),
        fetch("/api/casualties/statuses"),
      ]);

      if (typesRes.ok) {
        const types = await typesRes.json();
        setCasualtyTypes(types);
      }

      if (statusesRes.ok) {
        const statuses = await statusesRes.json();
        setCasualtyStatuses(statuses);
      }
    } catch (err) {
      console.error("Error loading casualty data:", err);
    } finally {
      setIsLoadingCasualtyData(false);
    }
  };

  const getVehicleTypeLabel = (vehicleTypeId: string) => {
    const type = vehicleTypes.find(
      (vehicleType) => vehicleType.vehicle_type_id === vehicleTypeId,
    );
    if (!type) return vehicleTypeId;
    return type.label ? `${type.code} - ${type.label}` : type.code;
  };

  const loadReinforcementData = async (force = false) => {
    if (areReinforcementsLoaded && !force) return;
    const phasesForReinforcements = incident.phases;
    if (phasesForReinforcements.length === 0) {
      setReinforcements([]);
      setReinforcementRequests({});
      setAreReinforcementsLoaded(true);
      return;
    }

    setIsLoadingReinforcements(true);
    try {
      const reinforcementResponses = await Promise.all(
        phasesForReinforcements.map((phase) =>
          fetch(
            `/api/incidents/reinforcements?incident_phase_id=${phase.incident_phase_id}`,
          ),
        ),
      );

      const reinforcementPayloads = await Promise.all(
        reinforcementResponses.map((response) =>
          response.ok ? response.json() : [],
        ),
      );

      const mergedReinforcements = reinforcementPayloads.flat();
      const reinforcementMap = new Map<string, Reinforcement>();
      mergedReinforcements.forEach((reinforcement: Reinforcement) => {
        reinforcementMap.set(reinforcement.reinforcement_id, reinforcement);
      });

      const uniqueReinforcements = Array.from(reinforcementMap.values());
      setReinforcements(uniqueReinforcements);

      const requestEntries = await Promise.all(
        uniqueReinforcements.map(async (reinforcement) => {
          const response = await fetch(
            `/api/incidents/reinforcement-vehicle-requests?reinforcement_id=${reinforcement.reinforcement_id}`,
          );
          const requests = response.ok ? await response.json() : [];
          return [reinforcement.reinforcement_id, requests] as const;
        }),
      );

      setReinforcementRequests(Object.fromEntries(requestEntries));
    } catch (err) {
      console.error("Error loading reinforcement data:", err);
    } finally {
      setAreReinforcementsLoaded(true);
      setIsLoadingReinforcements(false);
    }
  };

  const getReinforcementStatus = (reinforcement: Reinforcement) => {
    if (reinforcement.rejected_at) {
      return { label: "Rejetée", className: "bg-red-100 text-red-700" };
    }
    if (reinforcement.validated_at) {
      return { label: "Validée", className: "bg-green-100 text-green-700" };
    }
    return { label: "En attente", className: "bg-yellow-100 text-yellow-700" };
  };

  // Handle add casualty
  const handleAddCasualty = async (data: CasualtyCreate) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/casualties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Erreur lors de l'ajout");

      toast.success("Victime ajoutée");
      onCasualtyUpdate();
    } catch (err) {
      toast.error("Erreur lors de l'ajout de la victime");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit casualty
  const handleEditCasualty = async (
    casualtyId: string,
    data: CasualtyUpdate,
  ) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/casualties/${casualtyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Erreur lors de la modification");

      toast.success("Victime modifiée");
      onCasualtyUpdate();
    } catch (err) {
      toast.error("Erreur lors de la modification");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete casualty
  const handleDeleteCasualty = async (casualtyId: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/casualties/${casualtyId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      toast.success("Victime supprimée");
      onCasualtyUpdate();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open navigation
  const openNavigation = () => {
    if (incident.latitude && incident.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`;
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <Card className="border-orange-200">
        <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-transparent border-b border-orange-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Incident en cours</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Déclaré le {formatDate(incident.created_at)}
                </CardDescription>
              </div>
            </div>
            {activePhases.length > 0 && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                En cours
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">
                  {incident.address || "Adresse non renseignée"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {incident.zipcode} {incident.city}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {incident.description && (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm">{incident.description}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {activeVehicleCount} / {vehicleCount}
                </p>
                <p className="text-xs text-blue-700">Véhicules actifs</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  {casualtyCount}
                </p>
                <p className="text-xs text-orange-700">Victimes</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Active Phases */}
          {activePhases.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Phases actives
              </p>
              <div className="space-y-1">
                {activePhases.map((phase) => (
                  <Badge
                    key={phase.incident_phase_id}
                    variant="secondary"
                    className="mr-1"
                  >
                    {phase.phase_type?.label || phase.phase_type?.code}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Fleet */}
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" />
              Flotte
            </p>
            {fleetVehicles.length === 0 ? (
              <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground text-center">
                Aucun autre véhicule assigné à cet incident
              </div>
            ) : (
              <div className="space-y-2">
                {fleetVehicles.map((vehicle) => (
                  <div
                    key={vehicle.vehicleId}
                    className="rounded-lg border bg-muted/30 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm">
                          {vehicle.immatriculation ||
                            `Véhicule ${vehicle.vehicleId.slice(0, 6)}`}
                        </span>
                        {vehicle.typeCode && (
                          <Badge variant="outline" className="text-xs">
                            {vehicle.typeCode}
                          </Badge>
                        )}
                      </div>
                      <Badge
                        className={
                          vehicle.validatedAt
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {vehicle.validatedAt ? "Validé" : "En attente"}
                      </Badge>
                    </div>
                    {vehicle.assignedAt && (
                      <p className="text-xs text-muted-foreground">
                        Assigné le {formatDate(vehicle.assignedAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Casualties Management */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-auto"
              onClick={loadCasualtyData}
            >
              <Users className="w-4 h-4 mr-2 text-orange-500" />
              <span className="font-medium">Gestion des victimes</span>
              {isLoadingCasualtyData && (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              )}
            </Button>

            {casualtyTypes.length > 0 && casualtyStatuses.length > 0 && (
              <div className="mt-3">
                <CasualtiesSection
                  casualties={casualties}
                  casualtyTypes={casualtyTypes}
                  casualtyStatuses={casualtyStatuses}
                  incidentPhaseId={activePhaseId}
                  onAdd={handleAddCasualty}
                  onEdit={handleEditCasualty}
                  onDelete={handleDeleteCasualty}
                  isSubmitting={isSubmitting}
                  isIncidentEnded={!!incident.ended_at}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Reinforcements Management */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-auto"
              onClick={() => loadReinforcementData()}
            >
              <Shield className="w-4 h-4 mr-2 text-orange-500" />
              <span className="font-medium">Demandes de renfort</span>
              {isLoadingReinforcements && (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              )}
            </Button>

            {areReinforcementsLoaded && (
              <div className="mt-3 space-y-3">
                {reinforcements.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground text-center">
                    Aucune demande de renfort enregistrée
                  </div>
                ) : (
                  reinforcements.map((reinforcement) => {
                    const status = getReinforcementStatus(reinforcement);
                    const requests =
                      reinforcementRequests[reinforcement.reinforcement_id] ||
                      [];

                    return (
                      <div
                        key={reinforcement.reinforcement_id}
                        className="rounded-lg border bg-muted/40 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            Renfort demandé le{" "}
                            {formatDate(reinforcement.created_at)}
                          </p>
                          <Badge className={status.className}>
                            {status.label}
                          </Badge>
                        </div>
                        {reinforcement.notes && (
                          <p className="text-xs text-muted-foreground">
                            {reinforcement.notes}
                          </p>
                        )}
                        {requests.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Aucun véhicule demandé
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {requests.map((request) => (
                              <div
                                key={`${reinforcement.reinforcement_id}-${request.vehicle_type_id}`}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="text-muted-foreground">
                                  {getVehicleTypeLabel(request.vehicle_type_id)}
                                </span>
                                <span className="font-medium">
                                  {request.assigned_quantity}/{request.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Reinforcement Button */}
          <Button
            variant="default"
            className="w-full gap-2"
            onClick={() => setIsReinforcementOpen(true)}
            disabled={activePhases.length === 0}
          >
            <Shield className="w-4 h-4" />
            Demander des renforts
          </Button>
        </CardContent>
      </Card>

      {/* Reinforcement Dialog */}
      <ReinforcementDialog
        open={isReinforcementOpen}
        onOpenChange={setIsReinforcementOpen}
        phases={activePhases}
        vehicleTypes={vehicleTypes}
        onSuccess={() => {
          setIsReinforcementOpen(false);
          loadReinforcementData(true);
          onReinforcementSuccess();
        }}
      />
    </>
  );
}
