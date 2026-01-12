// Types for incidents and casualties

// ============ Incident Types ============

export type IncidentSnapshot = {
  incident_id: string;
  created_by_operator_id: string | null;
  address: string | null;
  zipcode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  status: string;
};

export type PhaseTypeRef = {
  phase_type_id: string;
  code: string;
  label: string | null;
};

export type PhaseDependency = {
  depends_on_incident_phase_id: string;
  kind: string;
};

export type ActivePhase = {
  incident_phase_id: string;
  incident_id: string;
  phase_type_id: string;
  phase_code: string;
  phase_label: string | null;
  priority: number | null;
  started_at: string | null;
  ended_at: string | null;
  dependencies: PhaseDependency[];
};

export type ResourcesByType = {
  vehicle_type: {
    vehicle_type_id: string;
    code: string;
    label: string | null;
  };
  count: number;
};

export type ResourcesSummary = {
  vehicles_assigned: number;
  vehicles_active: number;
  by_type: ResourcesByType[];
};

export type CasualtyStatusCount = {
  casualty_status_id: string;
  label: string;
  count: number;
};

export type CasualtiesSummary = {
  total: number;
  by_status: CasualtyStatusCount[];
};

export type IncidentSituation = {
  incident: IncidentSnapshot;
  phases_active: ActivePhase[];
  resources: ResourcesSummary;
  casualties: CasualtiesSummary;
};

// ============ Engagement (Vehicle Assignment) Types ============

export type VehicleTypeRef = {
  vehicle_type_id: string;
  code: string;
  label: string | null;
};

// ============ Casualty Types ============

export type CasualtyTypeRef = {
  casualty_type_id: string;
  code: string | null;
  label: string | null;
};

export type CasualtyStatusRef = {
  casualty_status_id: string;
  label: string;
};

export type CasualtyTransport = {
  casualty_transport_id: string;
  vehicle_assignment_id: string | null;
  picked_up_at: string | null;
  dropped_off_at: string | null;
  picked_up_latitude: number | null;
  picked_up_longitude: number | null;
  dropped_off_latitude: number | null;
  dropped_off_longitude: number | null;
  notes: string | null;
};

export type CasualtyDetail = {
  casualty_id: string;
  incident_phase_id: string;
  casualty_type: CasualtyTypeRef;
  casualty_status: CasualtyStatusRef;
  reported_at: string | null;
  notes: string | null;
  transports: CasualtyTransport[];
};

export type CasualtyStats = {
  total: number;
  by_status: CasualtyStatusCount[];
};

export type IncidentCasualties = {
  incident_id: string;
  casualties: CasualtyDetail[];
  stats: CasualtyStats;
};

// ============ Casualty Reference Data ============

export type CasualtyType = {
  casualty_type_id: string;
  code: string | null;
  label: string | null;
};

export type CasualtyStatus = {
  casualty_status_id: string;
  label: string;
};

// ============ Casualty Create/Update ============

export type CasualtyCreate = {
  incident_phase_id: string;
  casualty_type_id: string;
  casualty_status_id: string;
  reported_at?: string | null;
  notes?: string | null;
};

export type CasualtyUpdate = {
  incident_phase_id?: string | null;
  casualty_type_id?: string | null;
  casualty_status_id?: string | null;
  reported_at?: string | null;
  notes?: string | null;
};

export type CasualtyRead = {
  casualty_id: string;
  incident_phase_id: string;
  casualty_type_id: string;
  casualty_status_id: string;
  reported_at: string | null;
  notes: string | null;
};

// ============ Incident List (from /qg/incidents) ============

export type IncidentRead = {
  incident_id: string;
  created_by_operator_id: string | null;
  address: string | null;
  zipcode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
};

// ============ Filters ============

export type PhaseType = {
  phase_type_id: string;
  code: string;
  label: string | null;
};

export type IncidentPhase = {
  incident_phase_id: string;
  phase_type: PhaseType;
  priority: number;
  started_at: string | null;
  ended_at: string | null;
  vehicle_assignments: VehicleAssignmentRef[];
};

export type VehicleAssignmentRef = {
  vehicle_assignment_id: string;
  vehicle_id: string;
  incident_phase_id: string | null;
  assigned_at: string;
  assigned_by_operator_id: string | null;
  validated_at: string | null;
  validated_by_operator_id: string | null;
  unassigned_at: string | null;
};

export type Incident = {
  incident_id: string;
  created_by_operator_id: string | null;
  address: string | null;
  zipcode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  phases: IncidentPhase[];
};

export type VehicleType = {
  vehicle_type_id: string;
  code: string;
  label: string;
};

export type VehicleSummary = {
  vehicle_id: string;
  immatriculation: string;
  vehicle_type: {
    vehicle_type_id: string;
    code: string;
    label: string | null;
  };
};

export type VehicleAssignmentDetail = {
  vehicle_assignment_id: string;
  vehicle_id: string;
  incident_phase_id: string;
  assigned_at: string;
  assigned_by_operator_id: string | null;
  validated_at: string | null;
  validated_by_operator_id: string | null;
  unassigned_at: string | null;
  notes: string | null;
  vehicle: VehicleSummary;
  phase_type: PhaseType | null;
};

export type IncidentEngagements = {
  incident_id: string;
  vehicle_assignments: VehicleAssignmentDetail[];
};

// Reinforcement types
export type Reinforcement = {
  reinforcement_id: string;
  incident_phase_id: string;
  validated_at: string | null;
  rejected_at: string | null;
  notes: string | null;
  created_at: string;
};

export type ReinforcementCreate = {
  incident_phase_id: string;
  notes?: string | null;
};

export type ReinforcementVehicleRequest = {
  reinforcement_id: string;
  vehicle_type_id: string;
  quantity: number;
  assigned_quantity: number;
};

export type ReinforcementVehicleRequestCreate = {
  reinforcement_id: string;
  vehicle_type_id: string;
  quantity: number;
  assigned_quantity?: number;
};

// Filter type for incidents list
export type IncidentFilters = {
  search: string;
  showEnded: boolean;
};
