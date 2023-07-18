import {LitElement, css, customElement, html, property, query} from 'lit-element';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import {ShoelaceCustomizations} from '../../styles/shoelace-customizations';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import SlTextarea from '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@unicef-polymer/etools-info-tooltip/info-icon-tooltip';
import {detailsTextareaRowsCount} from '../../pages/interventions/pages/intervention-tab-pages/utils/utils';

@customElement('etools-textarea')
export class EtoolsTextarea extends LitElement {
  @property({type: String})
  label!: string;

  @property({type: String, reflect: true})
  pattern!: string;

  @property({type: String, reflect: true})
  placeholder!: string;

  private _value!: string;
  @property({type: String})
  get value() {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
    this.charCount = this._value ? this._value.length : 0;
  }

  @property({type: Boolean})
  required!: boolean;

  @property({type: Boolean})
  readonly!: boolean;

  @property({type: String, attribute: 'error-message', reflect: true})
  errorMessage!: string;

  @property({type: String})
  infoIconMessage!: string;

  @property({type: Boolean, reflect: true})
  showCharCounter!: boolean;

  @property({type: Number})
  charCount = 0;

  @property({type: Number})
  maxlength!: number;

  @query('sl-textarea')
  slTextarea!: SlTextarea;

  static get styles() {
    return [
      ShoelaceCustomizations,
      css`
        .spacing {
          padding-top: 8px;
        }
        info-icon-tooltip {
          --iit-icon-size: 18px;
          --iit-margin: 0 0 4px 4px;
        }

        .paper-label {
          font-size: 12px;
          color: var(--secondary-text-color);
          padding-top: 8px;
        }

        .char-counter {
          color: var(--primary-text-color);
          font-size: 12px;
        }
      `
    ];
  }

  render() {
    return html`
      ${this.getInfoIconTemplate()}
      <sl-textarea
        id="sl-textarea"
        class="spacing"
        autocomplete="off"
        .label="${this.infoIconMessage ? '' : this.label}"
        .pattern="${this.pattern}"
        resize="auto"
        placeholder="${this.placeholder}"
        ?required="${this.required}"
        ?readonly="${this.readonly}"
        ?showCharCounter="${this.showCharCounter}"
        rows="${detailsTextareaRowsCount(!this.readonly)}"
        maxlength="${this.maxlength}"
        .value="${this.value ? this.value : ''}"
        @sl-invalid="${(e: any) => e.preventDefault()}"
        @sl-input="${(event: Event) => {
          fireEvent(this, 'value-changed', {value: event.target.value});
          this.charCount = event.target.value.length;
        }}"
      >
        <div slot="help-text" style="display: flex; justify-content: space-between;">
          <div class="err-msg">${this.errorMessage}</div>
          <div class="char-counter">${this.charCount}/${this.maxlength}</div>
        </div>
      </sl-textarea>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  getInfoIconTemplate() {
    if (!this.infoIconMessage) {
      return html``;
    }
    return html`
      <label class="paper-label" for="sl-textarea">${this.label}</label>
      <info-icon-tooltip
        id="iit-context"
        ?hidden="${this.readonly}"
        .tooltipText="${this.infoIconMessage}"
      ></info-icon-tooltip>
    `;
  }

  validate() {
    return this.slTextarea.reportValidity();
  }
}
