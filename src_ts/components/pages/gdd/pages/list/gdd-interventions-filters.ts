import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {get as getTranslation} from 'lit-translate';
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
  contingency_pd = 'contingency_pd',
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
  [GDDInterventionFilterKeys.contingency_pd]: 'boolean',
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
      filterName: getTranslation('INTERVENTIONS_LIST.COUNTRY_PROGRAMME_OUTPUT'),
      filterNameKey: 'INTERVENTIONS_LIST.COUNTRY_PROGRAMME_OUTPUT',
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
      filterName: getTranslation('INTERVENTIONS_LIST.DONORS'),
      filterNameKey: 'INTERVENTIONS_LIST.DONORS',
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
      filterName: getTranslation('INTERVENTIONS_LIST.PARTNERS'),
      filterNameKey: 'INTERVENTIONS_LIST.PARTNERS',
      filterKey: GDDInterventionFilterKeys.partners,
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
      filterKey: GDDInterventionFilterKeys.end,
      type: EtoolsFilterTypes.Date, // datepicker-lite
      path: 'endDate',
      selectedValue: '',
      selected: false
    },
    {
      filterName: getTranslation('INTERVENTIONS_LIST.GRANTS'),
      filterNameKey: 'INTERVENTIONS_LIST.GRANTS',
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
      filterName: getTranslation('INTERVENTIONS_LIST.OFFICES'),
      filterNameKey: 'INTERVENTIONS_LIST.OFFICES',
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
      filterName: getTranslation('INTERVENTIONS_LIST.SECTIONS'),
      filterNameKey: 'INTERVENTIONS_LIST.SECTIONS',
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
      filterName: getTranslation('INTERVENTIONS_LIST.STARTS_AFTER'),
      filterNameKey: 'INTERVENTIONS_LIST.STARTS_AFTER',
      filterKey: GDDInterventionFilterKeys.start,
      type: EtoolsFilterTypes.Date, // datepicker-lite
      path: 'startDate',
      selectedValue: '',
      selected: false
    },
    {
      filterName: getTranslation('INTERVENTIONS_LIST.ENDS_AFTER'),
      filterNameKey: 'INTERVENTIONS_LIST.ENDS_AFTER',
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
      filterName: getTranslation('INTERVENTIONS_LIST.UNICEF_FOCAL_POINT'),
      filterNameKey: 'INTERVENTIONS_LIST.UNICEF_FOCAL_POINT',
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
      filterName: getTranslation('INTERVENTIONS_LIST.BUDGET_OWNER'),
      filterNameKey: 'INTERVENTIONS_LIST.BUDGET_OWNER',
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
      filterName: getTranslation('INTERVENTIONS_LIST.CONTINGENCY_PD'),
      filterNameKey: 'INTERVENTIONS_LIST.CONTINGENCY_PD',
      filterKey: GDDInterventionFilterKeys.contingency_pd,
      type: EtoolsFilterTypes.Toggle,
      selectedValue: false,
      selected: true
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
