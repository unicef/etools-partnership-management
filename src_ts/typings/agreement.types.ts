// eslint-disable-next-line
type StaticAgreement = {
  agreement_number: string;
  agreement_number_status: string;
  agreement_type: string;
  authorized_officers: PartnerStaffMember[];
  country_programme: number;
  end: string;
  id: number;
  partner: number;
  partner_name: string;
  signed_by_partner_date: string;
  signed_by_unicef_date: string;
  special_conditions_pca: boolean;
  start: string;
  status: string;
};
// eslint-disable-next-line
type UnicefRepresentative = {
  id: number;
  name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
};
