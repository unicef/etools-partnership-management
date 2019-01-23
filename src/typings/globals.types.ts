export type GenericObject = {
  [key: string]: any
}

export interface IPermission<T> {
  edit: T;
  required: T;
}

export interface EtoolsTab {
  tab: string;
  tabLabel: string;
  hidden: boolean;
}


