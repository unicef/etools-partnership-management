import {logWarn} from 'etools-behaviors/etools-logging.js';
import {Constructor} from '../../typings/globals.types';
import {PolymerElement} from '@polymer/polymer';

function UtilsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class UtilsClass extends baseClass {

    _equals(a: any, b: any) {
      return a === b;
    }

    _toNumber(val: any) {
      return Number(val);
    }

    _formatNumber(val: any, placeholder: any, decimals: any, thousandsPoint: any, decimalsPoint?: any) {
      placeholder = placeholder ? placeholder : '-';

      let nr: any = Number(val);
      if (isNaN(nr)) {
        return placeholder;
      }

      decimals = !isNaN(decimals) ? Number(decimals) : 2;
      nr = nr.toFixed(decimals);

      decimalsPoint = decimalsPoint ? decimalsPoint : '.';
      thousandsPoint = thousandsPoint ? thousandsPoint : '';

      if (decimalsPoint && thousandsPoint && decimalsPoint === thousandsPoint) {
        logWarn('thousandsPoint and decimalsPoint should be different', 'utils-mixin');
        return nr;
      }
      const nrParts = nr.split('.');
      if (thousandsPoint) {
        const thousandsRegex = new RegExp('(\\d)(?=(\\d{3})+(?!\\d))', 'g');
        nrParts[0] = nrParts[0].replace(thousandsRegex, '$1' + thousandsPoint);
      }
      return nrParts.join(decimalsPoint);
    }

    _capitalizeFirstLetter(text: string) {
      if (text) {
        return text[0].toUpperCase() + text.substring(1);
      }
      return '';
    }

    _deferred() {
      const defer: any = {};

      defer.promise = new Promise(function(resolve, reject) {
        defer.resolve = resolve;
        defer.reject = reject;
      });

      return defer;
    }

    _toPercentage(value: any) {
      return value == null /* undefinded & null */ ? // jshint ignore:line
        value : Math.floor(value * 100) + '%';
    }

    _fieldsAreValid() {
      let valid = true;
      const fields = [].slice.call(
        // @ts-ignore
        this.shadowRoot.querySelectorAll('.validate')
      );
      // NOTE: NodeList.forEach is not supported by older browsers(min IE11),
      // using Array.prototype.forEach.call instead
      Array.prototype.forEach.call(fields, function(field: any) {
        if (!field.validate()) {
          valid = false;
        }
      });

      return valid;
    }

    _ternary(value: any, expected: any, value1: any, value2: any) {
      return (value === expected) ? value1 : value2;
    }

    _withDefault(value: any, defaultValue: any) {
      if (typeof defaultValue === 'undefined') {
        defaultValue = '-';
      }
      return value ? value : defaultValue;
    }

    _formatIndicatorValue(displayType: string, value: any, percentize: boolean) {
      if (value == null) {
        return value;
      }

      switch (displayType) {
        case 'percentage':
        {
          const val = percentize ? Math.floor(value * 100) : value;
          return this._formatNumber(val, '-', 2, ',') + '%';
        }
        case 'ratio':
          return this._formatNumber(value, '-', 2, ',') + ':1';
        case 'number':
          return this._formatNumber(value, '-', 0, ',');
        default:
          return value;
      }
    }
  }
  return UtilsClass;
}

export default UtilsMixin;
