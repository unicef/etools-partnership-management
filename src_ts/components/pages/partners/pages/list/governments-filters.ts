import {PartnerFilterKeys, partnerFilters} from './partners-filters';

export function getGovernmentFilters() {
  const filters = JSON.parse(JSON.stringify(partnerFilters));
  const partnerTypesFilter = filters.find((f) => f.filterKey == PartnerFilterKeys.partner_types);
  partnerTypesFilter!.disabled = true;
  // @ts-ignore
  partnerTypesFilter!.selectedValue = ['Government'];

  filters.find((f) => f.filterKey == PartnerFilterKeys.cso_types)!.disabled = true;

  return filters;
}
