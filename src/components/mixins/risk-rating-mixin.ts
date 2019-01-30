import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';

/**
 * @polymer
 * @mixinFunction
 */
const RiskRatingMixin = dedupingMixin((baseClass: any) =>
  class extends baseClass {
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
  });

export default RiskRatingMixin;
