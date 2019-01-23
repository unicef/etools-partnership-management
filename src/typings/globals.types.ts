export type GenericObject = {
  [key: string]: any
}

export interface IPermission<T> {
  edit: T;
  required: T;
}

export type UserPermissions = {
  ICT: boolean,
  PME: boolean,
  editAgreementDetails: boolean,
  editInterventionDetails: boolean,
  editPartnerDetails: boolean,
  loggedInDefault: boolean,
  partnershipManager: boolean,
  userInfoMenu: boolean,
  viewAgreementDetails: boolean,
  viewInterventionDetails: boolean,
  viewPartnerDetails: boolean
}


