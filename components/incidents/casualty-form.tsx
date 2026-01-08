"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import type {
  CasualtyType,
  CasualtyStatus,
  CasualtyCreate,
  CasualtyUpdate,
  CasualtyDetail,
} from "@/lib/incidents/types";

type CasualtyFormInnerProps = {
  onClose: () => void;
  onSubmit: (data: CasualtyCreate | CasualtyUpdate) => Promise<void>;
  casualtyTypes: CasualtyType[];
  casualtyStatuses: CasualtyStatus[];
  incidentPhaseId: string;
  editingCasualty?: CasualtyDetail | null;
  isSubmitting: boolean;
};

function CasualtyFormInner({
  onClose,
  onSubmit,
  casualtyTypes,
  casualtyStatuses,
  incidentPhaseId,
  editingCasualty,
  isSubmitting,
}: CasualtyFormInnerProps) {
  // Initialize state from props directly (no useEffect needed)
  const initialValues = useMemo(() => {
    if (editingCasualty) {
      return {
        typeId: editingCasualty.casualty_type.casualty_type_id,
        statusId: editingCasualty.casualty_status.casualty_status_id,
        notes: editingCasualty.notes || "",
      };
    }
    return {
      typeId: casualtyTypes[0]?.casualty_type_id || "",
      statusId: casualtyStatuses[0]?.casualty_status_id || "",
      notes: "",
    };
  }, [editingCasualty, casualtyTypes, casualtyStatuses]);

  const [typeId, setTypeId] = useState(initialValues.typeId);
  const [statusId, setStatusId] = useState(initialValues.statusId);
  const [notes, setNotes] = useState(initialValues.notes);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editingCasualty;

  const handleSubmit = async () => {
    if (!typeId || !statusId) {
      setError("Veuillez sélectionner un type et un statut.");
      return;
    }

    try {
      if (isEditing) {
        await onSubmit({
          casualty_type_id: typeId,
          casualty_status_id: statusId,
          notes: notes || null,
        } as CasualtyUpdate);
      } else {
        await onSubmit({
          incident_phase_id: incidentPhaseId,
          casualty_type_id: typeId,
          casualty_status_id: statusId,
          notes: notes || null,
          reported_at: new Date().toISOString(),
        } as CasualtyCreate);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {isEditing ? "Modifier la victime" : "Déclarer une victime"}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {isEditing
            ? "Modifiez les informations de la victime."
            : "Renseignez les informations de la victime."}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-4 py-4">
        {/* Type de blessure */}
        <div className="space-y-2">
          <Label htmlFor="type">Type de blessure *</Label>
          <select
            id="type"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sélectionner un type</option>
            {casualtyTypes.map((type) => (
              <option key={type.casualty_type_id} value={type.casualty_type_id}>
                {type.label || type.code || type.casualty_type_id}
              </option>
            ))}
          </select>
        </div>

        {/* Statut */}
        <div className="space-y-2">
          <Label htmlFor="status">Statut *</Label>
          <select
            id="status"
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sélectionner un statut</option>
            {casualtyStatuses.map((status) => (
              <option
                key={status.casualty_status_id}
                value={status.casualty_status_id}
              >
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informations complémentaires..."
            rows={3}
          />
        </div>

        {/* Error message */}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? "Enregistrer" : "Ajouter"}
        </Button>
      </AlertDialogFooter>
    </>
  );
}

type CasualtyFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CasualtyCreate | CasualtyUpdate) => Promise<void>;
  casualtyTypes: CasualtyType[];
  casualtyStatuses: CasualtyStatus[];
  incidentPhaseId: string;
  editingCasualty?: CasualtyDetail | null;
  isSubmitting: boolean;
};

// Wrapper component that handles the dialog and remounts the form when opened
export function CasualtyForm({
  isOpen,
  onClose,
  onSubmit,
  casualtyTypes,
  casualtyStatuses,
  incidentPhaseId,
  editingCasualty,
  isSubmitting,
}: CasualtyFormProps) {
  // Use key to force remount and reset form state when dialog opens
  const formKey = isOpen
    ? `form-${editingCasualty?.casualty_id || "new"}`
    : "closed";

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md">
        {isOpen && (
          <CasualtyFormInner
            key={formKey}
            onClose={onClose}
            onSubmit={onSubmit}
            casualtyTypes={casualtyTypes}
            casualtyStatuses={casualtyStatuses}
            incidentPhaseId={incidentPhaseId}
            editingCasualty={editingCasualty}
            isSubmitting={isSubmitting}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
