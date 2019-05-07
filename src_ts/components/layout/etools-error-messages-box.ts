import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from "@polymer/polymer/lib/mixins/gesture-event-listeners";
import "etools-content-panel/etools-content-panel.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/paper-button/paper-button.js";
import {buttonsStyles} from '../styles/buttons-styles.js';
import { property } from '@polymer/decorators';

/**
 * @polymer
 * @customElement
 * @appliesMixin GestureEventListeners
 */
class EtoolsErrorMessagesBox extends GestureEventListeners(PolymerElement) {
  public static get template() {
    // language=HTML
    return html`
      ${buttonsStyles}
      <style>
        [hidden] {
          display: none !important;
        }

        :host {
          @apply --layout-horizontal;
          @apply --layout-flex;
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
          --ecp-content: {
            color: var(--error-box-text-color);
            background-color: var(--error-box-bg-color);
            border-color: var(--error-box-border-color);
          };
        }

        ul {
          padding: 0 0 0 20px;
          margin: 0;
        }

        .errors-box-actions {
          margin-top: 20px;
          @apply --layout-horizontal;
          @apply --layout-end-justified;
        }

        paper-button {
          margin: 0;
        }

        .cancel-li-display {
          display: block;
        }
      </style>

      <etools-content-panel class="errors-box" panel-title="[[title]]">
        <ul>
          <template is="dom-repeat" items=[[errors]]>
            <li hidden$="[[_startsWithEmptySpace(item)]]">[[item]]</li>
            <li hidden$="[[!_startsWithEmptySpace(item)]]" class="cancel-li-display">[[item]]</li>
          </template>
        </ul>

        <div class="errors-box-actions">
          <paper-button class="primary-btn danger-btn"
                        on-tap="_resetErrors">
            Ok
          </paper-button>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: String})
  title!: string;

  @property({type: Array, notify: true})
  errors = [];

  @property({type: Boolean, computed: '_errorsLengthChanged(errors)',  reflectToAttribute: true})
  hidden!: boolean;

  _startsWithEmptySpace(val: string) {
    return val.startsWith(' ');
  }

  _errorsLengthChanged(errors: []) {
    return !errors || (errors && !errors.length);
  }

  _resetErrors() {
    this.set('errors', []);
  }

}

window.customElements.define('etools-error-messages-box', EtoolsErrorMessagesBox);
