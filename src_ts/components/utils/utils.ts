import {ListItemIntervention} from '@unicef-polymer/etools-types';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

export function mapStatus(intervention: ListItemIntervention) {
  // to refactor this after draft status is revised
  return getTranslatedValue(
    intervention.status === 'draft' ? 'development' : intervention.status,
    'COMMON_DATA.INTERVENTIONSTATUSES'
  );
}

export function getDevelopementStatusDetails(data: ListItemIntervention) {
  if (!['development', 'draft'].includes(data.status)) {
    return '';
  }
  if (data.partner_accepted && data.unicef_accepted) {
    return getTranslation('PARTNER_AND_UNICEF_ACCEPTED');
  }
  if (!data.partner_accepted && data.unicef_accepted) {
    return getTranslation('UNICEF_ACCEPTED');
  }
  if (data.partner_accepted && !data.unicef_accepted) {
    return getTranslation('PARTNER_ACCEPTED');
  }
  if (!data.unicef_court && !!data.date_sent_to_partner) {
    return getTranslation('SENT_TO_PARTNER');
  }

  if (data.unicef_court && !!data.submission_date && !!data.date_sent_to_partner) {
    return getTranslation('SENT_TO_UNICEF');
  }
  return '';
}
