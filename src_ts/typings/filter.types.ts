
export class ListFilterOption {
  constructor(item: ListFilterOption) {
    this.filterName = item.filterName;
    this.type = item.type;
    this.selectionOptions = item.selectionOptions;
    this.optionValue = item.optionValue;
    this.optionLabel = item.optionLabel;
    this.selectedValue = item.selectedValue;
    this.path = item.path;
    this.selected = item.selected;
    this.minWidth = item.minWidth;
    this.hideSearch = item.hideSearch;
    this.allowEmpty = item.allowEmpty;
    this.singleSelection = item.singleSelection;
    this.disabled = item.disabled;
    this.disableMenuOption = item.disableMenuOption;
  }

  filterName: string = '';
  type: string = '';
  selectionOptions?: string[] | number[] | any[];
  optionValue?: string;
  optionLabel?: string;
  selectedValue?: any;
  path: string = '';
  selected: boolean = false;
  minWidth?: string;
  hideSearch?: boolean;
  allowEmpty?: boolean;
  singleSelection?: boolean;
  disabled?: boolean;
  disableMenuOption?: boolean;

  [key: string]: any;
}

export interface SelectedFilterOption {
  filterName: string;
  selectedValue: any;
  allowEmpty?: boolean;
  disabled?: boolean;
  disableMenuOption?: boolean;
}

export type ListOrSelectedFilterOption = ListFilterOption | SelectedFilterOption;// TODO

