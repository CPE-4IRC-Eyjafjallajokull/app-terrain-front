"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Plus, AlertTriangle } from "lucide-react";
import { CasualtyCard } from "./casualty-card";
import { CasualtyForm } from "./casualty-form";
import type {
  IncidentCasualties,
  CasualtyType,
  CasualtyStatus,
  CasualtyDetail,
  CasualtyCreate,
  CasualtyUpdate,
} from "@/lib/incidents/types";

type CasualtiesSectionProps = {
  casualties: IncidentCasualties | null;
  casualtyTypes: CasualtyType[];
  casualtyStatuses: CasualtyStatus[];
  incidentPhaseId: string;
  onAdd: (data: CasualtyCreate) => Promise<void>;
  onEdit: (casualtyId: string, data: CasualtyUpdate) => Promise<void>;
  onDelete: (casualtyId: string) => Promise<void>;
  isSubmitting: boolean;
};

function getStatusBadgeColor(label: string): string {
  const labelLower = label.toLowerCase();
  if (
    labelLower.includes("décédé") ||
    labelLower.includes("urgent") ||
    labelLower.includes("critique")
  ) {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (labelLower.includes("grave") || labelLower.includes("sérieux")) {
    return "bg-orange-100 text-orange-700 border-orange-200";
  }
  if (labelLower.includes("léger") || labelLower.includes("mineur")) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
  if (
    labelLower.includes("stable") ||
    labelLower.includes("traité") ||
    labelLower.includes("évacué")
  ) {
    return "bg-green-100 text-green-700 border-green-200";
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export function CasualtiesSection({
  casualties,
  casualtyTypes,
  casualtyStatuses,
  incidentPhaseId,
  onAdd,
  onEdit,
  onDelete,
  isSubmitting,
}: CasualtiesSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCasualty, setEditingCasualty] = useState<CasualtyDetail | null>(
    null,
  );
  const [deletingCasualtyId, setDeletingCasualtyId] = useState<string | null>(
    null,
  );

  const handleOpenAddForm = () => {
    setEditingCasualty(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (casualty: CasualtyDetail) => {
    setEditingCasualty(casualty);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCasualty(null);
  };

  const handleSubmit = async (data: CasualtyCreate | CasualtyUpdate) => {
    if (editingCasualty) {
      await onEdit(editingCasualty.casualty_id, data as CasualtyUpdate);
    } else {
      await onAdd(data as CasualtyCreate);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingCasualtyId) {
      await onDelete(deletingCasualtyId);
      setDeletingCasualtyId(null);
    }
  };

  const stats = casualties?.stats;
  const casualtiesList = casualties?.casualties || [];

  return (
    <>
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Victimes
              {stats && stats.total > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {stats.total}
                </Badge>
              )}
            </CardTitle>
            <Button size="sm" onClick={handleOpenAddForm}>
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>

          {/* Stats by status */}
          {stats && stats.by_status.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {stats.by_status.map((s) => (
                <Badge
                  key={s.casualty_status_id}
                  variant="outline"
                  className={getStatusBadgeColor(s.label)}
                >
                  {s.label}: {s.count}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {casualtiesList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune victime déclarée pour le moment.
            </p>
          ) : (
            casualtiesList.map((casualty) => (
              <CasualtyCard
                key={casualty.casualty_id}
                casualty={casualty}
                onEdit={() => handleOpenEditForm(casualty)}
                onDelete={() => setDeletingCasualtyId(casualty.casualty_id)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      <CasualtyForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        casualtyTypes={casualtyTypes}
        casualtyStatuses={casualtyStatuses}
        incidentPhaseId={incidentPhaseId}
        editingCasualty={editingCasualty}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCasualtyId}
        onOpenChange={(open) => !open && setDeletingCasualtyId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette victime ? Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
