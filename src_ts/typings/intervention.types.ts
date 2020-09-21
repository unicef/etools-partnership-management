import {Permission} from './globals.types';
import CONSTANTS from '../config/app-constants';

export class PlannedBudget {
  currency?: string;
  unicef_cash_local?: string;
  total?: string;
  in_kind_amount_local?: string;
  partner_contribution_local?: string;
}

export class InterventionAttachment {
  id?: number;
  active = true;
  type?: number;
  intervention?: number;
  attachment_document?: string | number | File;
  [key: string]: undefined | number | string | boolean | File;
}

export class FrsDetails {
  currencies_match = false;
  earliest_start_date: string | null = null;
  frs: Fr[] = [];
  latest_end_date: string | null = null;
  multi_curr_flag = false;
  total_actual_amt = 0;
  total_frs_amt = '0';
  total_intervention_amt = 0;
  total_outstanding_amt = 0;
}

export interface Fr {
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

export class Intervention {
  id: number | null = null;
  agreement?: number;
  document_type?: string;
  country_programme?: number;
  number?: string;
  reference_number_year?: string | null = null;
  prc_review_attachment?: number | string;
  signed_pd_attachment?: number | string;
  title?: string;
  status = '';
  start = '';
  end = '';
  submitted_to_prc = false;
  submission_date_prc?: string;
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
  sections: [] = [];
  frs: number[] = [];
  frs_details = new FrsDetails();
  contingency_pd?: boolean;
  planned_budget = new PlannedBudget();
  flat_locations: [] = [];
  result_links: ExpectedResult[] = [];
  planned_visits: PlannedVisit[] = [];
  in_amendment = false;
  amendments: InterventionAmendment[] = [];
  // distributions: [];
  activation_letter_attachment: number | string | null = null;
  attachments: InterventionAttachment[] = [];
  permissions?: Permission<InterventionPermissionsFields>;
  cfei_number?: string;
  [key: string]: any;

  // TODOO
  public isDraft() {
    return this.status === CONSTANTS.STATUSES.Draft.toLowerCase() || status === '';
  }
  public isContingencyAndHasActivationLetter() {
    return this.contingency_pd && this.activation_letter_attachment;
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
  signed_amendment_attachment: number | string | null = null;
  internal_prc_review: number | string | null = null;
}

export class ListItemIntervention {
  start = '';
  end = '';
  frs_earliest_start_date: string | null = '';
  frs_latest_end_date: string | null = '';
  partner_name?: string = '';
  cp_outputs: number[] = [];
  unicef_budget = 0;
  cso_contribution = 0;
  country_programme?: number;
  title?: string = '';
  status = '';
  number?: string = '';
  offices: [] = [];
  sections: number[] = [];
  section_names: string[] | null = null;
  document_type?: string = '';
  unicef_focal_points: [] = [];
  [key: string]: any;
}

export class SelectedSection {
  sectionIds: number[];
  section_names: string[];

  constructor(sectionIds: number[], section_names: string[]) {
    this.sectionIds = sectionIds;
    this.section_names = section_names;
  }
}

export class InterventionPermissionsFields {
  id = false;
  status = false;

  // details - Partnership Information
  agreement = false;
  document_type = false;
  number = false;
  title = false;
  offices = false;
  unicef_focal_points = false;
  partner_focal_points = false;

  // details - PD or SSFA Details
  contingency_pd = false;
  country_programme = false;
  start = false;
  end = false;
  sections = false;
  flat_locations = false;
  reporting_requirements = false;

  // details - PD Output or SSFA Expected results
  result_links = false;

  // details - Planned Budget
  planned_budget = false;
  planned_budget_unicef_cash = false; // TODO: this should be also received from backend

  // details - Planned Visits
  planned_visits = false;

  // review & sign - Signatures & Dates
  submission_date = false;
  submission_date_prc = false;
  review_date_prc = false;
  prc_review_attachment = false;
  partner_authorized_officer_signatory = false;
  signed_by_partner_date = false;
  unicef_signatory = false;
  signed_by_unicef_date = false;
  signed_pd_attachment = false;

  // review & sign - Amendments
  amendments = false;

  // review & sign - FR Numbers
  frs = false;

  // attachments
  attachments = false;
  [x: string]: boolean;
}

export interface ExpectedResult {
  id: number;
  cp_output: number;
  cp_output_name: string;
  intervention: number;
  ll_results: ResultLinkLowerResult[];
  ram_indicators: number[];
  ram_indicator_names: number[];
}

export interface ResultLinkLowerResult {
  // ll_result
  id: number;
  name: string;
  applied_indicators: Indicator[];

  code?: string;
  created?: string;
  result_link?: number;
}

export class IndicatorIndicator {
  id: number | null = null;
  title = '';
  display_type = 'percentage';
  unit = 'number';
}

export class Indicator {
  // Indicator
  id: number | null = null;
  is_active = true;
  is_high_frequency = false;
  indicator: IndicatorIndicator | null = new IndicatorIndicator();
  section: number | null = null;
  baseline: {v?: string | number; d?: string | number} = {};
  target: {v?: string | number; d: string | number} = {d: '1'};
  means_of_verification: string | null = null;
  locations: number[] = [];
  disaggregation: string[] = [];

  cluster_name: string | null = null;
  cluster_indicator_id: number | null = null;
  cluster_indicator_title: string | null = null;
  response_plan_name: string | null = null;
  numerator_label = '';
  denominator_label = '';
}

export interface CpOutput {
  id: number;
  name: string;
  wbs: string;
  country_programme: string;
}

export class PlannedVisit {
  id: number | null = null;
  year: string | null = null;
  programmatic_q1 = '0';
  programmatic_q2 = '0';
  programmatic_q3 = '0';
  programmatic_q4 = '0';
  programmatic: any;
}

export class Disaggregation {
  id: string | null = null;
  name = '';
  active = true;
  disaggregation_values: DisaggregationValue[] = [];
}

export interface DisaggregationValue {
  id: number;
  value: string;
  active: boolean;
}

export interface Location {
  id: string;
  name: string;
  p_code: string;
  gateway: AdminLevel;
  parent?: string;
}

export interface AdminLevel {
  id: number;
  name: string;
  admin_level: string | null;
  created: string;
  modified: string;
}
