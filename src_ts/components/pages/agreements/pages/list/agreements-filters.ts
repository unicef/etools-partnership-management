import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {get as getTranslation} from 'lit-translate';
import {FiltersHelper} from '@unicef-polymer/etools-filters/src/filters-helper.class';
import {EtoolsFilterTypes} from '@unicef-polymer/etools-filters/src/etools-filters';

export enum AgreementsFilterKeys {
  search = 'search',
  type = 'type',
  status = 'status',
  partners = 'partners',
  cpStructures = 'cpStructures',
  start = 'start',
  end = 'end',
  special_conditions_pca = 'special_conditions_pca'
}

export const selectedValueTypeByFilterKey: AnyObject = {
  [AgreementsFilterKeys.search]: 'string',
  [AgreementsFilterKeys.type]: 'Array',
  [AgreementsFilterKeys.status]: 'Array',
  [AgreementsFilterKeys.partners]: 'Array',
  [AgreementsFilterKeys.cpStructures]: 'Array',
  [AgreementsFilterKeys.start]: 'string',
  [AgreementsFilterKeys.end]: 'string',
  [AgreementsFilterKeys.special_conditions_pca]: 'boolean'
};

export const AgreementsFiltersHelper = new FiltersHelper(selectedValueTypeByFilterKey);

export function getAgreementFilters() {
  return [
    {
      filterName: getTranslation('GENERAL.SEARCH_RECORDS'),
      filterNameKey: 'GENERAL.SEARCH_RECORDS',
      filterKey: AgreementsFilterKeys.search,
      type: EtoolsFilterTypes.Search,
      selectedValue: '',
      selected: true
    },
    {
      filterName: getTranslation('TYPE'),
      filterNameKey: 'TYPE',
      filterKey: AgreementsFilterKeys.type,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      optionValue: 'value',
      optionLabel: 'label',
      selected: true,
      minWidth: '350px',
      hideSearch: true
    },
    {
      filterName: getTranslation('STATUS'),
      filterNameKey: 'STATUS',
      filterKey: AgreementsFilterKeys.status,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      optionValue: 'value',
      optionLabel: 'label',
      selected: true,
      minWidth: '160px',
      hideSearch: true
    },
    {
      filterName: getTranslation('CP_STRUCTURE'),
      filterNameKey: 'CP_STRUCTURE',
      filterKey: AgreementsFilterKeys.cpStructures,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      optionValue: 'id',
      optionLabel: 'name',
      selected: true,
      minWidth: '400px',
      hideSearch: true
    },
    {
      filterName: getTranslation('PARTNER'),
      filterNameKey: 'PARTNER',
      filterKey: AgreementsFilterKeys.partners,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      optionValue: 'value',
      optionLabel: 'label',
      path: 'selectedPartners',
      selected: true,
      minWidth: '400px',
      hideSearch: false
    },
    {
      filterName: getTranslation('ENDS_BEFORE'),
      filterNameKey: 'ENDS_BEFORE',
      filterKey: AgreementsFilterKeys.end,
      type: EtoolsFilterTypes.Date,
      selectedValue: '',
      selected: false
    },

    {
      filterName: getTranslation('STARTS_AFTER'),
      filterNameKey: 'STARTS_AFTER',
      filterKey: AgreementsFilterKeys.start,
      type: EtoolsFilterTypes.Date,
      selectedValue: '',
      selected: false
    },
    {
      filterName: getTranslation('SPECIAL_CONDITIONS_PCA'),
      filterNameKey: 'SPECIAL_CONDITIONS_PCA',
      filterKey: AgreementsFilterKeys.special_conditions_pca,
      type: EtoolsFilterTypes.Dropdown,
      singleSelection: true,
      selectionOptions: [
        {value: 'true', label: getTranslation('GENERAL.YES')},
        {value: 'false', label: getTranslation('GENERAL.NO')}
      ],
      optionValue: 'value',
      optionLabel: 'label',
      selectedValue: null,
      selected: true,
      minWidth: '350px',
      hideSearch: true,
      allowEmpty: true
    }
  ];
}
