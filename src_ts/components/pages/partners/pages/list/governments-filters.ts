import {PartnerFilterKeys, getPartnerFilters, selectedValueTypeByFilterKey} from './partners-filters';
import {FiltersHelper} from '@unicef-polymer/etools-filters/src/filters-helper.class';

export const GovernmentFiltersHelper = new FiltersHelper(selectedValueTypeByFilterKey);

export function getGovernmentFilters() {
  const filters = getPartnerFilters();
  const partnerTypesFilter = filters.find(
    (f: {filterKey: PartnerFilterKeys}) => f.filterKey == PartnerFilterKeys.partner_types
  );
  partnerTypesFilter!.disabled = true;
  // @ts-ignore
  partnerTypesFilter!.selectedValue = ['Government'];

  filters.find((f: {filterKey: PartnerFilterKeys}) => f.filterKey == PartnerFilterKeys.cso_types)!.disabled = true;

  return filters;
}
