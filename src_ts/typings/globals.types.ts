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

export type User = {
  first_name: string,
  last_name: string,
  middle_name: string,
  name: string,
  email: string,
  country: object,
  country_override: number,
  countries_available: [],
  groups: UserGroup[]
}

export type UserGroup = {
  id: number,
  name: string,
  permissions: []
}

export interface EtoolsTab {
  tab: string;
  tabLabel: string;
  hidden: boolean;
}

export interface DomRepeatEvent extends PolymerElEvent {//TODO- should be in polymer declarations
  model: any;
}

export interface PolymerElEvent extends CustomEvent {//TODO - should be in polymer type declarions
  target: any;
  currentTarget: any
}

export class Paginator {
  page: number = 1;
  page_size: number = 10;
  count: number | null = null;
  visible_range: [] = [];
}

export type CpStructure = {
  id: string,
  name: string,
  expired: boolean,
  future: boolean,
  active: boolean,
  special: boolean,
  invalid: boolean,
  from_date: string,
  to_date: string,
  wbs: string
}

export type CountryData = {
  local_currency_code: string;
}

export type LabelAndValue = {
  label: string,
  value: string
}

