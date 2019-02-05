import { IPermission } from './globals.types';

export class Intervention {
  id: number | null = null;
  agreement?: number = undefined;
  document_type?: string = undefined;
  country_programme?: number = undefined;
  number?: string = undefined;
  reference_number_year?: string | null = null;
  prc_review_attachment?: number | string = undefined;
  signed_pd_attachment?: number | string = undefined;
  title?: string = undefined;
  status: string = '';
  start: string | null = null;
  end: string | null = null;
  submitted_to_prc: boolean = false;
  submission_date_prc?: string = undefined;
  review_date_prc?: string = undefined;
  submission_date?: string = undefined;
  signed_by_unicef_date?: string = undefined;
  signed_by_partner_date?: string = undefined;
  unicef_signatory?: string = undefined;
  unicef_focal_points: [] = [];
  partner_focal_points: [] = [];
  partner_authorized_officer_signatory?: string = undefined;
  offices: [] = [];
  sections: [] =[];
  frs: number[] = [];
  frs_details: FrsDetails = new FrsDetails();
  contingency_pd: boolean = false;
  planned_budget: PlannedBudget | null = null;
  flat_locations: [] = [];
  result_links: [] = [];
  planned_visits: [] = [];
  in_amendment: boolean = false;
  amendments: [] = [];
  //distributions: [];
  activation_letter_attachment: number| string| null = null;
  attachments: InterventionAttachment[] = [];
  permissions?: IPermission<InterventionPermissionsFields>;
}

export class ListItemIntervention {
  start: string = '';
  end: string = '';
  frs_earliest_start_date: string = '';
  frs_latest_end_date: string = '';
  partner_name: string = '';
  [key: string] : any;
}

export type InterventionAttachment = {
  id: number;
  active: boolean;
  type: number;
  intervention: number;
}

export class FrsDetails {
  currencies_match: boolean = false;
  total_frs_amt: string = '0';
  earliest_start_date: string | null = null;
  latest_end_date: string | null = null;
  frs: Fr[] = [];
}

export type Fr = {
  id: number,
  currency: string;
}

export type PlannedBudget = {
  currency: string;
  unicef_cash_local: string;
  total: string;
}

export class InterventionPermissionsFields {

  id: boolean = false;
  status: boolean = false;

  // details - Partnership Information
  agreement: boolean = false;
  document_type: boolean = false;
  number: boolean = false;
  title: boolean = false;
  offices: boolean = false;
  unicef_focal_points: boolean = false;
  partner_focal_points: boolean = false;

  // details - PD or SSFA Details
  contingency_pd: boolean = false;
  country_programme: boolean = false;
  start: boolean = false;
  end: boolean = false;
  sections: boolean = false;
  flat_locations: boolean = false;
  reporting_requirements: boolean = false;

  // details - PD Output or SSFA Expected results
  result_links: boolean = false;

  // details - Planned Budget
  planned_budget: boolean = false;
  planned_budget_unicef_cash: boolean = false; // TODO: this should be also received from backend

  // details - Planned Visits
  planned_visits: boolean = false;

  // review & sign - Signatures & Dates
  submission_date: boolean = false;
  submission_date_prc: boolean = false;
  review_date_prc: boolean = false;
  prc_review_attachment: boolean = false;
  partner_authorized_officer_signatory: boolean = false;
  signed_by_partner_date: boolean = false;
  unicef_signatory: boolean = false;
  signed_by_unicef_date: boolean = false;
  signed_pd_attachment: boolean = false;

  // review & sign - Amendments
  amendments: boolean = false;

  // review & sign - FR Numbers
  frs: boolean = false;

  // attachments
  attachments: boolean = false;
}
