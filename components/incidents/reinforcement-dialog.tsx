"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { IncidentPhase, VehicleType } from "@/lib/incidents/types";
import { requestAssignmentForPhase } from "@/lib/incidents/service";
import { toast } from "sonner";
import { Plus, Trash2, Shield, Loader2 } from "lucide-react";

type VehicleRequest = {
  vehicleTypeId: string;
  quantity: number;
};

type ReinforcementDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phases: IncidentPhase[];
  vehicleTypes: VehicleType[];
  onSuccess?: () => void;
};

export function ReinforcementDialog({
  open,
  onOpenChange,
  phases,
  vehicleTypes,
  onSuccess,
}: ReinforcementDialogProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [vehicleRequests, setVehicleRequests] = useState<VehicleRequest[]>([
    { vehicleTypeId: "", quantity: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter to only show active phases (not ended)
  const activePhases = phases.filter((phase) => !phase.ended_at);

  const handleAddVehicleRequest = () => {
    setVehicleRequests([
      ...vehicleRequests,
      { vehicleTypeId: "", quantity: 1 },
    ]);
  };

  const handleRemoveVehicleRequest = (index: number) => {
    if (vehicleRequests.length > 1) {
      setVehicleRequests(vehicleRequests.filter((_, i) => i !== index));
    }
  };

  const handleVehicleTypeChange = (index: number, vehicleTypeId: string) => {
    const updated = [...vehicleRequests];
    updated[index].vehicleTypeId = vehicleTypeId;
    setVehicleRequests(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...vehicleRequests];
    updated[index].quantity = Math.max(1, quantity);
    setVehicleRequests(updated);
  };

  const handleReset = () => {
    setSelectedPhaseId("");
    setNotes("");
    setVehicleRequests([{ vehicleTypeId: "", quantity: 1 }]);
  };

  const handleSubmit = async () => {
    // Validate
    if (!selectedPhaseId) {
      toast.error("Veuillez sélectionner une phase");
      return;
    }

    const validRequests = vehicleRequests.filter((r) => r.vehicleTypeId);
    if (validRequests.length === 0) {
      toast.error("Veuillez ajouter au moins un type de véhicule");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the vehicles array for the API
      const vehicles = validRequests.map((request) => ({
        vehicle_type_id: request.vehicleTypeId,
        qty: request.quantity,
      }));

      // Send the assignment request to the QG API
      await requestAssignmentForPhase(selectedPhaseId, vehicles);

      toast.success("Demande de renfort envoyée avec succès");
      handleReset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de la création du renfort:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de la demande",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVehicleTypeLabel = (typeId: string) => {
    const type = vehicleTypes.find((t) => t.vehicle_type_id === typeId);
    return type ? `${type.code} - ${type.label}` : "";
  };

  const getPhaseLabel = (phaseId: string) => {
    const phase = phases.find((p) => p.incident_phase_id === phaseId);
    if (!phase) return "";
    return phase.phase_type.label || phase.phase_type.code;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Demander des renforts
          </DialogTitle>
          <DialogDescription>
            Sélectionnez les types de véhicules et la quantité nécessaire pour
            renforcer l&apos;intervention.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Phase selection */}
          <div className="space-y-2">
            <Label htmlFor="phase">Phase de l&apos;incident *</Label>
            <Select value={selectedPhaseId} onValueChange={setSelectedPhaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une phase">
                  {selectedPhaseId && getPhaseLabel(selectedPhaseId)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {activePhases.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucune phase active
                  </SelectItem>
                ) : (
                  activePhases.map((phase) => (
                    <SelectItem
                      key={phase.incident_phase_id}
                      value={phase.incident_phase_id}
                    >
                      {phase.phase_type.label || phase.phase_type.code}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle requests */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Véhicules demandés *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVehicleRequest}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>

            {vehicleRequests.map((request, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor={`vehicle-type-${index}`} className="sr-only">
                    Type de véhicule
                  </Label>
                  <Select
                    value={request.vehicleTypeId}
                    onValueChange={(value: string) =>
                      handleVehicleTypeChange(index, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type de véhicule">
                        {request.vehicleTypeId &&
                          getVehicleTypeLabel(request.vehicleTypeId)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem
                          key={type.vehicle_type_id}
                          value={type.vehicle_type_id}
                        >
                          {type.code} - {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24">
                  <Label htmlFor={`quantity-${index}`} className="sr-only">
                    Quantité
                  </Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min={1}
                    max={99}
                    value={request.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, parseInt(e.target.value) || 1)
                    }
                    className="text-center"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveVehicleRequest(index)}
                  disabled={vehicleRequests.length <= 1}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Précisions sur la demande de renfort..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !selectedPhaseId ||
              vehicleRequests.every((r) => !r.vehicleTypeId)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Demander les renforts
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
