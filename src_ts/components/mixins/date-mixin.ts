// Deprecated - use date-utils instead

import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
declare const moment: any;

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 */
const DateMixin = dedupingMixin((baseClass: any) =>
  // @ts-ignore
  class extends (EtoolsLogsMixin(baseClass) as any) {

    public prettyDate(dateString: string, format: string, placeholder: string) {
      let date = this._convertDate(dateString);
      return (!date) ? (placeholder ? placeholder : ''): this._utcDate(date, format);
    }

    public _utcDate(date: any, format: string) {
      return (!date) ? '' : moment.utc(date).format(format ? format : 'D MMM YYYY');
    }

    public _convertDate(dateString: string, noZTimezoneOffset?: boolean) {
      if (typeof dateString === 'string' && dateString !== '') {
        dateString = (dateString.indexOf('T') === -1) ? (dateString + 'T00:00:00') : dateString;
        /**
         * `Z` (zero time offset) will ensure `new Date` will create the date in UTC and then it will apply local timezone
         * and will have the same result in all timezones (for the UTC date).
         * Example:
         *  d = new Date('2018-04-25T00:00:00Z');
         *  d.toString() == "Wed Apr 25 2018 03:00:00 GMT+0300 (EEST)"
         *  d.toGMTString() == "Wed, 25 Apr 2018 00:00:00 GMT"
         * @type {string}
         */
        dateString += (noZTimezoneOffset || dateString.indexOf('Z') >= 0) ? '' : 'Z';
        let date = new Date(dateString);
        let isValid = this.isValidDate(date);
        if (!isValid) {
          this.logWarn('Date conversion unsuccessful: ' + dateString);
        }
        return isValid ? date : null;
      }
      return null;
    }

    public _getDateWithoutTimezoneOffset(date: any) {
      let userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() + userTimezoneOffset);
    }

    /**
     * Prepare date from string, adding back the timezone offset.
     * This will make sure datepicker displayed date will be the same with the selected date
     * (eliminates the issue when the selected date was displayed +-1 day)
     */
    public prepareDatepickerDate(dateString: string) {
      let date = this._convertDate(dateString);
      if (!date) {
        return new Date();
      }
      return this._getDateWithoutTimezoneOffset(date);
    }

    /*
     * Open input field assigned(as prefix or suffix) etools-datepicker on tap.
     * Make sure you also have the data-selector attribute set on the input field.
     */
    public openDatePicker(event: any) {
      let id = event.target.getAttribute('data-selector');
      if (id) {
        let datePicker = this.shadowRoot.querySelector('#' + id);
        if (datePicker) {
          datePicker.open = true;
        }
      }
    }

    /*
     * Diff between 2 dates
     */
    public dateDiff(firstDate: any, secondDate: any, unit: any) {
      if (!unit) {
        unit = 'days';
      }
      if (typeof firstDate === 'string' && firstDate !== '' &&
          typeof secondDate === 'string' && secondDate !== '') {
        firstDate = new Date(firstDate);
        secondDate = new Date(secondDate);
      }

      if (this.isValidDate(firstDate) && this.isValidDate(secondDate)) {
        let mFirstDate = moment.utc(firstDate);
        let mSecondDate = moment.utc(secondDate);
        return mSecondDate.diff(mFirstDate, unit);
      }

      return null;
    }

    public getMaxDateStr(d1Str: string, d2Str: string) {
      // TODO: optimize this
      let d1 = new Date(d1Str);
      let d2 = new Date(d2Str);
      if (!this.isValidDate(d1) && this.isValidDate(d2)) {
        return d2Str;
      } else if (this.isValidDate(d1) && !this.isValidDate(d2)) {
        return d1Str;
      } else if (!this.isValidDate(d1) && !this.isValidDate(d2)) {
        return null;
      } else {
        if (moment.utc(d1).isSameOrBefore(d2)) {
          return d2Str;
        } else {
          return d1Str;
        }
      }
    }

    public isFutureDate(dateStr: string) {
      return moment.utc().isBefore(moment.utc(new Date(dateStr)));
    }

    public dateIsBetween(start: any, end: any, current: any) {
      let startDate = (start instanceof Date) ? start : new Date(start);
      let endDate = (end instanceof Date) ? end : new Date(end);

      if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
        throw new Error('Both start and end dates must valid.');
      }
      let date = (current instanceof Date) ? current : new Date(current);

      let currentDate = this.isValidDate(date) ? moment() : moment(date);
      return currentDate.isBetween(moment(startDate), moment(endDate), 'day', '[]');
    }

    public isValidDate(date: any) {
      return (date instanceof Date === false) ? false : (date.toString() !== 'Invalid Date');
    }

    public getTodayDateStr() {
      return moment().format('YYYY-MM-DD');
    }

    public dateIsBefore(dateToCheckStr: string, dateStr: string) {
      return moment(dateToCheckStr).isBefore(dateStr);
    }

    public dateIsAfter(dateToCheckStr: string, dateStr: string) {
      return moment(dateToCheckStr).isAfter(dateStr);
    }

    public getShortStrMonths() {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }

    public EdgeAcceptableDateParse(strDt: any) {
      // expected dt fromat : 01-Sep-2018

      let date = new Date(strDt + 'Z');
      if (this.isValidDate(date)) {
        return date;
      }

      let dtArr = strDt.split('-');
      if (dtArr && dtArr.length) {
        let numericMonth = dtArr[1];

        if (isNaN(numericMonth)) {
          numericMonth = this.getShortStrMonths().indexOf(numericMonth);
        }

        date = new Date(dtArr[2], numericMonth, dtArr[0]);
      }

      return date;
    }

    public datesAreEqual(date1: any, date2: any) {
      if (!this.isValidDate(date1) || !this.isValidDate(date2)) {
        return false;
      }

      return (date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear());
    }

  });

export default DateMixin;
