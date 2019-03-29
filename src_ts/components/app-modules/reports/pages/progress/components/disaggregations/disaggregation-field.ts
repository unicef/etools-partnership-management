import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';
import 'etools-behaviors/etools-mixin-factory.js';

import {GenericObject, PolymerElEvent} from '../../../../../../../typings/globals.types';
import { fireEvent } from '../../../../../../utils/fire-custom-event';
import DisaggregationFieldMixin from './mixins/disaggregation-field-mixin';


/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationFieldMixin
 */
class DisaggregationField extends DisaggregationFieldMixin(PolymerElement) {

  static get is() {
    return 'disaggregation-field';
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;

          --paper-input-container: {
            padding: 0;
          };

          --paper-input-container-input: {
            font-size: 13px;
          };

          --paper-input-container-input-webkit-spinner: {
            display: none;
          };
        }
      </style>

      <paper-input
          id="field"
          value="[[value]]"
          type="number"
          allowed-pattern="[+\-\d]"
          invalid="{{invalid}}"
          validator="[[validator]]"
          min="[[min]]"
          no-label-float
          required
          auto-validate>
      </paper-input>
    `;
  }

  static get properties() {
    return {
      key: String,

      coords: String,

      min: Number,

      validator: String,

      value: {
        type: Number,
        notify: true
      },

      invalid: {
        type: Boolean,
        notify: true
      }
    };
  }

  ready() {
    super.ready();
    this._handleInput = this._handleInput.bind(this);
    this.addEventListener('field.input', this._handleInput);
  }

  connectedCallback() {
    super.connectedCallback();
    fireEvent(this, 'register-field', this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('field.input', this._handleInput);
  }

  validate() {
    return this.$.field.validate();
  }

  getField() {
    return this.$.field;
  }

  _handleInput(e: PolymerElEvent) {
    let change: GenericObject = {};

    change[this.key] = e.target.value;

    fireEvent(this, 'field-value-changed', {
      key: this.coords,
      value: this._toNumericValues(change)
    });
  }

}

window.customElements.define(DisaggregationField.is, DisaggregationField);
