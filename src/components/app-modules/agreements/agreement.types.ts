import {IPermission} from '../../../typings/globals.types';
import { StaffMember } from '../../../typings/partner.types';
export class Agreement {
  id?: number | null = undefined;
  authorized_officers: Array<StaffMember> = [];
  amendments?: AgreementAmendment[] = [];
  agreement_type?: string | null = null;
  agreement_number?: string = undefined;
  reference_number_year?: number = new Date().getFullYear();
  start?: string = undefined;
  end?: string = undefined;
  signed_by_unicef_date?: string | null = null;
  signed_by_partner_date?: string | null = null;
  status?: string = undefined;
  partner?: number | null = null;
  country_programme?: number = undefined;
  signed_by?: string | null = null;
  partner_manager?: number | null = null;
  partner_name?: string = undefined;
  special_conditions_pca?: boolean = false;
  permissions?: IPermission<AgreementPermissionFields> = {
    edit: new AgreementPermissionFields(true),
    required: new AgreementPermissionFields(false)
  };
  attachment?: string = undefined;

  [key: string] : any;
}

export class AgreementAmendment {
  id: number | null = null;
  signed_date: string | null = null;
  types: [] = [];
  signed_amendment_attachment: number | string | null = null;
}

class AgreementPermissionFields  {
  constructor(forEdit: boolean) {
    if (forEdit) {
      this._setEditPermissionsForNewAgreement();
    } else {
      this._setRequiredPermissionsForNewAgreement();
    }
  }

  agreement_type: boolean = true;
  amendments: boolean = false;
  attachment: boolean = true;
  authorized_officers: boolean = true;
  country_programme: boolean = true;
  end: boolean = true;
  partner: boolean = true;
  partner_manager: boolean = true;
  signed_by_id: boolean = true;
  signed_by_partner_date: boolean = true;
  signed_by_unicef_date: boolean = true;
  start: boolean = true;
  special_conditions_pca: boolean = true;

  _setEditPermissionsForNewAgreement() {
    this.agreement_type = true;
    this.amendments = false;
    this.attachment = true;
    this.authorized_officers = true;
    this.country_programme = true;
    this.end = true;
    this.partner = true;
    this.partner_manager = true;
    this.signed_by_id = true;
    this.signed_by_partner_date = true;
    this.signed_by_unicef_date = true;
    this.start = true;
    this.special_conditions_pca = true;
  }

  _setRequiredPermissionsForNewAgreement() {
    this.agreement_type = true;
    this.amendments = false;
    this.attachment = false;
    this.authorized_officers = false;
    this.country_programme = true;
    this.end = false;
    this.partner = true,
    this.signed_by_id = false;
    this.partner_manager = false;
    this.signed_by_partner_date = false;
    this.signed_by_unicef_date = false;
    this.start = false;
    this.special_conditions_pca = false;
  }
}
