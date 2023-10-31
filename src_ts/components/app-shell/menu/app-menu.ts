import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

import {navMenuStyles} from './styles/nav-menu-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../redux/store';
import EnvironmentFlagsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/environment-flags-mixin';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {BASE_URL, SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY} from '../../../config/config';
import {translate} from 'lit-translate';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';

/**
 * PMP main menu
 * @LitElement
 * @customElement
 * @appliesMixin GestureEventListeners
 */
class AppMenu extends connect(store)(
  // eslint-disable-next-line new-cap
  MatomoMixin(EnvironmentFlagsMixin(LitElement))
) {
  render() {
    // main template
    // language=HTML
    return html`
      ${navMenuStyles}

      <div class="menu-header">
        <span id="app-name">
          Partnership <br />
          Management
        </span>

        <sl-tooltip content="Partnership Management" placement="right">
          <span class="ripple-wrapper main">
            <etools-icon id="menu-header-top-icon" name="partnership-management" @click="${this._toggleSmallMenu}">
            </etools-icon>
          </span>
        </sl-tooltip>

        <span class="chev-right">
          <etools-icon id="expand-menu" name="chevron-right" @click="${this._toggleSmallMenu}"></etools-icon>
        </span>

        <span class="ripple-wrapper">
          <etools-icon id="minimize-menu" name="chevron-left" @click="${this._toggleSmallMenu}"></etools-icon>
        </span>
      </div>

      <div class="nav-menu">
        <div class="menu-selector" role="navigation">
          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'partners')}"
            menu-name="partners"
            href="${BASE_URL}partners/list"
          >
            <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('PARTNERS')}">
              <etools-icon id="partners-icon" name="social:people"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('PARTNERS')}</div>
          </a>

          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'agreements')}"
            menu-name="agreements"
            href="${BASE_URL}agreements/list"
          >
            <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('AGREEMENTS')}">
              <etools-icon id="agreements-icon" name="av:playlist-add-check"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('AGREEMENTS')}</div>
          </a>

          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'interventions')}"
            menu-name="interventions"
            href="${BASE_URL}interventions/list"
          >
            <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('PD_SPD')}">
              <etools-icon id="interventions-icon" name="description"></etools-icon>
            </sl-tooltip>

            <div class="name">${translate('PD_SPD')}</div>
          </a>

          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'government-partners')}"
            menu-name="government-partners"
            href="${BASE_URL}government-partners/list"
          >
            <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('GOVERNMENT')}">
              <etools-icon id="gov-icon" name="account-balance"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('GOVERNMENT')}</div>
          </a>

          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'reports')}"
            ?hidden="${this.environmentFlags?.prp_mode_off}"
            menu-name="reports"
            href="${BASE_URL}reports/list"
          >
            <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('REPORTS')}">
              <etools-icon id="reports-icon" name="assignment"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('REPORTS')}</div>
          </a>

          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'settings')}"
            ?hidden="${this.environmentFlags?.prp_mode_off}"
            menu-name="settings"
            href="${BASE_URL}settings"
          >
            <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('SETTINGS')}">
              <etools-icon id="settings-icon" name="settings"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('SETTINGS')}</div>
          </a>
        </div>
        <div class="nav-menu-item section-title">
          <span>${translate('ETOOLS_COMMUNITY_CHANNELS')}</span>
        </div>

        <a
          class="nav-menu-item lighter-item no-transform"
          href="https://app.powerbi.com/groups/me/apps/2c83563f-d6fc-4ade-9c10-bbca57ed1ece/reports/9726e9e7-c72f-4153-9fd2-7b418a1e426c/ReportSection?ctid=77410195-14e1-4fb8-904b-ab1892023667"
          target="_blank"
        >
          <sl-tooltip
            placement="right"
            ?disabled="${!this.smallMenu}"
            content="${translate('IMPLEMENTATION_INTELLIGENCE')}"
          >
            <etools-icon id="power-bi-icon" name="power-bi"></etools-icon>
          </sl-tooltip>
          <div class="name">${translate('IMPLEMENTATION_INTELLIGENCE')}</div>
        </a>

        <a
          class="nav-menu-item lighter-item"
          href="http://etools.zendesk.com"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Knowledge base"
        >
          <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('KNOWLEDGE_BASE')}">
            <etools-icon id="knoledge-icon" name="maps:local-library"></etools-icon>
          </sl-tooltip>
          <div class="name">${translate('KNOWLEDGE_BASE')}</div>
        </a>

        <a
          class="nav-menu-item lighter-item"
          href="https://www.yammer.com/unicef.org/#/threads/inGroup?type=in_group&feedId=5782560"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Discussion"
        >
          <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('DISCUSSION')}">
            <etools-icon id="discussion-icon" name="question-answer"></etools-icon>
          </sl-tooltip>
          <div class="name">${translate('DISCUSSION')}</div>
        </a>
        <a
          class="nav-menu-item lighter-item last-one"
          href="https://etools.unicef.org/landing"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Information"
        >
          <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('INFORMATION')}">
            <etools-icon id="information-icon" name="info"></etools-icon>
          </sl-tooltip>
          <div class="name">${translate('INFORMATION')}</div>
        </a>
      </div>
    `;
  }

  @property({type: String})
  selectedOption = '';

  @property({type: String})
  rootPath = BASE_URL;

  @property({type: Boolean, attribute: 'small-menu'})
  smallMenu = false;

  stateChanged(state: RootState) {
    this.envFlagsStateChanged(state);
  }

  getItemClass(selectedValue: string, itemValue: string) {
    return selectedValue === itemValue ? 'selected' : '';
  }

  _toggleSmallMenu(): void {
    this.smallMenu = !this.smallMenu;
    console.log(this.smallMenu);
    const localStorageVal: number = this.smallMenu ? 1 : 0;
    localStorage.setItem(SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY, String(localStorageVal));
    fireEvent(this, 'toggle-small-menu', {value: this.smallMenu});
  }
}

window.customElements.define('app-menu', AppMenu);
