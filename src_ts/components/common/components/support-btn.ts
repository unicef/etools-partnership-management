/* eslint-disable lit/attribute-value-entities */
import {css, CSSResult, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {translate} from 'lit-translate';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
/* eslint-disable max-len */

/**
 * @LitElement
 * @customElement
 */
@customElement('support-btn')
export class SupportBtn extends MatomoMixin(LitElement) {
  static get styles(): CSSResult {
    // language=CSS
    return css`
      :host(:hover) {
        cursor: pointer;
      }

      a {
        color: var(--light-secondary-text-color);
        text-decoration: none;
        font-size: 16px;
      }

      etools-icon {
        margin-right: 4px;
        color: var(--light-secondary-text-color);
      }

      @media (max-width: 650px) {
        .support-text {
          display: none;
        }
      }
    `;
  }

  render(): TemplateResult {
    // language=HTML
    return html`
      <a
        href="https://unicef.service-now.com/cc?id=sc_cat_item&sys_id=c8e43760db622450f65a2aea4b9619ad&sysparm_category=99c51053db0a6f40f65a2aea4b9619af"
        target="_blank"
        tracker="Support"
        @click="${this.trackAnalytics}"
      >
        <etools-icon name="communication:textsms"></etools-icon>
        <span class="support-text">${translate('SUPPORT')}</span>
      </a>
    `;
  }
}
