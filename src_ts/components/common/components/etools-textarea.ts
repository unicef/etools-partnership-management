import {LitElement, css, customElement, html, property, query} from 'lit-element';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import {ShoelaceCustomizations} from '../../styles/shoelace-customizations';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import SlTextarea from '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@unicef-polymer/etools-info-tooltip/info-icon-tooltip';

@customElement('etools-textarea')
export class EtoolsTextarea extends LitElement {
  @property({type: String})
  label!: string;

  @property({type: String, reflect: true})
  pattern!: string;

  @property({type: String, reflect: true})
  placeholder!: string;

  @property({type: String})
  value!: string;

  @property({type: Boolean})
  required!: boolean;

  @property({type: Boolean})
  readonly!: boolean;

  @property({type: String, attribute: 'error-message', reflect: true})
  errorMessage!: string;

  @property({type: String})
  infoIconMessage!: string;

  @property({type: Boolean})
  hiddenInfoIcon!: boolean;

  @query('sl-textarea')
  slTextarea!: SlTextarea;

  static get styles() {
    return [
      ShoelaceCustomizations,
      css`
        .spacing {
          padding-top: 8px;
        }
      `
    ];
  }

  render() {
    return html`
      <sl-textarea
        id="sl-textarea"
        class="spacing"
        autocomplete="off"
        .label="${this.label}"
        .pattern="${this.pattern}"
        placeholder="${this.placeholder}"
        ?required="${this.required}"
        ?readonly="${this.readonly}"
        .value="${this.value ? this.value : ''}"
        @sl-invalid="${(e: any) => e.preventDefault()}"
        @sl-input="${(event: Event) => fireEvent(this, 'value-changed', {detail: {value: event.target.value}})}"
      >
        ${this.getInfoIconTemplate()}
        <div slot="help-text" class="err-msg">
          <div>${this.errorMessage}</div>
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
    return html`<div slot="label">
      ${this.label}
      <info-icon-tooltip
        id="iit-context"
        ?hidden="${this.hiddenInfoIcon}"
        .tooltipText="${this.infoIconMessage}"
      ></info-icon-tooltip>
    </div> `;
  }

  validate() {
    return this.slTextarea.reportValidity();
  }
}
