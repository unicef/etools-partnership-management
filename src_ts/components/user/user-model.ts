import {AnyObject} from '../../typings/globals.types';

// TODO: improve this user model
export interface EtoolsUserModel {
  countries_available: AnyObject[];
  groups: AnyObject[];
  country: AnyObject;
  country_override: number;
  email: string;
  first_name: string;
  guid: string;
  is_active: string;
  is_staff: string;
  is_superuser: string;
  job_title: string;
  last_login: string;
  last_name: string;
  middle_name: string;
  name: string;
  office: string | null;
  oic: any;
  user: number;
  username: string;
  vendor_number: string | null;
  [key: string]: any;
}
