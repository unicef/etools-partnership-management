import DateMixin from '../mixins/date-mixin';
import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js'
import '@polymer/paper-input/paper-input.js'
import {IronValidatableBehavior} from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js'
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js'
import 'etools-datepicker/etools-datepicker-button.js';
import '../../mixins/date-mixin.js';
import {SharedStyles} from '../styles/shared-styles.js';



/**
 * @polymer
 * @customElement
 * @appliesMixin DateMixin
 */
class EtoolsDateInput extends
    mixinBehaviors([IronValidatableBehavior], DateMixin(PolymerElement)) {

  static get template() {
    return html`
    ${SharedStyles}
    <style>
        :host {
          @apply --etools-date-input;
        }

        /* TODO: Find a way to separate readonly CSS from shared-styles, and use it here,
        then include it in shared-styles(do not use shared-styles here) */
      </style>

      <paper-input id="dateInput"
                  label="[[label]]"
                  value="[[prettyDate(value)]]"
                  placeholder="[[placeholder]]"
                  on-down="openDatePicker"
                  on-keypress="openDatePicker"
                  data-selector="datePickerButton"
                  disabled$="[[disabled]]"
                  required$="[[required]]"
                  invalid$="[[invalid]]"
                  error-message="[[_getErrorMessage(errorMessage, invalid)]]">
        <span slot="prefix">
          <iron-icon icon="date-range" hidden$="[[!readonly]]"></iron-icon>
          <etools-datepicker-button id="datePickerButton"
                                    format="YYYY-MM-DD"
                                    pretty-date="{{value}}"
                                    json-date="{{jsonValue}}"
                                    date="[[prepareDatepickerDate(value)]]"
                                    min-date="[[minDate]]"
                                    max-date="[[maxDate]]"
                                    is-disabled$="[[_disabledDatepicker(readonly, disabled)]]"
                                    hidden$="[[readonly]]"
                                    no-init="[[noInit]]"
                                    open="{{open}}"
                                    show-clear-btn="[[showClearBtn]]"
                                    fire-date-has-changed="[[fireDateHasChanged]]">
          </etools-datepicker-button>
        </span>
      </paper-input>
    `;
  }

  static get properties() {
    return {
      label: String,
      value: {
        value: null,
        notify: true
      },
      jsonValue: {
        value: null,
        notify: true
      },
      placeholder: {
        type: String,
        value: '—'
      },
      noInit: Boolean,
      showClearBtn: Boolean,
      readonly: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        observer: '_readonlyStateChange'
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      fireDateHasChanged: {
        type: Boolean,
        value: false
      },
      required: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        observer: '_requiredChange'
      },
      autoValidate: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      invalid: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      open: {
        type: Boolean,
        value: false,
        notify: true,
        observer: '_openChanged'
      },
      errorMessage: {
        type: String,
        value: 'Please select a date'
      },
      elemAttached: {
        type: Boolean,
        value: false
      },
      validator: String,
      minDate: Date,
      maxDate: Date,
      disableFutureDates: {
        type: Boolean,
        observer: '_disableFutureDatesChanged'
      },
      requiredAndNotFutureDate: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  ready() {
    super.ready();
    this._initDefaultValidator();
  }

  _initDefaultValidator() {
    // TODO: integrate required and not future date here based on some flag property
    // new way to implement custom validators :)
    if (typeof this.validator !== 'string' || this.validator === '') {
      const defaultValidator = {
        name: 'etools-date-default-validator',
        type: 'validator',
        validate: (value) => {
          return typeof value === 'string' && value !== '';
        }
      };
      // TODO - validator should be defined globally(IronMeta) only once
      // -> extract validator in separate file
      new Polymer.IronMeta({
        type: defaultValidator.type,
        key: defaultValidator.name,
        value: defaultValidator
      });

      this.set('validator', defaultValidator.name);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.elemAttached = true;
    // makes the input not be editable while keeping the way it looks
    this.$.dateInput.set('readonly', true);
  }

  _readonlyStateChange(newValue: boolean, oldValue: boolean) {
    this._refreshStyles(newValue, oldValue);
  }

  _requiredChange(newValue: boolean, oldValue: boolean) {
    this._refreshStyles(newValue, oldValue);
  }

  _refreshStyles(newVal: any, oldVal: any) {
    if (newVal !== oldVal) {
      this.updateStyles();
    }
  }

  _disabledDatepicker(readonly: boolean, disabled: boolean) {
    return readonly || disabled;
  }

  _openChanged(datepickerOpen: boolean) {
    // elemAttached condition is to prevent eager validation
    if (this.autoValidate && !datepickerOpen && this.elemAttached) {
      this.validate();
    }
  }

  /**
   * overwrites default functionality from iron-input
   * @return {boolean}
   */
  validate() {
    if (!this.required && !this.requiredAndNotFutureDate) {
      return true;
    }

    // hasValidator check (let hasValidator = this.hasValidator();) not required anymore,
    // the input has a default validator
    let valid = Polymer.IronValidatableBehavior.validate.call(this, this.value);
    this.set('invalid', !valid);
    return valid;
  }

  resetInvalidState() {
    this.set('invalid', false);
    // because `invalid` has one-way binding, the paper-input doesn't always follow the invalid flag
    // so to make sure, we have to set it manually
    this.$.dateInput.set('invalid', false);
  }

  // prevents the element from rendering an error message container when valid
  _getErrorMessage(message: string, invalid: boolean) {
    return invalid ? message: '';
  }

  _disableFutureDatesChanged(disableFutureDates: boolean) {
    if (disableFutureDates) {
      this.set('maxDate', new Date());
    }
  }
}

window.customElements.define('etools-date-input', EtoolsDateInput);
