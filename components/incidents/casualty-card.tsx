"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Clock, FileText } from "lucide-react";
import type { CasualtyDetail } from "@/lib/incidents/types";

type CasualtyCardProps = {
  casualty: CasualtyDetail;
  onEdit: () => void;
  onDelete: () => void;
};

function getStatusColor(label: string): string {
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

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CasualtyCard({
  casualty,
  onEdit,
  onDelete,
}: CasualtyCardProps) {
  const statusColorClass = getStatusColor(casualty.casualty_status.label);

  return (
    <Card className="border-primary/10 hover:border-primary/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Type + Status */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge
                variant="outline"
                className="bg-primary/5 border-primary/20"
              >
                {casualty.casualty_type.label ||
                  casualty.casualty_type.code ||
                  "Type inconnu"}
              </Badge>
              <Badge variant="outline" className={statusColorClass}>
                {casualty.casualty_status.label}
              </Badge>
            </div>

            {/* Reported at */}
            {casualty.reported_at && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                <span>Signalé le {formatDate(casualty.reported_at)}</span>
              </div>
            )}

            {/* Notes */}
            {casualty.notes && (
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-2">
                <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{casualty.notes}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
