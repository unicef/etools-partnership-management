import { IPermission } from './globals.types';
import CONSTANTS from '../config/app-constants';

export class Intervention {
  id: number | null = null;
  agreement?: number ;
  document_type?: string;
  country_programme?: number;
  number?: string;
  reference_number_year?: string | null = null;
  prc_review_attachment?: number | string;
  signed_pd_attachment?: number | string;
  title?: string;
  status: string = '';
  start: string = '';
  end: string = '';
  submitted_to_prc: boolean = false;
  submission_date_prc?: string ;
  review_date_prc?: string;
  submission_date?: string;
  signed_by_unicef_date?: string;
  signed_by_partner_date?: string;
  unicef_signatory?: string;
  unicef_focal_points: [] = [];
  partner?: string;
  partner_focal_points: [] = [];
  partner_authorized_officer_signatory?: string;
  offices: [] = [];
  sections: [] =[];
  frs: number[] = [];
  frs_details: FrsDetails = new FrsDetails();
  contingency_pd: boolean = false;
  planned_budget: PlannedBudget | null = null;
  flat_locations: [] = [];
  result_links: ExpectedResult[] = [];
  planned_visits: PlannedVisit[] = [];
  in_amendment: boolean = false;
  amendments: [] = [];
  //distributions: [];
  activation_letter_attachment: number| string| null = null;
  attachments: InterventionAttachment[] = [];
  permissions?: IPermission<InterventionPermissionsFields>;
  [key: string] : any;

  public isDraft() {
    return this.status === CONSTANTS.STATUSES.Draft.toLowerCase() ||
        status === '';
  }
  public isContingencyAndHasActivationLetter() {
    return this.contingency_pd &&
      this.activation_letter_attachment;
  }
}

export class ListItemIntervention {
  start: string = '';
  end: string = '';
  frs_earliest_start_date: string | null= '';
  frs_latest_end_date: string | null= '';
  partner_name?: string = '';
  cp_outputs: [] = [];
  unicef_budget: number = 0;
  cso_contribution: number = 0;
  country_programme?: number;
  title?: string = '';
  status: string = '';
  number?: string = '';
  offices: [] = [];
  sections: number[] = [];
  section_names: string[] | null = null;
  document_type?: string ='';
  unicef_focal_points: [] = [];
  [key: string] : any;
}

export class SelectedSection {
  constructor(public sectionIds: number[], public section_names: string[]) {

  }
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
  in_kind_amount_local: string;
  partner_contribution_local: string;
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

export type ExpectedResult = {
  id: number;
  cp_output: number;
  cp_output_name: string;
  intervention: number;
  ll_results: [];
  ram_indicators: number[];
  ram_indicator_names: number[];
}

export type CpOutput = {
  id: number;
  name: string;
  wbs: string;
  country_programme: number;
}

export class PlannedVisit {
  id: number | null = null;
  year: string | null = null;
  programmatic_q1: number = 0;
  programmatic_q2: number = 0;
  programmatic_q3: number = 0;
  programmatic_q4: number = 0;
}

