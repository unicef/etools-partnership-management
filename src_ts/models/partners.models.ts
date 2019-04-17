import {GenericObject} from "../typings/globals.types";
import {ModelsCommon} from "./models.common";

export class Partner extends ModelsCommon {
  id: null | number = null;
  alternate_name: string = '';
  assessments: PartnerAssessment[] = [];
  basis_for_risk_rating: string = '';
  blocked: boolean = false;
  city: string = '';
  core_values_assessment_date: string = ''; // TODO: update type to date
  core_values_assessments: PartnerCoreValAssessment[] = [];
  country: string = '';
  created: string = ''; // TODO: update type to date
  cso_type: string = '';
  deleted_flag: boolean = false;
  description: string = '';
  email: string = '';
  // TODO: check expiring_assessment_flag warning, it might be related to a flag from this object
  flags: GenericObject = {};
  hact_min_requirements: GenericObject = {};
  hact_values: GenericObject = {};
  hidden: boolean = false;
  interventions: PartnerIntervention[] = [];
  last_assessment_date: string = ''; // TODO: update type to date
  name: string = '';
  partner_type: string = '';
  partner_type_slug: string = ''; // TODO: if cannot be used => remove property
  phone_number: string = '';
  planned_engagement: PartnerPlannedEngagement = {};
  planned_visits: any[] = [];
  postal_code: string = '';
  rating: string = '';
  shared_with: string[] = [];
  short_name: string = '';
  staff_members: StaffMember[] = [];
  street_address: string = '';
  total_ct_cp: string = '';
  total_ct_cy: string = '';
  total_ct_ytd: string = '';
  type_of_assessment: string = '';
  vendor_number: string = '';
  vision_synced: boolean = false;
  [key: string]: any;

  constructor(partnerDataObj: GenericObject) {
    super();
    if (partnerDataObj && Object.keys(partnerDataObj)) {
      this.setObjProperties(partnerDataObj);
    }
    this._normalizePartnerData();
  }

  getSaveStaffMemberRequestPayload(staffMemberData : GenericObject) {
     return {
       id: this.id,
       staff_members: [new StaffMember(staffMemberData)]
     };
  }

  getSaveCVARequestPayload(cvaData: GenericObject){
    return {
      id: this.id,
      core_values_assessments: [new PartnerCoreValAssessment(cvaData)]
    }
  }


  private _normalizePartnerData() {
    if (this.staff_members.length > 0) {
      const sm: StaffMember[] = [];
      this.staff_members.forEach((staffM: GenericObject) => {
        sm.push(new StaffMember(staffM));
      });
      this.staff_members = sm;
    }
    //TODO1  Do we need to do this? are we using this fields in a maner that requires this extra work?

    //TODO2 dependent on TODO1= true: normalize the other prop data that contains partner types
    // assessments, core_values_assessments, interventions, planned_engagement
  }

}


export class PartnerListItem {

}

export class PartnerAssessment {
  id?: number;
  type: string | null = null;
  completed_date: string | null = null;
  report_attachment: any | null = null;
  report: any | null = null;
  active: boolean | null = null;
  partner: number | null = null;
}

export class PartnerCoreValAssessment extends ModelsCommon {
  id: number | null = null;
  date: string = ''; // TODO: use a date object
  attachment: string | number = '';

  constructor(data: GenericObject) {
    super();
    this.setObjProperties(data);
  }
}

export class PartnerIntervention {

}

export class PartnerPlannedEngagement {

}

export class MinimalStaffMember extends ModelsCommon {
  id?: number;
  name: string = '';
  first_name: string = '';
  last_name: string = '';
  active: boolean = true;

  constructor(staffMemberData: GenericObject) {
    super();

    if (Object.keys(staffMemberData)) {
      this.setObjProperties(staffMemberData);
      this.name = this.first_name + ' ' + this.last_name;
    }
  }
}

export class StaffMember extends MinimalStaffMember {
  title: string = '';
  email: string = '';
  phone: string = '';

  constructor(staffMemberData: GenericObject) {
    super(staffMemberData);

    if (Object.keys(staffMemberData)) {
      this.setObjProperties(staffMemberData);
    }
  }
}
