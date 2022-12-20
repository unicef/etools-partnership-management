import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {get as getTranslation} from 'lit-translate';
import {FiltersHelper} from '@unicef-polymer/etools-filters/src/filters-helper.class';
import {EtoolsFilterTypes} from '@unicef-polymer/etools-filters/src/etools-filters';

export enum PartnerFilterKeys {
  search = 'search',
  partner_types = 'partner_types',
  cso_types = 'cso_types',
  risk_ratings = 'risk_ratings',
  sea_risk_ratings = 'sea_risk_ratings',
  psea_assessment_date_before = 'psea_assessment_date_before',
  psea_assessment_date_after = 'psea_assessment_date_after',
  hidden = 'hidden'
}

export const selectedValueTypeByFilterKey: AnyObject = {
  [PartnerFilterKeys.search]: 'string',
  [PartnerFilterKeys.partner_types]: 'Array',
  [PartnerFilterKeys.cso_types]: 'Array',
  [PartnerFilterKeys.risk_ratings]: 'Array',
  [PartnerFilterKeys.sea_risk_ratings]: 'Array',
  [PartnerFilterKeys.psea_assessment_date_before]: 'string',
  [PartnerFilterKeys.psea_assessment_date_after]: 'string',
  [PartnerFilterKeys.hidden]: 'boolean'
};

export const PartnersFiltersHelper = new FiltersHelper(selectedValueTypeByFilterKey);

export function getPartnerFilters() {
  return [
    {
      filterName: getTranslation('GENERAL.SEARCH_RECORDS'),
      filterNameKey: 'GENERAL.SEARCH_RECORDS',
      filterKey: PartnerFilterKeys.search,
      type: EtoolsFilterTypes.Search,
      selectedValue: '',
      selected: true
    },
    {
      filterName: getTranslation('PARTNER_TYPE'),
      filterNameKey: 'PARTNER_TYPE',
      filterKey: PartnerFilterKeys.partner_types,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '350px',
      hideSearch: true,
      disabled: false
    },
    {
      filterName: getTranslation('CSO_TYPE'),
      filterNameKey: 'CSO_TYPE',
      filterKey: PartnerFilterKeys.cso_types,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '350px',
      hideSearch: false,
      disabled: false
    },
    {
      filterName: getTranslation('HACT_RISK_RATING'),
      filterNameKey: 'HACT_RISK_RATING',
      filterKey: PartnerFilterKeys.risk_ratings,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '160px',
      hideSearch: false,
      disabled: false
    },
    {
      filterName: getTranslation('SEA_RISK_RATING'),
      filterNameKey: 'SEA_RISK_RATING',
      filterKey: PartnerFilterKeys.sea_risk_ratings,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      selected: false,
      minWidth: '160px',
      hideSearch: true,
      disabled: false
    },
    {
      filterName: getTranslation('PSEA_ASSESSMENT_DATE_BEFORE'),
      filterNameKey: 'PSEA_ASSESSMENT_DATE_BEFORE',
      filterKey: PartnerFilterKeys.psea_assessment_date_before,
      type: EtoolsFilterTypes.Date,
      selectedValue: '',
      path: 'selectedPseaDateBefore',
      selected: false,
      disabled: false
    },
    {
      filterName: getTranslation('PSEA_ASSESSMENT_DATE_AFTER'),
      filterNameKey: 'PSEA_ASSESSMENT_DATE_AFTER',
      filterKey: PartnerFilterKeys.psea_assessment_date_after,
      type: EtoolsFilterTypes.Date,
      selectedValue: '',
      selected: false,
      disabled: false
    },
    {
      filterName: getTranslation('SHOW_HIDDEN'),
      filterNameKey: 'SHOW_HIDDEN',
      filterKey: PartnerFilterKeys.hidden,
      type: EtoolsFilterTypes.Toggle,
      selectedValue: false,
      selected: true
    }
  ];
}
