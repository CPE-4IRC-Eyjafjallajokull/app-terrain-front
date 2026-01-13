"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Shield,
} from "lucide-react";

type VehicleType = {
  vehicle_type_id: string;
  code: string;
  label: string;
};

type PhaseType = {
  phase_type_id: string;
  code: string;
  label: string;
};

type VehicleInfo = {
  vehicle_id: string;
  immatriculation: string;
  vehicle_type: VehicleType;
};

type VehicleAssignment = {
  vehicle_assignment_id: string;
  vehicle_id: string;
  incident_phase_id: string;
  assigned_at: string;
  assigned_by_operator_id: string | null;
  validated_at: string | null;
  validated_by_operator_id: string | null;
  unassigned_at: string | null;
  notes: string | null;
  vehicle: VehicleInfo;
  phase_type: PhaseType;
};

type VehicleHistoryDialogProps = {
  vehicleId: string;
  vehicleImmatriculation: string;
};

export function VehicleHistoryDialog({
  vehicleId,
  vehicleImmatriculation,
}: VehicleHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchAssignments();
    }
  }, [open]);

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/vehicles/immatriculation/${encodeURIComponent(vehicleImmatriculation)}/assignments`,
      );
      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'historique");
      }
      const data = await response.json();
      // Sort by assigned_at descending (most recent first)
      const sortedData = Array.isArray(data)
        ? data.sort(
            (a: VehicleAssignment, b: VehicleAssignment) =>
              new Date(b.assigned_at).getTime() -
              new Date(a.assigned_at).getTime(),
          )
        : [];
      setAssignments(sortedData);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Impossible de charger l'historique des interventions");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  // Filter to show only completed assignments (with unassigned_at)
  const completedAssignments = assignments.filter((a) => a.unassigned_at);
  const activeAssignments = assignments.filter((a) => !a.unassigned_at);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
        >
          <History className="w-4 h-4" />
          Historique
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-orange-600" />
            Historique des interventions
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Véhicule {vehicleImmatriculation}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAssignments}
                className="mt-4"
              >
                Réessayer
              </Button>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucune intervention enregistrée
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active assignments first */}
              {activeAssignments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-orange-600 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    Intervention en cours
                  </h4>
                  {activeAssignments.map((assignment) => (
                    <div
                      key={assignment.vehicle_assignment_id}
                      className="p-4 border border-orange-200 bg-orange-50/50 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                          En cours
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(assignment.assigned_at, null)}
                        </span>
                      </div>
                      {/* Phase type */}
                      {assignment.phase_type && (
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-3 h-3 text-orange-600" />
                          <span className="font-medium">
                            {assignment.phase_type.label ||
                              assignment.phase_type.code}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Assigné: {formatDate(assignment.assigned_at)}
                        </span>
                      </div>
                      {assignment.validated_at && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>
                            Validé: {formatDate(assignment.validated_at)}
                          </span>
                        </div>
                      )}
                      {assignment.notes && (
                        <p className="text-xs text-muted-foreground italic border-l-2 border-orange-200 pl-2">
                          {assignment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Completed assignments */}
              {completedAssignments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Interventions terminées ({completedAssignments.length})
                  </h4>
                  {completedAssignments.map((assignment) => (
                    <div
                      key={assignment.vehicle_assignment_id}
                      className="p-4 border rounded-lg space-y-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 border-green-200"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Terminée
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Durée:{" "}
                          {formatDuration(
                            assignment.assigned_at,
                            assignment.unassigned_at,
                          )}
                        </span>
                      </div>
                      {/* Phase type */}
                      {assignment.phase_type && (
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-3 h-3 text-muted-foreground" />
                          <span>
                            {assignment.phase_type.label ||
                              assignment.phase_type.code}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Assigné: {formatDate(assignment.assigned_at)}
                          </span>
                        </div>
                        {assignment.unassigned_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              Fin: {formatDate(assignment.unassigned_at)}
                            </span>
                          </div>
                        )}
                      </div>
                      {assignment.validated_at && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>
                            Validé le {formatDate(assignment.validated_at)}
                          </span>
                        </div>
                      )}
                      {assignment.notes && (
                        <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                          {assignment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
