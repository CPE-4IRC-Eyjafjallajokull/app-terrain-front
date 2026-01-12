"use client";

import { useState } from "react";
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
} from "@/lib/incidents/types";
import { ReinforcementDialog } from "@/components/incidents/reinforcement-dialog";
import { CasualtiesSection } from "@/components/incidents/casualties-section";
import { toast } from "sonner";

type IncidentPanelProps = {
  incident: Incident;
  engagements: IncidentEngagements | null;
  casualties: IncidentCasualties | null;
  vehicleTypes: VehicleType[];
  onCasualtyUpdate: () => void;
  onReinforcementSuccess: () => void;
};

export function IncidentPanel({
  incident,
  engagements,
  casualties,
  vehicleTypes,
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
      <Card className="border-primary/20">
        <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-transparent border-b">
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
            {incident.latitude && incident.longitude && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={openNavigation}
              >
                <Navigation className="w-4 h-4" />
                Ouvrir dans Google Maps
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
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
          onReinforcementSuccess();
        }}
      />
    </>
  );
}
