export type InterestPointKind = {
  interest_point_kind_id: string;
  label: string;
};

export type InterestPoint = {
  interest_point_id: string;
  name: string;
  address: string;
  zipcode: string;
  city: string;
  latitude: number;
  longitude: number;
  interest_point_kind_id: string;
};
