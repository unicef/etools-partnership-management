import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';

import {GenericObject} from '../../../../../../../typings/globals.types';
import { fireEvent } from '../../../../../../utils/fire-custom-event';
import {toNumericValues} from './mixins/disaggregation-field';
import { property } from '@polymer/decorators';

/**
 * @polymer
 * @customElement
 */
class DisaggregationField extends PolymerElement {

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

  @property({type: String})
  key!: string;

  @property({type: String})
  coords!: string;

  @property({type: Number})
  min: number | null = null;

  @property({type: String})
  validator: string | null = null;

  @property({type: Number, notify: true})
  value: number | null = null;

  @property({type: Boolean, notify: true})
  invalid: boolean | null = null;

  ready() {
    super.ready();
    this._handleInput = this._handleInput.bind(this);
    this.addEventListener('field.input', this._handleInput as EventListenerOrEventListenerObject);
  }

  connectedCallback() {
    super.connectedCallback();
    fireEvent(this, 'register-field', this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('field.input', this._handleInput as EventListenerOrEventListenerObject);
  }

  validate() {
    // @ts-ignore
    return this.$.field.validate();
  }

  getField() {
    return this.$.field;
  }

  _handleInput(e: CustomEvent) {
    let change: GenericObject = {};

    change[this.key] = (e.target as any).value;

    fireEvent(this, 'field-value-changed', {
      key: this.coords,
      value: toNumericValues(change)
    });
  }

}

window.customElements.define(DisaggregationField.is, DisaggregationField);
