import { PolymerElement } from '@polymer/polymer';

export declare const _: any;


/*
* The type Constructor<T> is an alias for the construct signature
* that describes a type which can construct objects of the generic type T
* and whose constructor function accepts an arbitrary number of parameters of any type
* On the type level, a class can be represented as a newable function
*/
export type Constructor<T> = new(...args: any[]) => T;

export type MixinFunction = <T extends Constructor<PolymerElement>>(baseElement: T) => T & Constructor<PolymerElement>;

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
  first_name: string;
  last_name: string;
  middle_name: string;
  name: string;
  email: string;
  country: object;
  country_override: number;
  countries_available: MinimalCountry[];
  groups: UserGroup[];
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
  currentTarget: any;
}

export class Paginator {
  page: number = 1;
  page_size: number = 10;
  count: number | null = null;
  visible_range: [] = [];
}

export type CpStructure = {
  id: string;
  name: string;
  expired: boolean;
  future: boolean;
  active: boolean;
  special: boolean;
  invalid: boolean;
  from_date: string;
  to_date: string;
  wbs: string;
}

export interface MinimalCountry {
  id: number;
  name: string;
  business_area_code: string;
}

export interface Country extends MinimalCountry {

  country_short_code: string;
  initial_zoom: number;
  latitude: string;
  local_currency: string;
  local_currency_code: string;
  local_currency_id: number;
  longitude: string;
}

export type LabelAndValue = {
  label: string;
  value: string;
}

export type IdAndName = {
  id: string;
  name: string;
}

