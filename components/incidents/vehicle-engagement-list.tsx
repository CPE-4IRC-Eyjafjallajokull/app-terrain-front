"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Clock, User } from "lucide-react";
import type { VehicleAssignmentDetail } from "@/lib/incidents/types";

type VehicleEngagementListProps = {
  assignments: VehicleAssignmentDetail[];
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VehicleEngagementList({
  assignments,
}: VehicleEngagementListProps) {
  if (assignments.length === 0) {
    return (
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Véhicules engagés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucun véhicule engagé pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          Véhicules engagés
          <Badge variant="secondary" className="ml-2">
            {assignments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignments.map((assignment) => (
          <div
            key={assignment.vehicle_assignment_id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-primary/5"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {assignment.vehicle.immatriculation}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-primary/5 border-primary/20 text-primary text-xs"
                  >
                    {assignment.vehicle.vehicle_type.code}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {assignment.vehicle.vehicle_type.label}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              <div className="flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" />
                {formatDate(assignment.assigned_at)}
              </div>
              {assignment.phase_type && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {assignment.phase_type.label || assignment.phase_type.code}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
