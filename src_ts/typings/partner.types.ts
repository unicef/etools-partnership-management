// eslint-disable-next-line
type Partner = {
  address: string;
  basis_for_risk_rating: string;
  blocked: boolean;
  city: string;
  country: string;
  cso_type: string;
  deleted_flag: boolean;
  email: string;
  hidden: boolean;
  id: number;
  last_assessment_date: string;
  name: string;
  net_ct_cy: null;
  partner_type: string;
  phone_number: string;
  postal_code: string;
  rating: string;
  reported_cy: null;
  shared_with: null;
  short_name: string;
  street_address: string;
  total_ct_cp: string;
  total_ct_cy: string;
  total_ct_ytd: null;
  vendor_number: string;
};

// eslint-disable-next-line
type PartnerStaffMember = {
  active: boolean;
  created: string;
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  modified: string;
  partner: number;
  phone: string;
  title: string;
};
