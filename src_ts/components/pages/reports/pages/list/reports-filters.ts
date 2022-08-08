import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {get as getTranslation} from 'lit-translate';
import {FiltersHelper} from '@unicef-polymer/etools-filters/src/filters-helper.class';
import {EtoolsFilterTypes} from '@unicef-polymer/etools-filters/src/etools-filters';

export enum ReportsFilterKeys {
  pd_ref_title = 'pd_ref_title',
  external_partner_id = 'external_partner_id',
  cp_output = 'cp_output',
  section = 'section',
  status = 'status',
  report_type = 'report_type',
  unicef_focal_points = 'unicef_focal_points',
  year = 'year'
}

export const selectedValueTypeByFilterKey: AnyObject = {
  [ReportsFilterKeys.pd_ref_title]: 'string',
  [ReportsFilterKeys.external_partner_id]: 'string',
  [ReportsFilterKeys.cp_output]: 'string',
  [ReportsFilterKeys.section]: 'string',
  [ReportsFilterKeys.status]: 'Array',
  [ReportsFilterKeys.report_type]: 'string',
  [ReportsFilterKeys.unicef_focal_points]: 'Array',
  [ReportsFilterKeys.year]: 'string'
};

export const ReportsFiltersHelper = new FiltersHelper(selectedValueTypeByFilterKey);

function getYears() {
  const currentY = new Date().getFullYear();
  const years = [];
  for (let i = currentY - 5; i <= currentY + 5; i++) {
    years.push({value: i, label: i});
  }
  return years;
}

export function getReportFilters() {
  return [
    {
      filterName: getTranslation('GENERAL.SEARCH_RECORDS'),
      filterKey: ReportsFilterKeys.pd_ref_title,
      type: EtoolsFilterTypes.Search,
      selectedValue: '',
      selected: true
    },
    {
      filterName: 'CP Output',
      filterKey: ReportsFilterKeys.cp_output,
      type: EtoolsFilterTypes.Dropdown,
      singleSelection: true,
      selectionOptions: [],
      selectedValue: null,
      optionValue: 'id',
      optionLabel: 'name',
      selected: false,
      minWidth: '350px',
      hideSearch: true
    },
    {
      filterName: 'Partner',
      filterKey: ReportsFilterKeys.external_partner_id,
      type: EtoolsFilterTypes.Dropdown,
      singleSelection: true,
      selectionOptions: [],
      selectedValue: null,
      optionValue: 'value',
      optionLabel: 'label',
      selected: false,
      minWidth: '400px',
      hideSearch: true
    },
    {
      filterName: 'Report Status',
      filterKey: ReportsFilterKeys.status,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      optionValue: 'value',
      optionLabel: 'label',
      selected: false,
      minWidth: '400px',
      hideSearch: true
    },
    {
      filterName: 'Year',
      filterKey: ReportsFilterKeys.year,
      type: EtoolsFilterTypes.Dropdown,
      selectionOptions: getYears(),
      selectedValue: [],
      optionValue: 'value',
      optionLabel: 'label',
      selected: false,
      minWidth: '400px'
    },
    {
      filterName: 'Report Type',
      filterKey: ReportsFilterKeys.report_type,
      type: EtoolsFilterTypes.Dropdown,
      singleSelection: true,
      selectionOptions: [],
      selectedValue: null,
      optionValue: 'value',
      optionLabel: 'label',
      selected: true,
      minWidth: '400px',
      hideSearch: false
    },
    {
      filterName: 'Section',
      filterKey: ReportsFilterKeys.section,
      type: EtoolsFilterTypes.Dropdown,
      singleSelection: true,
      selectionOptions: [],
      selectedValue: null,
      optionValue: 'id',
      optionLabel: 'name',
      selected: false,
      minWidth: '400px',
      hideSearch: false
    },
    {
      filterName: 'UNICEF focal points',
      filterKey: ReportsFilterKeys.unicef_focal_points,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      optionValue: 'email',
      optionLabel: 'name',
      selected: false,
      minWidth: '400px',
      hideSearch: false
    }
  ];
}
