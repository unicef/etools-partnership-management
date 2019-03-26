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
  staff_members: StaffMember[] = []; // TODO: move StaffMember from types file
  street_address: string = '';
  total_ct_cp: string = '';
  total_ct_cy: string = '';
  total_ct_ytd: string = '';
  type_of_assessment: string = '';
  vendor_number: string = '';
  vision_synced: boolean = false;

  constructor(partnerDataObj: GenericObject) {
    super();
    this.setObjProperties(partnerDataObj, Object.keys(this as object));
    this._normalizePartnerData();
  }

  public getPartnerSaveReqPayload(type: string,
                                  data: GenericObject): Partner | StaffMemberSaveReqPayload | CVASaveReqPayload {
    switch (type) {
      case 'staff_members':
        return new StaffMemberSaveReqPayload(this.id, data);
      case 'core_values_assessments':
        return new CVASaveReqPayload(this.id, data);
      default:
        return this;
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
    // TODO: normalize the other prop data that contains partner types
    // assessments, core_values_assessments, interventions, planned_engagement
  }

}

export class StaffMemberSaveReqPayload {
  id: number = 0;
  staff_members: StaffMember[] = [];

  constructor(id: number | null, staffMemberData: GenericObject) {
    if (!id) {
      throw new Error('StaffMemberSaveReqPayload: invalid partner id!');
    }
    this.id = id;
    this.staff_members = [new StaffMember(staffMemberData)];
  }
}

export class CVASaveReqPayload {
  id: number = 0;
  core_values_assessments: PartnerCoreValAssessment[] = [];

  constructor(id: number | null, cvaData: GenericObject) {
    if (!id) {
      throw new Error('CVASaveReqPayload: invalid partner id!');
    }
    this.id = id;
    this.core_values_assessments = [new PartnerCoreValAssessment(cvaData)];
  }
}

export class PartnerListItem {

}

export class PartnerAssessment {

}

export class PartnerCoreValAssessment extends ModelsCommon {
  id: number | null = null;
  date: string = ''; // TODO: use a date object
  attachment: string | number = '';

  constructor(data: GenericObject) {
    super();
    this.setObjProperties(data, Object.keys(this as object));
  }
}

export class PartnerIntervention {

}

export class PartnerPlannedEngagement {

}

export class MinimalStaffMember extends ModelsCommon {
  id: number | null = null;
  name: string = '';
  first_name: string = '';
  last_name: string = '';

  constructor(staffMemberData: GenericObject) {
    super();
    this.setObjProperties(staffMemberData, Object.keys(this as object));
    this.name = this.first_name + ' ' + this.last_name;
  }
}

export class StaffMember extends MinimalStaffMember {
  title: string = '';
  email: string = '';
  phone: string = '';
  active: boolean = true;

  constructor(staffMemberData: GenericObject) {
    super(staffMemberData);
    this.setObjProperties(staffMemberData, Object.keys(this as object));
  }
}
