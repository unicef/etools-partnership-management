import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {get as getTranslation} from 'lit-translate';
import {EtoolsFilterTypes} from '@unicef-polymer/etools-filters/src/etools-filters';
import {FiltersHelper} from '@unicef-polymer/etools-filters/src/filters-helper.class';

export enum InterventionFilterKeys {
  search = 'search',
  type = 'type',
  status = 'status',
  section = 'section',
  offices = 'offices',
  cp_outputs = 'cp_outputs',
  donors = 'donors',
  partners = 'partners',
  grants = 'grants',
  unicef_focal_points = 'unicef_focal_points',
  budget_owner = 'budget_owner',
  cpStructures = 'cpStructures',
  start = 'start',
  end = 'end',
  endAfter = 'endAfter',
  contingency_pd = 'contingency_pd',
  editable_by = 'editable_by'
}

export const selectedValueTypeByFilterKey: AnyObject = {
  [InterventionFilterKeys.search]: 'string',
  [InterventionFilterKeys.type]: 'Array',
  [InterventionFilterKeys.status]: 'Array',
  [InterventionFilterKeys.section]: 'Array',
  [InterventionFilterKeys.offices]: 'Array',
  [InterventionFilterKeys.cp_outputs]: 'Array',
  [InterventionFilterKeys.donors]: 'Array',
  [InterventionFilterKeys.partners]: 'Array',
  [InterventionFilterKeys.grants]: 'Array',
  [InterventionFilterKeys.unicef_focal_points]: 'Array',
  [InterventionFilterKeys.budget_owner]: 'Array',
  [InterventionFilterKeys.start]: 'string',
  [InterventionFilterKeys.end]: 'string',
  [InterventionFilterKeys.endAfter]: 'string',
  [InterventionFilterKeys.contingency_pd]: 'boolean',
  [InterventionFilterKeys.editable_by]: 'string'
};

export const InterventionsFiltersHelper = new FiltersHelper(selectedValueTypeByFilterKey);

export function getInterventionFilters() {
  return [
    {
      filterName: getTranslation('GENERAL.SEARCH_RECORDS'),
      filterNameKey: 'GENERAL.SEARCH_RECORDS',
      filterKey: InterventionFilterKeys.search,
      type: EtoolsFilterTypes.Search,
      selectedValue: '',
      selected: true
    },
    {
      filterName: getTranslation('CP_STRUCTURE'),
      filterNameKey: 'CP_STRUCTURE',
      filterKey: InterventionFilterKeys.cpStructures,
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
      filterName: getTranslation('INTERVENTIONS_LIST.COUNTRY_PROGRAMME_OUTPUT'),
      filterNameKey: 'INTERVENTIONS_LIST.COUNTRY_PROGRAMME_OUTPUT',
      filterKey: InterventionFilterKeys.cp_outputs,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'id',
      optionLabel: 'name',
      selectionOptions: [],
      selectedValue: [],
      selected: false,
      minWidth: '400px'
    },
    {
      filterName: getTranslation('INTERVENTIONS_LIST.DONORS'),
      filterNameKey: 'INTERVENTIONS_LIST.DONORS',
      filterKey: InterventionFilterKeys.donors,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'value',
      optionLabel: 'label',
      selectionOptions: [],
      selectedValue: [],
      selected: false,
      minWidth: '400px'
    },
    {
      filterName: getTranslation('INTERVENTIONS_LIST.PARTNERS'),
      filterNameKey: 'INTERVENTIONS_LIST.PARTNERS',
      filterKey: InterventionFilterKeys.partners,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      optionValue: 'value',
      optionLabel: 'label',
      selectedValue: [],
      selected: true,
      minWidth: '400px',
      hideSearch: false
    },
    {
      filterName: getTranslation('INTERVENTIONS_LIST.ENDS_BEFORE'),
      filterNameKey: 'INTERVENTIONS_LIST.ENDS_BEFORE',
      filterKey: InterventionFilterKeys.end,
      type: EtoolsFilterTypes.Date, // datepicker-lite
      path: 'endDate',
      selectedValue: '',
      selected: false
    },
    {
      filterName: getTranslation('INTERVENTIONS_LIST.GRANTS'),
      filterNameKey: 'INTERVENTIONS_LIST.GRANTS',
      filterKey: InterventionFilterKeys.grants,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'value',
      optionLabel: 'label',
      selectionOptions: [],
      selectedValue: [],
      selected: false,
      minWidth: '400px'
    },
    {
      filterName: getTranslation('INTERVENTIONS_LIST.OFFICES'),
      filterNameKey: 'INTERVENTIONS_LIST.OFFICES',
      filterKey: InterventionFilterKeys.offices,
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
      filterName: getTranslation('INTERVENTIONS_LIST.PD_TYPE'),
      filterNameKey: 'INTERVENTIONS_LIST.PD_TYPE',
      filterKey: InterventionFilterKeys.type,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'value',
      optionLabel: 'label',
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '400px',
      hideSearch: true
    },
    {
      filterName: getTranslation('INTERVENTIONS_LIST.SECTIONS'),
      filterNameKey: 'INTERVENTIONS_LIST.SECTIONS',
      filterKey: InterventionFilterKeys.section,
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
      filterName: getTranslation('INTERVENTIONS_LIST.STARTS_AFTER'),
      filterNameKey: 'INTERVENTIONS_LIST.STARTS_AFTER',
      filterKey: InterventionFilterKeys.start,
      type: EtoolsFilterTypes.Date, // datepicker-lite
      path: 'startDate',
      selectedValue: '',
      selected: false
    },
    {
      filterName: getTranslation('INTERVENTIONS_LIST.ENDS_AFTER'),
      filterNameKey: 'INTERVENTIONS_LIST.ENDS_AFTER',
      filterKey: InterventionFilterKeys.endAfter,
      type: EtoolsFilterTypes.Date,
      selectedValue: '',
      path: 'endAfter',
      selected: false
    },
    {
      filterName: getTranslation('GENERAL.STATUS'),
      filterNameKey: 'GENERAL.STATUS',
      filterKey: InterventionFilterKeys.status,
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
      filterName: getTranslation('INTERVENTIONS_LIST.UNICEF_FOCAL_POINT'),
      filterNameKey: 'INTERVENTIONS_LIST.UNICEF_FOCAL_POINT',
      filterKey: InterventionFilterKeys.unicef_focal_points,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'id',
      optionLabel: 'name',
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '400px'
    },
    {
      filterName: getTranslation('INTERVENTIONS_LIST.BUDGET_OWNER'),
      filterNameKey: 'INTERVENTIONS_LIST.BUDGET_OWNER',
      filterKey: InterventionFilterKeys.budget_owner,
      type: EtoolsFilterTypes.DropdownMulti,
      optionValue: 'id',
      optionLabel: 'name',
      selectionOptions: [],
      selectedValue: [],
      selected: false,
      minWidth: '400px'
    },
    {
      filterName: getTranslation('INTERVENTIONS_LIST.CONTINGENCY_PD'),
      filterNameKey: 'INTERVENTIONS_LIST.CONTINGENCY_PD',
      filterKey: InterventionFilterKeys.contingency_pd,
      type: EtoolsFilterTypes.Toggle,
      selectedValue: false,
      selected: true
    },
    {
      filterName: getTranslation('EDITABLE_BY'),
      filterNameKey: 'EDITABLE_BY',
      filterKey: InterventionFilterKeys.editable_by,
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
