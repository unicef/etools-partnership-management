import {PolymerElement} from '@polymer/polymer';
import EtoolsIronValidatorMixin from './etools-iron-validator-mixin';

 /**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsIronValidatorMixin
 */
class RequiredAndNotFutureDateValidator extends EtoolsIronValidatorMixin(PolymerElement) {

  static get properties() {
    return {
      errorMessage: {
        type: String,
        notify: true,
        observer: '_updateFieldErrorMessage'
      },
      required: {
        type: Boolean,
        value: true
      },
      requiredErrorMessage: {
        type: String,
        value: 'This field is required!'
      },
      noFutureDateErrorMessage: {
        type: String,
        value: 'Date cannot be in the future!'
      },
      /**
       * Used to set the error message directly to the field.
       * Date field element need to be on the same level with the validator element
       */
      fieldSelector: String
    };
  }

  connectedCallback() {
    super.connectedCallback();
    // set default message
    this._setRequiredErrorMessage();
  }

  validate(dateValueStr: string) {
    if (!dateValueStr && this.required) {
      this._setRequiredErrorMessage();
      return false;
    }

    let d = Date.parse(dateValueStr);
    if (isNaN(d) && this.required) {
      // invalid date string
      this._setRequiredErrorMessage();
      return false;
    }
    // date ca not be in the future
    this._setNoFutureDateErrorMessage();
    return (!this.required && !dateValueStr) || d <= Date.now();
  }

  _setRequiredErrorMessage() {
    this.set('errorMessage', this.requiredErrorMessage);
  }

  _setNoFutureDateErrorMessage() {
    this.set('errorMessage', this.noFutureDateErrorMessage);
  }

  _updateFieldErrorMessage(msg: string) {
    if (!msg || !this.fieldSelector) {
      return;
    }
    /**
     * Make sure required-and-not-future-date-validator is on the same level with date input
     * @type {*|parentElement|{get, configurable}|HTMLElement}
     */
    let parentEl = this.parentElement;
    if (parentEl) {
      let dateInput = parentEl.querySelector(this.fieldSelector);
      if (dateInput instanceof PolymerElement) {
        dateInput.set('errorMessage', msg);
      }
    }
  }

}

window.customElements.define('required-and-not-future-date-validator', RequiredAndNotFutureDateValidator);
