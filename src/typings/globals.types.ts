export declare const _: any;

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

export interface EtoolsTab {
  tab: string;
  tabLabel: string;
  hidden: boolean;
}

export interface DomRepeatEvent extends CustomEvent {//TODO- should be in polymer declarations
  model: any;
}

export interface PolymerElEvent extends CustomEvent {//TODO - should be in polymer type declarions
  target: any;
}

