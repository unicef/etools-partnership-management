import {LabelAndValue} from '@unicef-polymer/etools-types';
import {appLanguages} from '../../config/app-constants';
import {getTranslatedValue} from '@unicef-polymer/etools-utils/dist/language.util';

export const languageIsAvailableInApp = (lngCode: string) => {
  return appLanguages.some((lng) => lng.value === lngCode);
};

export function translateLabelAndValueArray(arrData: LabelAndValue[], keyPrefix: string): LabelAndValue[] {
  const arrTranslated: LabelAndValue[] = [];
  arrData.forEach((x) => arrTranslated.push({value: x.value, label: getTranslatedValue(x.label, keyPrefix)}));
  return arrTranslated;
}
