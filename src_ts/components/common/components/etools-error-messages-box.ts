import {html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @LitElement
 * @customElement
 * @appliesMixin GestureEventListeners
 */
/* eslint-disable new-cap */
class EtoolsErrorMessagesBox extends LitElement {
  render() {
    // language=HTML
    return html`
      <style>
        [hidden] {
          display: none !important;
        }

        :host {
          display: flex;
          flex-direction: row;
          flex: 1;
        }

        :host([hidden]) {
          display: none;
        }

        etools-content-panel {
          width: 100%;
        }

        .errors-box {
          margin-bottom: 25px;
        }

        .errors-box {
          --ecp-header-bg: var(--error-box-heading-color);
        }

        etools-content-panel::part(ecp-content) {
          color: var(--error-box-text-color);
          background-color: var(--error-box-bg-color);
          border-color: var(--error-box-border-color);
        }

        ul {
          padding: 0 0 0 20px;
          margin: 0;
        }

        .errors-box-actions {
          margin-top: 20px;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
        }

        .cancel-li-display {
          display: block;
        }
      </style>

      <etools-content-panel ?hidden="${this.hidden}" class="errors-box" .panelTitle="${this.title}">
        <ul>
          ${this.errors.map((item) => {
            return html`
              <li ?hidden="${this._startsWithEmptySpace(item)}">${item}</li>
              <li ?hidden="${!this._startsWithEmptySpace(item)}" class="cancel-li-display">${item}</li>
            `;
          })}
        </ul>

        <div class="errors-box-actions">
          <etools-button variant="danger" @click="${this._resetErrors}"> Ok </etools-button>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: String})
  title!: string;

  private _errors: any[] = [];
  @property({type: Array})
  get errors() {
    return this._errors;
  }

  set errors(val) {
    this._errors = val;
    this.hidden = this._errorsLengthChanged(this._errors);
    fireEvent(this, 'errors-changed', {value: this._errors});
  }

  @property({
    type: Boolean
  })
  hidden!: boolean;

  _startsWithEmptySpace(val: string) {
    return val.startsWith(' ');
  }

  _errorsLengthChanged(errors: any[]) {
    return !errors || (errors && !errors.length);
  }

  _resetErrors() {
    this.errors = [];
  }
}

window.customElements.define('etools-error-messages-box', EtoolsErrorMessagesBox);
