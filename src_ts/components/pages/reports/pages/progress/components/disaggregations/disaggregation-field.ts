import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {toNumericValues} from './mixins/disaggregation-field';
import {GenericObject} from '@unicef-polymer/etools-types';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';

/**
 * @LitElement
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

      <etools-input
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
      </etools-input>
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
    return (this.shadowRoot?.querySelector('#field') as EtoolsInput).validate();
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
