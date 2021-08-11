interface MonitoringActivity {
  id: number;
  reference_number: string;
  monitor_type: UserType;
  tpm_partner: null | IActivityTpmPartner;
  visit_lead: null | ActivityTeamMember;
  location: ISiteParrentLocation;
  location_site: null | Site;
  partners: IActivityPartner[];
  interventions: IActivityIntervention[];
  cp_outputs: IActivityCPOutput[];
  start_date: null | string;
  end_date: null | string;
  checklists_count: number;
  status: ActivityStatus;
  team_members: ActivityTeamMember[];
}

type UserType = 'staff' | 'tpm';

type ActivityTeamMember = {
  id: number;
  name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
};

interface IActivityTpmPartner {
  email: string;
  id: number;
  name: string;
  phone_number: string;
  vendor_number: string;
}

interface IActivityPartner {
  id: number;
  name: string;
}

interface IActivityCPOutput {
  id: number;
  name: string;
}

interface IActivityIntervention {
  id: number;
  title: string;
  number: string;
  document_type: string;
}

type ActivityStatus =
  | 'draft'
  | 'checklist'
  | 'review'
  | 'assigned'
  | 'data_collection'
  | 'report_finalization'
  | 'submitted'
  | 'completed'
  | 'cancelled';

type Site = {
  id: number;
  is_active: boolean;
  name: string;
  p_code: string;
  parent: ISiteParrentLocation;
  point: GeojsonPoint;
  security_detail: string;
};

interface ISiteParrentLocation {
  gateway: LocationGateway;
  geo_point: string;
  id: string;
  name: string;
  p_code: string;
  parent: null | ISiteParrentLocation;
}
type LocationGateway = {
  admin_level: null | string | number;
  id: number;
  name: string;
};

type GeojsonPoint = {
  coordinates: CoordinatesArray;
  type: 'Point';
};

type CoordinatesArray = [number, number];
{"mode":"full","isActive":false}