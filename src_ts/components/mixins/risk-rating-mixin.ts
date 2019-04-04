//import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import { Constructor } from '../../typings/globals.types';
import { PolymerElement } from '@polymer/polymer';

/**
 * @polymer
 * @mixinFunction
 */
function RiskRatingMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class riskRatingClass extends baseClass {
    public getRiskRatingValue(riskRating: string) {
      if (typeof riskRating === 'string' && riskRating !== '') {
        return riskRating;
      } else {
        return 'Not Available';
      }
    }

    public getRiskRatingClass(riskRating: string) {
      let riskRatingClass = '';
      if (typeof riskRating === 'string' && riskRating !== '') {
        riskRatingClass = riskRating.toLowerCase().split(' ').join('-');
      } else {
        riskRatingClass = 'unavailable';
      }
      return riskRatingClass + ' risk-rating-field';
    }
  };
  return riskRatingClass;
}

export default RiskRatingMixin;
