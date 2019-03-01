import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import { GenericObject } from '../../typings/globals.types';

const UtilsMixin = (baseClass: any) => class extends EtoolsLogsMixin(baseClass) {

  _equals(a: any, b: any) {
    return a === b;
  }

  _toNumber(val: any) {
    return Number(val);
  }

  _formatNumber(val: any, placeholder: any , decimals: any, thousandsPoint: any, decimalsPoint?: any) {
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
      this.logWarn('thousandsPoint and decimalsPoint should be different', 'utils-mixin');
      return nr;
    }
    let nrParts = nr.split('.');
    if (thousandsPoint) {
      let thousandsRegex = new RegExp('(\\d)(?=(\\d{3})+(?!\\d))', 'g');
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
    let defer: any = {};

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
    let fields = [].slice.call(
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
        let val = percentize ? Math.floor(value * 100) : value;
        return this._formatNumber(val, '-', 2, '\,') + '%';
      }
      case 'ratio':
        return this._formatNumber(value, '-', 2, '\,') + ':1';
      case 'number':
        return this._formatNumber(value, '-', 0, '\,');
      default:
        return value;
    }
  }

  // For simple objects, no nesting
  objectsAreTheSame(obj1: any, obj2: any) {
    if (obj1 === obj2) {
      return true;
    }
    if (!obj1 && !obj2) {
      return true;
    }
    let props1: GenericObject = obj1 ? Object.keys(obj1) : {};
    let props2: GenericObject = obj2 ? Object.keys(obj2) : {};

    if (props1.length !== props2.length) {
      return false;
    }
    if (props1.length === 0) {
      return true;
    }

    let areDiff = false;
    props1.forEach((p: string) => {
      if( obj1[p] !== obj2[p]) {
        areDiff = true;
      }
    });
    return !areDiff;
  }

};

export default UtilsMixin;
