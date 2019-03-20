import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';

/**
 * @polymer
 * @mixinFunction
 */
const IndicatorsCommonMixin = dedupingMixin((superClass: any) => class extends superClass {

  static get properties() {
    return {
      numberPattern: { // allow only decimals separator `.` or `,`. ex: 1000,00 or 1000.00
        type: String,
        value: '(^\\d+(\\.?\\d+)?$)|(^\\d+(,?\\d+)?$)'
      },
      digitsNotStartingWith0Pattern: { // any number starting from 1
        type: String,
        value: '^[1-9]{1}(\\d+)?$'
      },
      digitsPattern: {
        type: String,
        value: '^\\d+'
      }
    };
  }

  _baselineChanged(baselineV: string) {
    if (!this.indicator || this._isEmptyExcept0(baselineV)) {
      return;
    }

    if (this._displayTypeIsPercentage(this.indicator)) {
      let val = this._getValidPercentageValue(baselineV);
      this.set('indicator.baseline.v', val);
    }
  }

  _targetChanged(targetV: string) {
    if (!this.indicator || this._isEmptyExcept0(targetV)) {
      return;
    }

    if (this._displayTypeIsPercentage(this.indicator)) {
      let val = this._getValidPercentageValue(targetV);
      this.set('indicator.target.v', val);
    }
  }

  _isEmptyExcept0(value: string) {
    return value === null || value === undefined || value === '';
  }

  _displayTypeIsPercentage(indicator: any) {
    return (indicator.indicator && indicator.indicator.unit === 'percentage' &&
        indicator.indicator.display_type !== 'ratio');
  }

  _getValidPercentageValue(val: any) {
    val = parseInt(val, 10);
    if (isNaN(val) || val < 0) {
      val = 0;
    }
    if (val > 100) {
      val = 100;
    }
    return val;
  }

  validateComponents(elemIds: []) {
    let valid = true;
    elemIds.forEach((elemId) => {
      let elem = this.shadowRoot.querySelector('#' + elemId);
      if (elem) {
        valid = elem.validate() && valid;
      } else {
        this.logWarn('Elem ' + elemId + ' not found');
      }
    });
    return valid;
  }

});
 export default IndicatorsCommonMixin;
