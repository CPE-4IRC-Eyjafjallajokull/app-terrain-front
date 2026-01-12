"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  CheckCircle,
  Navigation,
  MapPin,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { VehicleStatus } from "@/lib/vehicles/types";

type VehicleStatusQuickProps = {
  currentStatus: VehicleStatus | null;
  statuses: VehicleStatus[];
  onStatusChange: (statusId: string) => Promise<void>;
  isDisabled?: boolean;
};

type QuickStatusButton = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchLabels: string[];
  color: string;
  bgColor: string;
  borderColor: string;
};

const QUICK_STATUSES: QuickStatusButton[] = [
  {
    label: "Disponible",
    icon: CheckCircle,
    matchLabels: ["disponible"],
    color: "text-green-700",
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200",
  },
  {
    label: "En route",
    icon: Navigation,
    matchLabels: ["engagé"],
    color: "text-blue-700",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
  },
  {
    label: "Sur place",
    icon: MapPin,
    matchLabels: ["sur intervention"],
    color: "text-orange-700",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-200",
  },
  {
    label: "Retour",
    icon: ArrowLeft,
    matchLabels: ["retour"],
    color: "text-purple-700",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200",
  },
];

export function VehicleStatusQuick({
  currentStatus,
  statuses,
  onStatusChange,
  isDisabled = false,
}: VehicleStatusQuickProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const findMatchingStatus = (quickStatus: QuickStatusButton) => {
    return statuses.find((s) => {
      const label = s.label.toLowerCase();
      return quickStatus.matchLabels.some((match) => label.includes(match));
    });
  };

  const isCurrentStatus = (quickStatus: QuickStatusButton) => {
    if (!currentStatus?.label) return false;
    const label = currentStatus.label.toLowerCase();
    return quickStatus.matchLabels.some((match) => label.includes(match));
  };

  const handleStatusClick = (quickStatus: QuickStatusButton) => {
    const matchingStatus = findMatchingStatus(quickStatus);
    if (matchingStatus) {
      setPendingStatus({
        id: matchingStatus.vehicle_status_id,
        label: quickStatus.label,
      });
    }
  };

  const handleConfirmChange = async () => {
    if (!pendingStatus) return;

    setIsChanging(true);
    try {
      await onStatusChange(pendingStatus.id);
    } finally {
      setIsChanging(false);
      setPendingStatus(null);
    }
  };

  return (
    <>
      <Card className="border-orange-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Statut rapide
              </CardTitle>
              <CardDescription>
                Changez le statut de votre véhicule
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_STATUSES.map((quickStatus) => {
              const Icon = quickStatus.icon;
              const isCurrent = isCurrentStatus(quickStatus);
              const hasMatch = !!findMatchingStatus(quickStatus);

              return (
                <Button
                  key={quickStatus.label}
                  variant="outline"
                  className={`h-20 flex-col gap-2 transition-all relative ${isCurrent
                    ? `${quickStatus.color} border-3 ${quickStatus.borderColor} shadow-xl scale-105 bg-gradient-to-br from-white ${quickStatus.bgColor}`
                    : `${quickStatus.bgColor} ${quickStatus.borderColor} ${quickStatus.color} hover:scale-105 hover:shadow-lg hover:border-2`
                    }`}
                  disabled={isDisabled || !hasMatch}
                  onClick={() => !isCurrent && handleStatusClick(quickStatus)}
                >
                  {isCurrent && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-current">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                  <Icon className={`w-7 h-7 ${isCurrent ? "" : ""}`} />
                  <span className="text-sm font-semibold">
                    {quickStatus.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-medium opacity-70">
                      Statut actuel
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!pendingStatus}
        onOpenChange={() => setPendingStatus(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmer le changement de statut
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir passer le statut à &quot;
              {pendingStatus?.label}&quot; ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChanging}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmChange}
              disabled={isChanging}
            >
              {isChanging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Mise à jour...
                </>
              ) : (
                "Confirmer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
