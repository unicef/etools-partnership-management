import {GenericObject} from '@unicef-polymer/etools-types';
import {ModelsCommon} from './models.common';

export class PartnerAssessment {
  id: number | null = null;
  type: string | null = null;
  completed_date: string | null = null;
  report_attachment: any | null = null;
  report: any | null = null;
  active = true;
  partner: number | null = null;
}

export class PartnerCoreValAssessment extends ModelsCommon {
  id: number | null = null;
  date = ''; // TODO: use a date object
  attachment: string | number = '';

  constructor(data: GenericObject) {
    super();
    this.setObjProperties(data);
  }
}

export class PartnerIntervention {}

export class PartnerPlannedEngagement {}

export class MinimalStaffMember extends ModelsCommon {
  id: number | null = null;
  name = '';
  first_name = '';
  last_name = '';
  active = true;

  constructor(staffMemberData: GenericObject) {
    super();

    if (Object.keys(staffMemberData)) {
      this.setObjProperties(staffMemberData);
      this.name = this.first_name + ' ' + this.last_name;
    }
  }
}

export class StaffMember extends MinimalStaffMember {
  title = '';
  email = '';
  phone = '';

  constructor(staffMemberData: GenericObject) {
    super(staffMemberData);

    if (Object.keys(staffMemberData)) {
      this.setObjProperties(staffMemberData);
    }
  }
}

export class Partner extends ModelsCommon {
  id: null | number = null;
  alternate_name = '';
  assessments: PartnerAssessment[] = [];
  basis_for_risk_rating = '';
  blocked = false;
  city = '';
  core_values_assessment_date = ''; // TODO: update type to date
  core_values_assessments: PartnerCoreValAssessment[] = [];
  country = '';
  created = ''; // TODO: update type to date
  cso_type = '';
  deleted_flag = false;
  description = '';
  email = '';
  // TODO: check expiring_assessment_flag warning, it might be related to a flag from this object
  flags: GenericObject = {};
  hact_min_requirements: GenericObject = {};
  hact_values: GenericObject = {};
  hidden = false;
  interventions: PartnerIntervention[] = [];
  last_assessment_date = ''; // TODO: update type to date
  monitoring_activity_groups: number[][] = [];
  name = '';
  partner_type = '';
  partner_type_slug = ''; // TODO: if cannot be used => remove property
  phone_number = '';
  planned_engagement: PartnerPlannedEngagement = {};
  planned_visits: any[] = [];
  postal_code = '';
  psea_assessment_date = '';
  rating = '';
  sea_risk_rating_name = '';
  shared_with: string[] = [];
  short_name = '';
  staff_members: StaffMember[] = [];
  street_address = '';
  total_ct_cp = '';
  total_ct_cy = '';
  total_ct_ytd = '';
  type_of_assessment = '';
  vendor_number = '';
  vision_synced = false;
  [key: string]: any;

  constructor(partnerDataObj: GenericObject) {
    super();
    if (partnerDataObj && Object.keys(partnerDataObj)) {
      this.setObjProperties(partnerDataObj);
    }
    this._normalizePartnerData();
  }

  getSaveCVARequestPayload(cvaData: GenericObject) {
    return {
      id: this.id,
      core_values_assessments: [new PartnerCoreValAssessment(cvaData)]
    };
  }

  updateStaffMembers(staffMembers: GenericObject) {
    if (staffMembers.length > 0) {
      const sm: StaffMember[] = [];
      staffMembers.forEach((staffM: GenericObject) => {
        sm.push(new StaffMember(staffM));
      });
      this.staff_members = sm;
    }
  }

  private _normalizePartnerData() {
    this.updateStaffMembers(this.staff_members);
    // TODO1  Do we need to do this? are we using this fields in a maner that requires this extra work?

    // TODO2 dependent on TODO1= true: normalize the other prop data that contains partner types
    // assessments, core_values_assessments, interventions, planned_engagement
  }
}

export class PartnerListItem {}
