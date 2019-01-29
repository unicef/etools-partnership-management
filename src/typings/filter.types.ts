export type ListFilterOption = {
  filterName: string,
  type: string,
  selectionOptions?: [],
  optionValue?: string,
  optionLabel?: string,
  alreadySelected?: [],
  dateSelected?: string,
  selectedValue?: any,
  path: string,
  selected: boolean,
  minWidth?: string,
  hideSearch?: boolean,
  allowEmpty?: boolean,
  singleSelection?: boolean,
  disabled?: boolean,
  disableMenuOption?: boolean

  [key: string]: any;
}

export type SelectedFilterOption = {
  filterName: string,
  selectedValue: any,
  allowEmpty?: boolean,
  disabled?: boolean,
  disableMenuOption?: boolean
}

export type ListOrSelectedFilterOption = ListFilterOption | SelectedFilterOption;
