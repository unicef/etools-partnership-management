import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {EtoolsFilterTypes} from '@unicef-polymer/etools-unicef/src/etools-filters/etools-filters';
import {FiltersHelper} from '@unicef-polymer/etools-unicef/src/etools-filters/filters-helper.class';

export enum GDDInterventionFilterKeys {
  search = 'search',
  status = 'status',
  section = 'section',
  offices = 'offices',
  cp_outputs = 'cp_outputs',
  donors = 'donors',
  partners = 'partners',
  grants = 'grants',
  unicef_focal_points = 'unicef_focal_points',
  budget_owner = 'budget_owner__in',
  cpStructures = 'country_programme',
  start = 'start',
  end = 'end',
  endAfter = 'end_after',
  editable_by = 'editable_by'
}

export const selectedValueTypeByFilterKey: AnyObject = {
  [GDDInterventionFilterKeys.search]: 'string',
  [GDDInterventionFilterKeys.status]: 'Array',
  [GDDInterventionFilterKeys.section]: 'Array',
  [GDDInterventionFilterKeys.offices]: 'Array',
  [GDDInterventionFilterKeys.cp_outputs]: 'Array',
  [GDDInterventionFilterKeys.donors]: 'Array',
  [GDDInterventionFilterKeys.partners]: 'Array',
  [GDDInterventionFilterKeys.grants]: 'Array',
  [GDDInterventionFilterKeys.unicef_focal_points]: 'Array',
  [GDDInterventionFilterKeys.budget_owner]: 'Array',
  [GDDInterventionFilterKeys.start]: 'string',
  [GDDInterventionFilterKeys.end]: 'string',
  [GDDInterventionFilterKeys.endAfter]: 'string',
  [GDDInterventionFilterKeys.editable_by]: 'string'
};

export const GDDInterventionsFiltersHelper = new FiltersHelper(selectedValueTypeByFilterKey);

export function getGDDInterventionFilters() {
  return [
    {
      filterName: getTranslation('GENERAL.SEARCH_RECORDS'),
      filterNameKey: 'GENERAL.SEARCH_RECORDS',
      filterKey: GDDInterventionFilterKeys.search,
      type: EtoolsFilterTypes.Search,
      selectedValue: '',
      selected: true
    },
    {
      filterName: getTranslation('CP_STRUCTURE'),
      filterNameKey: 'CP_STRUCTURE',
      filterKey: GDDInterventionFilterKeys.cpStructures,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      optionValue: 'id',
      optionLabel: 'name',
      selectedValue: [],
      selected: false,
      minWidth: '400px',
      hideSearch: true
    },
    {
      filterName: getTranslation('GDD_LIST.COUNTRY_PROGRAMME_OUTPUT'),
      filterNameKey: 'GDD_LIST.COUNTRY_PROGRAMME_OUTPUT',
      filterKey: GDDInterventionFilterKeys.cp_outputs,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'id',
      optionLabel: 'name',
      selectionOptions: [],
      selectedValue: [],
      selected: false,
      minWidth: '400px'
    },
    {
      filterName: getTranslation('GDD_LIST.DONORS'),
      filterNameKey: 'GDD_LIST.DONORS',
      filterKey: GDDInterventionFilterKeys.donors,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'value',
      optionLabel: 'label',
      selectionOptions: [],
      selectedValue: [],
      selected: false,
      minWidth: '400px'
    },
    {
      filterName: getTranslation('GDD_LIST.PARTNERS'),
      filterNameKey: 'GDD_LIST.PARTNERS',
      filterKey: GDDInterventionFilterKeys.partners,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      optionValue: 'id',
      optionLabel: 'name',
      selectedValue: [],
      selected: true,
      minWidth: '400px',
      hideSearch: false
    },
    {
      filterName: getTranslation('GDD_LIST.ENDS_BEFORE'),
      filterNameKey: 'GDD_LIST.ENDS_BEFORE',
      filterKey: GDDInterventionFilterKeys.end,
      type: EtoolsFilterTypes.Date, // datepicker-lite
      path: 'endDate',
      selectedValue: '',
      selected: false
    },
    {
      filterName: getTranslation('GDD_LIST.GRANTS'),
      filterNameKey: 'GDD_LIST.GRANTS',
      filterKey: GDDInterventionFilterKeys.grants,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'value',
      optionLabel: 'label',
      selectionOptions: [],
      selectedValue: [],
      selected: false,
      minWidth: '400px'
    },
    {
      filterName: getTranslation('GDD_LIST.OFFICES'),
      filterNameKey: 'GDD_LIST.OFFICES',
      filterKey: GDDInterventionFilterKeys.offices,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'id',
      optionLabel: 'name',
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '250px',
      hideSearch: true
    },
    {
      filterName: getTranslation('GDD_LIST.SECTIONS'),
      filterNameKey: 'GDD_LIST.SECTIONS',
      filterKey: GDDInterventionFilterKeys.section,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'id',
      optionLabel: 'name',
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '350px',
      hideSearch: true
    },
    {
      filterName: getTranslation('GDD_LIST.STARTS_AFTER'),
      filterNameKey: 'GDD_LIST.STARTS_AFTER',
      filterKey: GDDInterventionFilterKeys.start,
      type: EtoolsFilterTypes.Date, // datepicker-lite
      path: 'startDate',
      selectedValue: '',
      selected: false
    },
    {
      filterName: getTranslation('GDD_LIST.ENDS_AFTER'),
      filterNameKey: 'GDD_LIST.ENDS_AFTER',
      filterKey: GDDInterventionFilterKeys.endAfter,
      type: EtoolsFilterTypes.Date,
      selectedValue: '',
      path: 'endAfter',
      selected: false
    },
    {
      filterName: getTranslation('GENERAL.STATUS'),
      filterNameKey: 'GENERAL.STATUS',
      filterKey: GDDInterventionFilterKeys.status,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'value',
      optionLabel: 'label',
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '160px',
      hideSearch: true
    },
    {
      filterName: getTranslation('GDD_LIST.UNICEF_FOCAL_POINT'),
      filterNameKey: 'GDD_LIST.UNICEF_FOCAL_POINT',
      filterKey: GDDInterventionFilterKeys.unicef_focal_points,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'id',
      optionLabel: 'name',
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '400px'
    },
    {
      filterName: getTranslation('GDD_LIST.BUDGET_OWNER'),
      filterNameKey: 'GDD_LIST.BUDGET_OWNER',
      filterKey: GDDInterventionFilterKeys.budget_owner,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'id',
      optionLabel: 'name',
      selectionOptions: [],
      selectedValue: [],
      selected: false,
      minWidth: '400px'
    },
    {
      filterName: getTranslation('EDITABLE_BY'),
      filterNameKey: 'EDITABLE_BY',
      filterKey: GDDInterventionFilterKeys.editable_by,
      type: EtoolsFilterTypes.Dropdown,
      optionValue: 'value',
      optionLabel: 'label',
      selectionOptions: [
        {label: 'UNICEF', value: 'unicef'},
        {label: getTranslation('PARTNER'), value: 'partner'}
      ],
      selectedValue: '',
      hideSearch: true,
      selected: false
    }
  ];
}
