declare const moment: any;
import {convertDate} from '../../../../../../../utils/date-utils';

/**
 * @polymer
 * @mixinFunction
 */
const GenerateQuarterlyReportingRequirementsMixin =
    (baseClass: any) => class extends baseClass {

    static get properties() {
      return {
        DUE_DATE_DAYS_TO_ADD: {
          type: Number,
          value: 30
        },
        datesFormat: {
          type: String,
          value: 'YYYY-MM-DD'
        }
      };
    }

    /**
     * Used to generate (one time) QPR first dates set.
     * Generation method:
     *    - get pd start date and calculate end date
     *    - end date = last day of the month where month =
     *                    (start date day <= 15 ? (start date month + 2) : (start date month + 3))
     *    - calculate due date = end date + 30 days
     *    - move to next start date = end date + 1 day
     *    - repeat until entire PD timeline is covered
     *    - last QPR end date === intervention end date
     * @param pdStartDateStr
     * @param pdEndDateStr
     * @returns {Array}
     */
    generateQPRData(pdStartDateStr: any, pdEndDateStr: any) {
      let qprData = [];
      let start = String(pdStartDateStr);
      let end = this._generateEndDate(start, pdEndDateStr);
      while (this._generatedEndIsBeforePdEnd(end.format(this.datesFormat), pdEndDateStr)) {
        // add dates to qpr data list
        qprData.push(this._getQPRDatesSet(start, end));
        // recalculate next dates set
        start = this._getNextStartDateStr(end);
        end = this._generateEndDate(start, pdEndDateStr);
      }
      // add one more to cover entire PD timeline
      qprData.push(this._getQPRDatesSet(start, end));
      return qprData;
    }

    _getQPRDatesSet(start: any, end: any) {
      return {
        start_date: start,
        end_date: end.format(this.datesFormat),
        due_date: this._generateDueDate(end).format(this.datesFormat)
      };
    }

    _generatedEndIsBeforePdEnd(endDateStr: string, pdEndStr: string) {
      return moment(endDateStr).isBefore(pdEndStr);
    }

    _generateEndDate(startStr: string, pdEndStr: string) {
      let d = moment.utc(convertDate(startStr));
      let month = d.get('M');
      if (d.get('D') <= 15) {
        month += 2;
      } else {
        month += 3;
      }
      d.set('M', month);
      d.endOf('month');

      if (d.isAfter(pdEndStr)) {
        return moment.utc(convertDate(pdEndStr));
      }
      return d;
    }

    _generateDueDate(momentEndDate: any) {
      return moment(momentEndDate).add(this.DUE_DATE_DAYS_TO_ADD, 'd');
    }

    _getNextStartDateStr(momentEndDate: any) {
      return moment(momentEndDate).add(1, 'd').format(this.datesFormat);
    }

  };

  export default GenerateQuarterlyReportingRequirementsMixin;

