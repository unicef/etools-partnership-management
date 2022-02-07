import {PartnerFilterKeys, getPartnerFilters} from './partners-filters';

export function getGovernmentFilters() {
  const filters = JSON.parse(JSON.stringify(getPartnerFilters()));
  const partnerTypesFilter = filters.find(
    (f: {filterKey: PartnerFilterKeys}) => f.filterKey == PartnerFilterKeys.partner_types
  );
  partnerTypesFilter!.disabled = true;
  // @ts-ignore
  partnerTypesFilter!.selectedValue = ['Government'];

  filters.find((f: {filterKey: PartnerFilterKeys}) => f.filterKey == PartnerFilterKeys.cso_types)!.disabled = true;

  return filters;
}
