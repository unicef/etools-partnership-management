import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-input/paper-input-container.js';

import {SharedStyles} from '../styles/shared-styles';
import {requiredFieldStarredStyles} from '../styles/required-field-styles';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @customElement
 */
class EtoolsFormElementWrapper extends PolymerElement {
  static get template() {
    return html`
      ${SharedStyles} ${requiredFieldStarredStyles}
      <style>
        :host {
          width: 100%;

          max-width: var(--etools-form-element-wrapper-max-width, none);
          --paper-input-container-underline: {
            display: none;
          }
          --paper-input-container-underline-focus: {
            display: none;
          }
          --paper-input-container-underline-disabled: {
            display: none;
          }
          --paper-input-prefix: {
            margin-right: 5px;
            margin-top: -2px;
            color: var(--dark-secondary-text-color);
          }
        }

        :host(.right-align) paper-input-container {
          text-align: right;
        }

        .paper-input-input {
          @apply --layout-horizontal;
          display: inline-block;
          word-wrap: break-word;
        }

        :host(.ie) .paper-input-input {
          display: inline-block;
        }

        :host(.ie) .input-value {
          line-height: 24px;
        }

        .placeholder {
          color: var(--secondary-text-color, rgba(0, 0, 0, 0.54));
        }
      </style>
      <paper-input-container
        always-float-label="[[alwaysFloatLabel]]"
        no-label-float="[[noLabelFloat]]"
        required$="[[required]]"
      >
        <label hidden$="[[!label]]" slot="label">[[label]]</label>
        <slot name="prefix" slot="prefix"></slot>
        <div slot="input" class="paper-input-input">
          <span class$="input-value [[_getPlaceholderClass(value)]]">
            [[_getDisplayValue(value)]]
          </span>
          <slot></slot>
        </div>
      </paper-input-container>
    `;
  }

  @property({type: String})
  label!: string;

  @property({type: String})
  value = '';

  @property({type: Boolean})
  alwaysFloatLabel = true;

  @property({type: Boolean})
  noLabelFloat!: boolean;

  @property({
    type: Boolean,
    reflectToAttribute: true,
    observer: '_requiredChanged'
  })
  required!: boolean;

  @property({type: Boolean})
  noPlaceholder = false;

  connectedCallback() {
    super.connectedCallback();
    const appShell = document.querySelector('app-shell');
    if (appShell && appShell.classList.contains('ie')) {
      this.classList.add('ie');
    }
  }

  _requiredChanged(req: any) {
    if (typeof req === 'undefined') {
      return;
    }
    this.updateStyles();
  }

  _getPlaceholderClass(value: string) {
    const cssclass = typeof value === 'string' && value.trim() !== '' ? '' : this.noPlaceholder ? '' : 'placeholder';
    return cssclass + ' etools-form-element-wrapper';
  }

  _getDisplayValue(value: string) {
    return typeof value === 'string' && value.trim() !== ''
      ? value == '-'
        ? 'N/A'
        : value.trim()
      : this.noPlaceholder
      ? ''
      : '—';
  }
}

window.customElements.define('etools-form-element-wrapper', EtoolsFormElementWrapper);
