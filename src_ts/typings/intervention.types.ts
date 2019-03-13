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
  frs_details = new FrsDetails();
  contingency_pd: boolean = false;
  planned_budget = new PlannedBudget();
  flat_locations: [] = [];
  result_links: ExpectedResult[] = [];
  planned_visits: PlannedVisit[] = [];
  in_amendment: boolean = false;
  amendments: InterventionAmendment[] = [];
  //distributions: [];
  activation_letter_attachment: number| string| null = null;
  attachments: InterventionAttachment[] = [];
  permissions?: IPermission<InterventionPermissionsFields>;
  [key: string] : any;

  //Domain driven design idea
  public isDraft() {
    return this.status === CONSTANTS.STATUSES.Draft.toLowerCase() ||
        status === '';
  }
  public isContingencyAndHasActivationLetter() {
    return this.contingency_pd &&
      this.activation_letter_attachment;
  }
}

export class InterventionAmendment {
  id?: number;
  intervention?: number;
  created?: string;

  amendment_number: string | null = null;
  types: string[] = [];
  other_description: string | null = null;
  signed_date: string | null = null;
  signed_amendment_attachment: number| string | null = null;
  internal_prc_review: number | string | null = null;
}

export class ListItemIntervention {
  start: string = '';
  end: string = '';
  frs_earliest_start_date: string | null= '';
  frs_latest_end_date: string | null= '';
  partner_name?: string = '';
  cp_outputs: number[] = [];
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
  constructor(public sectionIds: number[],
    public section_names: string[]) {

  }
}

export type Section = {
  id: string,
  name: string
}

export class InterventionAttachment  {
  id?: number;
  active: boolean = true;
  type?: number;
  intervention?: number;
  attachment_document?: string | number| File;
  [key: string]: undefined | number | string | boolean | File;
}

export class FrsDetails {
  currencies_match: boolean = false
  earliest_start_date: string | null = null
  frs: Fr[] = [];
  latest_end_date: string | null = null;
  multi_curr_flag: boolean = false;
  total_actual_amt: number = 0;
  total_frs_amt: number = 0;
  total_intervention_amt: number = 0;
  total_outstanding_amt: number = 0;
}

export type Fr = {
  id: number;
  currency: string;
  fr_number: string;
  line_item_details: [];
  end_date: string;
  start_date: string;
  actual_amt: string;
  actual_amt_local: string;
  outstanding_amt: string;
  outstanding_amt_local: string;
  total_amt: string;
  total_amt_local: string;
  vendor_code: string;
}

export class PlannedBudget  {
  currency?: string;
  unicef_cash_local?: string;
  total?: string;
  in_kind_amount_local?: string;
  partner_contribution_local?: string;
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
  ll_results: ResultLinkLowerResult[];
  ram_indicators: number[];
  ram_indicator_names: number[];
}

export type ResultLinkLowerResult = { //ll_result
  id: number;
  name: string;
  applied_indicators: Indicator[];

  code?: string;
  created?: string;
  result_link?: number;
}

export class Indicator {// Indicator
  id: number | null = null;
  is_active: boolean = true;
  is_high_frequency: boolean = false;
  indicator = new IndicatorIndicator();
  section: number | null = null;
  baseline: {v?: string, d?: string} = {};
  target: {v?: string, d: string} = {d: '1'};
  means_of_verification: string | null = null;
  locations: string[] = [];
  disaggregation: string[] = [];

  cluster_name: string | null = null;
  cluster_indicator_id: number | null = null;
  cluster_indicator_title: string | null = null;
  response_plan_name: string | null = null;
}


export class IndicatorIndicator {
  id: number | null = null;
  title: string = '';
  display_type: string = 'percentage';
  unit: string = 'number'
}

export type CpOutput = {
  id: number;
  name: string;
  wbs: string;
  country_programme: string;
}

export class PlannedVisit {
  id: number | null = null;
  year: string | null = null;
  programmatic_q1: string = '0';
  programmatic_q2: string = '0';
  programmatic_q3: string = '0';
  programmatic_q4: string = '0';
  programmatic: any;
}

export type Disaggregation = {
  id: number;
  name: string;
  active: boolean;
  disaggregation_values: DisaggregationValue[];
}

export type DisaggregationValue = {
  id: number;
  value: string;
  active: boolean;
}

export type Location = {
  id: number;
  name: string;
  p_code: string;
  gateway: AdminLevel;
  parent?: string;
}

export type AdminLevel = {
  id: number;
  name: string;
  admin_level: string | null;
  created: string;
  modified: string;
}

