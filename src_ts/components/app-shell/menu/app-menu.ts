import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

import {navMenuStyles} from './styles/nav-menu-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {store, RootState} from '../../../redux/store';
import EnvironmentFlagsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/environment-flags-mixin';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {html, LitElement} from 'lit';
import {property, state} from 'lit/decorators.js';
import {SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY} from '../../../config/config';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
import {EtoolsUser} from '@unicef-polymer/etools-types';

/**
 * PMP main menu
 * @LitElement
 * @customElement
 * @appliesMixin GestureEventListeners
 */
class AppMenu extends connect(store)(MatomoMixin(EnvironmentFlagsMixin(LitElement))) {
  render() {
    // main template
    // language=HTML
    return html`
      ${navMenuStyles}

      <style>
        .menu-header {
          background: ${this.menuHeaderBgColor};
        }

        .nav-menu-item.selected .name,
        .nav-menu-item.selected etools-icon {
          color: ${this.menuItemColor};
        }
      </style>

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
            href="${Environment.basePath}partners/list"
          >
            <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('PARTNERS')}">
              <etools-icon id="partners-icon" name="social:people"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('PARTNERS')}</div>
          </a>

          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'agreements')}"
            menu-name="agreements"
            href="${Environment.basePath}agreements/list"
          >
            <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('AGREEMENTS')}">
              <etools-icon id="agreements-icon" name="av:playlist-add-check"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('AGREEMENTS')}</div>
          </a>

          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'interventions')}"
            menu-name="interventions"
            href="${Environment.basePath}interventions/list"
          >
            <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('PD_SPD')}">
              <etools-icon id="interventions-icon" name="description"></etools-icon>
            </sl-tooltip>

            <div class="name">${translate('PD_SPD')}</div>
          </a>
          <a
            ?hidden="${!this.user?.show_gpd}"
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'gpd-interventions')}"
            menu-name="gpd-interventions"
            href="${Environment.basePath}gpd-interventions/list"
          >
            <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="${translate('GPD')}">
              <etools-icon id="interventions-icon" name="description"></etools-icon>
            </sl-tooltip>

            <div class="name">${translate('GPD')}</div>
          </a>
          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'reports')}"
            ?hidden="${this.environmentFlags?.prp_mode_off}"
            menu-name="reports"
            href="${Environment.basePath}reports/list"
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
            href="${Environment.basePath}settings"
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

  @property({type: Object})
  user!: EtoolsUser;

  @property({type: String})
  selectedOption = '';

  @property({type: Boolean, attribute: 'small-menu'})
  smallMenu = false;

  @state()
  menuHeaderBgColor = 'var(--primary-color)';

  @state()
  menuItemColor = 'var(--primary-color)';

  stateChanged(state: RootState) {
    this.envFlagsStateChanged(state);

    if (state.app?.routeDetails.routeName === 'gpd-interventions') {
      this.menuHeaderBgColor = 'var(--header-bg-color)';
      this.menuItemColor = 'var(--ternary-color)';
    } else {
      this.menuHeaderBgColor = 'var(--primary-color)';
      this.menuItemColor = 'var(--primary-color)';
    }
  }

  getItemClass(selectedValue: string, itemValue: string) {
    return selectedValue === itemValue ? 'selected' : '';
  }

  _toggleSmallMenu(): void {
    this.smallMenu = !this.smallMenu;
    const localStorageVal: number = this.smallMenu ? 1 : 0;
    localStorage.setItem(SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY, String(localStorageVal));
    fireEvent(this, 'toggle-small-menu', {value: this.smallMenu});
  }
}

window.customElements.define('app-menu', AppMenu);
