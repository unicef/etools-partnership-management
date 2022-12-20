import '@polymer/paper-input/paper-input-container.js';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import {html, LitElement, property} from 'lit-element';
import {requiredFieldStarredStyles} from '../../styles/required-field-styles-lit';

/**
 * @polymer
 * @customElement
 * ! TODO - etools-form-element-wrapper from etools-modules-common
 * has an extra margin(from sharedStyles) that doesn't fit in in PMP
 */
class EtoolsFormElementWrapper extends LitElement {
  render() {
    return html`
      ${sharedStyles} ${requiredFieldStarredStyles}
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

        paper-input-container {
          margin: 0;
        }
      </style>
      <paper-input-container
        ?always-float-label="${this.alwaysFloatLabel}"
        ?no-label-float="${this.noLabelFloat}"
        ?required="${this.required}"
      >
        <label ?hidden="${!this.label}" slot="label">${this.label}</label>
        <slot name="prefix" slot="prefix"></slot>
        <div slot="input" class="paper-input-input etools-form-element-wrapper">
          <span class="input-value">${this._getDisplayValue(this.value)}</span>
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
    type: Boolean
  })
  required!: boolean;

  @property({type: Boolean, attribute: 'no-placeholder'})
  noPlaceholder = false;

  connectedCallback() {
    super.connectedCallback();
    const appShell = document.querySelector('app-shell');
    if (appShell && appShell.classList.contains('ie')) {
      this.classList.add('ie');
    }
  }

  _getDisplayValue(value: string) {
    if (this.noPlaceholder) {
      return '';
    }

    return typeof value === 'string' && value.trim() !== '' ? (value == '-' ? 'N/A' : value.trim()) : '—';
  }
}

window.customElements.define('etools-form-element-wrapper2', EtoolsFormElementWrapper);
