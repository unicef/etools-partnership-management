// import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @mixinFunction
 */
function RiskRatingMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class RiskRatingClass extends baseClass {
    public getRiskRatingValue(riskRating: string, shortVersion?: 1 | 0) {
      if (typeof riskRating === 'string' && riskRating !== '') {
        return riskRating;
      } else {
        return shortVersion ? 'N/A' : 'Not Available';
      }
    }

    public getRiskRatingClass(riskRating: string) {
      let riskRatingClass = '';
      if (riskRating) {
        if (riskRating.includes('High')) {
          riskRating = 'high';
        } else if (riskRating.includes('Moderate')) {
          riskRating = 'moderate';
        } else if (riskRating.includes('Low')) {
          riskRating = 'low';
        } else if (riskRating.includes('Significant')) {
          riskRating = 'significant';
        } else if (riskRating.includes('Required')) {
          riskRating = 'not-required';
        } else if (riskRating.includes('Assessed')) {
          riskRating = 'not-assessed';
        }
        riskRatingClass = riskRating.toLowerCase().split(' ').join('-');
      } else {
        riskRatingClass = 'unavailable';
      }
      return riskRatingClass + ' risk-rating-field';
    }
  }
  return RiskRatingClass;
}

export default RiskRatingMixin;
