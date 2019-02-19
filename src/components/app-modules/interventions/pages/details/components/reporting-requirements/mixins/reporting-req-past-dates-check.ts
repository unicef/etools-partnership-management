declare const moment: any;
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';

/**
 * Common reporting requirements past dates check used for UI
 * @polymer
 * @mixinFunction
 */
const ReportingReqPastDatesCheckMixin = dedupingMixin((superClass: any) => class extends superClass {

  static get properties() {
    return {
      inAmendment: Boolean,
      editMode: {
        type: Boolean,
        value: false
      }
    };
  }

  _uneditableStyles(inAmendment: boolean, dueDate: any, id: number) {
    return this._noInAmendmentPastDatesEdit(inAmendment, dueDate, id)
        ? this._getUneditableStyles()
        : '';
  }

  _getUneditableStyles() {
    return 'color: var(--secondary-text-color)';
  }

  _pastDueDate(dueDate: string) {
    let now = moment().format('YYYY-MM-DD');
    let dueD = moment(new Date(dueDate)).format('YYYY-MM-DD');
    return moment(dueD).isBefore(now);
  }

  _canEdit(editMode: boolean, inAmendment: boolean, dueDate: string, id: number) {
    return editMode && !this._noInAmendmentPastDatesEdit(inAmendment, dueDate, id);
  }

  _noInAmendmentPastDatesEdit(inAmendment: boolean, dueDate: string, id: number) {
    return inAmendment && this._pastDueDate(dueDate) && id > 0;
  }

});

export default ReportingReqPastDatesCheckMixin;
