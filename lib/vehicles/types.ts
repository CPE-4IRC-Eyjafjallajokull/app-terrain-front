// Types for vehicles

export type VehicleStatus = {
  vehicle_status_id: string;
  label: string;
};

export type VehicleType = {
  vehicle_type_id: string;
  code: string;
  label: string;
};

export type VehicleEnergy = {
  energy_id: string;
  label: string;
};

export type VehicleBaseInterestPoint = {
  interest_point_id: string;
  name: string | null;
  address: string | null;
  zipcode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type VehiclePosition = {
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
};

export type VehicleConsumableStock = {
  consumable_type: {
    vehicle_consumable_type_id: string;
    label: string;
    unit: string | null;
  };
  current_quantity: string | null;
  last_update: string;
};

export type VehicleActiveAssignment = {
  vehicle_assignment_id: string;
  incident_phase_id: string | null;
  incident_id?: string | null; // Ajout pour pouvoir linker vers l'incident
  assigned_at: string;
  assigned_by_operator_id: string | null;
};

export type Vehicle = {
  vehicle_id: string;
  immatriculation: string;
  vehicle_type: VehicleType;
  energy: VehicleEnergy | null;
  energy_level: number | null;
  status: VehicleStatus | null;
  base_interest_point: VehicleBaseInterestPoint | null;
  current_position: VehiclePosition | null;
  consumable_stocks: VehicleConsumableStock[];
  active_assignment: VehicleActiveAssignment | null;
};

export type VehiclesListResponse = {
  vehicles: Vehicle[];
  total: number;
};

// Filter state for the vehicles list
export type VehicleFilters = {
  search: string;
  stationId: string;
  statusId: string;
  typeId: string;
};
