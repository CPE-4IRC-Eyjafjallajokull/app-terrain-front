"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Clock,
  Truck,
  Users,
  AlertTriangle,
  CheckCircle,
  Circle,
} from "lucide-react";
import type { IncidentRead } from "@/lib/incidents/types";

type IncidentCardProps = {
  incident: IncidentRead;
  onClick: () => void;
  isSelected?: boolean;
};

function getStatusColor(ended_at: string | null): string {
  if (ended_at) {
    return "bg-gray-100 text-gray-700 border-gray-200";
  }
  return "bg-red-100 text-red-700 border-red-200";
}

function getStatusIcon(ended_at: string | null) {
  if (ended_at) {
    return <CheckCircle className="w-3 h-3" />;
  }
  return <AlertTriangle className="w-3 h-3" />;
}

function getStatusLabel(ended_at: string | null): string {
  if (ended_at) {
    return "Terminé";
  }
  return "En cours";
}

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

export function IncidentCard({
  incident,
  onClick,
  isSelected,
}: IncidentCardProps) {
  const statusColorClass = getStatusColor(incident.ended_at);
  const statusIcon = getStatusIcon(incident.ended_at);
  const statusLabel = getStatusLabel(incident.ended_at);

  const fullAddress = [incident.address, incident.zipcode, incident.city]
    .filter(Boolean)
    .join(", ");

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? "ring-2 ring-primary border-primary bg-primary/5"
          : "border-primary/10 hover:border-primary/30"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Main info */}
          <div className="flex-1 min-w-0">
            {/* Status + ID */}
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={`${statusColorClass} flex items-center gap-1`}
              >
                {statusIcon}
                {statusLabel}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                #{incident.incident_id.slice(0, 8)}
              </span>
            </div>

            {/* Address */}
            {fullAddress && (
              <div className="flex items-start gap-1.5 text-sm mb-2">
                <MapPin className="w-3.5 h-3.5 text-primary/60 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{fullAddress}</span>
              </div>
            )}

            {/* Description */}
            {incident.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {incident.description}
              </p>
            )}

            {/* Created at */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatDate(incident.created_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
