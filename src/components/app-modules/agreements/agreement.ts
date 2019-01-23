import {IPermission} from '../../../typings/globals.types';
export class Agreement {
  id: number | undefined = undefined;
  authorized_officers: object[] = [];
  amendments: object[] = [];
  agreement_type: string | null = null;
  agreement_number: string | undefined = undefined;
  reference_number_year: number = new Date().getFullYear();
  start: string | undefined = undefined;
  end: string | undefined = undefined;
  signed_by_unicef_date: string | null = null;
  signed_by_partner_date: string | null = null;
  status: string | undefined = undefined;
  partner: number | null = null;
  country_programme: number | undefined = undefined;
  signed_by: string | null = null;
  partner_manager: number | null = null;
  special_conditions_pca: boolean = false;
  permissions: IPermission<AgreementPermissionFields> = {
    edit: new AgreementPermissionFields(true),
    required: new AgreementPermissionFields(false)
  };
  attachment: string | undefined = undefined;
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
