import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {translate} from 'lit-translate';
import {setselectedValueTypeByFilterKey} from '@unicef-polymer/etools-modules-common/dist/list/filters';
import {EtoolsFilterTypes} from '@unicef-polymer/etools-modules-common/dist/layout/filters/etools-filters';

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

setselectedValueTypeByFilterKey(selectedValueTypeByFilterKey);

let showOnlyGovernmentType = false;
export function setShowOnlyGovernmentType(val: boolean) {
  showOnlyGovernmentType = val;
}

export function getPartnerFilters() {
  return [
    {
      filterName: translate('GENERAL.SEARCH_RECORDS'),
      filterKey: PartnerFilterKeys.search,
      type: EtoolsFilterTypes.Search,
      selectedValue: '',
      selected: true
    },
    {
      filterName: translate('PARTNER_TYPE'),
      filterKey: PartnerFilterKeys.partner_types,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '350px',
      hideSearch: true,
      disabled: showOnlyGovernmentType
    },
    {
      filterName: translate('CSO_TYPE'),
      filterKey: PartnerFilterKeys.cso_types,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '350px',
      hideSearch: false,
      disabled: showOnlyGovernmentType
    },
    {
      filterName: translate('HACT_RISK_RATING'),
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
      filterName: translate('SEA_RISK_RATING'),
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
      filterName: translate('PSEA_ASSESSMENT_DATE_BEFORE'),
      filterKey: PartnerFilterKeys.psea_assessment_date_before,
      type: EtoolsFilterTypes.Date,
      selectedValue: '',
      path: 'selectedPseaDateBefore',
      selected: false,
      disabled: false
    },
    {
      filterName: translate('PSEA_ASSESSMENT_DATE_AFTER'),
      filterKey: PartnerFilterKeys.psea_assessment_date_after,
      type: EtoolsFilterTypes.Date,
      selectedValue: '',
      selected: false,
      disabled: false
    },
    {
      filterName: translate('SHOW_HIDDEN'),
      filterKey: PartnerFilterKeys.hidden,
      type: EtoolsFilterTypes.Toggle,
      selectedValue: false,
      selected: true
    }
  ];
}
