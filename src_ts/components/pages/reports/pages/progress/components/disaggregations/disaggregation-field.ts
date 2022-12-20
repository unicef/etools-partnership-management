import {html, LitElement, property, customElement} from 'lit-element';
import '@polymer/paper-input/paper-input.js';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {toNumericValues} from './mixins/disaggregation-field';
import {PaperInputElement} from '@polymer/paper-input/paper-input.js';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 */
@customElement('disaggregation-field')
export class DisaggregationField extends LitElement {
  render() {
    return html`
      <style>
        :host {
          display: block;

          --paper-input-container: {
            padding: 0;
          }

          --paper-input-container-input: {
            font-size: 13px;
          }

          --paper-input-container-input-webkit-spinner: {
            display: none;
          }
        }
      </style>

      <paper-input
        id="field"
        .value="${this.value}"
        type="number"
        allowed-pattern="[+-d]"
        ?invalid="${this.invalid}"
        .validator="${this.validator}"
        .min="${this.min}"
        no-label-float
        required
        auto-validate
      >
      </paper-input>
    `;
  }

  @property({type: String})
  key!: string;

  @property({type: String})
  coords!: string;

  @property({type: Number})
  min!: number;

  @property({type: String})
  validator!: string;

  @property({type: Number})
  value!: number;

  @property({type: Boolean})
  invalid!: boolean;

  connectedCallback() {
    super.connectedCallback();

    this._handleInput = this._handleInput.bind(this);
    this.addEventListener('field.input', this._handleInput as any);
    fireEvent(this, 'register-field', this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('field.input', this._handleInput as any);
  }

  validate() {
    return (this.shadowRoot?.querySelector('#field') as PaperInputElement).validate();
  }

  getField() {
    return this.shadowRoot?.querySelector('#field');
  }

  _handleInput(e: CustomEvent) {
    const change: GenericObject = {};

    change[this.key] = (e.target as any).value;

    fireEvent(this, 'field-value-changed', {
      key: this.coords,
      value: toNumericValues(change)
    });
  }
}
