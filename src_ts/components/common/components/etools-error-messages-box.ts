import {html, LitElement, property} from 'lit-element';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-button/paper-button.js';
import {buttonsStyles} from '../../styles/buttons-styles';

/**
 * @polymer
 * @customElement
 * @appliesMixin GestureEventListeners
 */
/* eslint-disable new-cap */
class EtoolsErrorMessagesBox extends GestureEventListeners(LitElement) {
  render() {
    // language=HTML
    return html`
      ${buttonsStyles}
      <style>
        [hidden] {
          display: none !important;
        }

        :host {
          display: flex;
          flex-direction: row;
          flex: 1;
          @apply --etools-error-messages-box;
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

        paper-button {
          margin: 0;
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
          <paper-button class="primary-btn danger-btn" @tap="${this._resetErrors}"> Ok </paper-button>
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
