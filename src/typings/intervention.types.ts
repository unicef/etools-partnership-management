import { IPermission } from './globals.types';

export class Intervention {
 contingency_pd: boolean = false;
 permissions: IPermission<InterventionPermissionsFields> = {
   edit: new InterventionPermissionsFields(),
   required: new InterventionPermissionsFields()
 };
 status: string = '';
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
