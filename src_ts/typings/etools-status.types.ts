export type StatusAction = {
  label: string,
  hidden: boolean,
  event: string,
  primary?: boolean
}

export type Status = {
  label: string,
  hidden?: boolean,
  completed: boolean,
  icon?: string,
  iconStyles?: string
}
