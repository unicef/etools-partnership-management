import { logWarn } from 'etools-behaviors/etools-logging';
import { Constructor } from '../../../../../../../../typings/globals.types';
import { PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 */
function IndicatorsCommonMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
 class indicatorsCommonClass extends baseClass {

    @property({type: String}) // allow only decimals separator `.` or `,`. ex: 1000,00 or 1000.00
    numberPattern: string = '(^\\d+(\\.?\\d+)?$)|(^\\d+(,?\\d+)?$)'

    @property({type: String}) // any number starting from 1
    digitsNotStartingWith0Pattern: string = '^[1-9]{1}(\\d+)?$';

    @property({type: String})
    digitsPattern: string = '^\\d+';

    _baselineChanged(baselineV: string) {
      // @ts-ignore
      if (!this.indicator || this._isEmptyExcept0(baselineV)) {
        return;
      }
      // @ts-ignore
      if (this._displayTypeIsPercentage(this.indicator)) {
        let val = this._getValidPercentageValue(baselineV);
        this.set('indicator.baseline.v', val);
      }
    }

    _targetChanged(targetV: string) {
      // @ts-ignore
      if (!this.indicator || this._isEmptyExcept0(targetV)) {
        return;
      }
      // @ts-ignore
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

    validateComponents(elemIds: string[]) {
      let valid = true;
      elemIds.forEach((elemId) => {
        let elem = this.shadowRoot!.querySelector('#' + elemId) as PolymerElement & {validate(): boolean};
        if (elem) {
          valid = elem.validate() && valid;
        } else {
          logWarn('Elem ' + elemId + ' not found');
        }
      });
      return valid;
    }

  };

  return indicatorsCommonClass;
}
 export default IndicatorsCommonMixin;
