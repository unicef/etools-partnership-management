export interface StatusAction {
  label: string;
  hidden: boolean;
  event: string;
  primary?: boolean;
}

export interface Status {
  label: string;
  hidden?: boolean;
  completed: boolean;
  icon?: string;
  iconStyles?: string;
  iconContainerStyles?: string;
}
