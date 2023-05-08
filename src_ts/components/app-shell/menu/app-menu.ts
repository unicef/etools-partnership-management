import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/iron-icons/av-icons.js';
import '@polymer/iron-icons/maps-icons.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-ripple/paper-ripple.js';

import {navMenuStyles} from './styles/nav-menu-styles';
import {pmpMainIcons} from '../../styles/custom-iconsets/pmp-icons';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../redux/store';
import EnvironmentFlagsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/environment-flags-mixin';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {html, LitElement, property} from 'lit-element';
import {BASE_URL} from '../../../config/config';
import {translate} from 'lit-translate';

/**
 * PMP main menu
 * @polymer
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
      ${pmpMainIcons} ${navMenuStyles}

      <div class="menu-header">
        <span id="app-name">
          Partnership <br />
          Management
        </span>

        <span class="ripple-wrapper main">
          <iron-icon
            id="menu-header-top-icon"
            icon="pmp-main-icons:partnership-management"
            @tap="${this._toggleSmallMenu}"
          >
          </iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>

        <paper-tooltip for="menu-header-top-icon" position="right">Partnership Management</paper-tooltip>

        <span class="chev-right">
          <iron-icon id="expand-menu" icon="chevron-right" @tap="${this._toggleSmallMenu}"></iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>

        <span class="ripple-wrapper">
          <iron-icon id="minimize-menu" icon="chevron-left" @tap="${this._toggleSmallMenu}"></iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>
      </div>

      <div class="nav-menu">
        <iron-selector
          .selected="${this.selectedOption}"
          attr-for-selected="menu-name"
          selectable="a"
          role="navigation"
        >
          <a class="nav-menu-item" menu-name="partners" href="${BASE_URL}partners/list">
            <iron-icon id="partners-icon" icon="social:people"></iron-icon>
            <paper-tooltip for="partners-icon" position="right">${translate('PARTNERS')}</paper-tooltip>
            <div class="name">${translate('PARTNERS')}</div>
          </a>

          <a class="nav-menu-item" menu-name="agreements" href="${BASE_URL}agreements/list">
            <iron-icon id="agreements-icon" icon="av:playlist-add-check"></iron-icon>
            <paper-tooltip for="agreements-icon" position="right">${translate('AGREEMENTS')}</paper-tooltip>
            <div class="name">${translate('AGREEMENTS')}</div>
          </a>

          <a class="nav-menu-item" menu-name="interventions" href="${BASE_URL}interventions/list">
            <iron-icon id="interventions-icon" icon="description"></iron-icon>
            <paper-tooltip for="interventions-icon" position="right">${translate('PD_SPD')}</paper-tooltip>
            <div class="name">${translate('PD_SPD')}</div>
          </a>

          <a class="nav-menu-item" menu-name="government-partners" href="${BASE_URL}government-partners/list">
            <iron-icon id="gov-icon" icon="account-balance"></iron-icon>
            <paper-tooltip for="gov-icon" position="right">${translate('GOVERNMENT')}</paper-tooltip>
            <div class="name">${translate('GOVERNMENT')}</div>
          </a>

          <a
            class="nav-menu-item"
            ?hidden="${this.environmentFlags?.prp_mode_off}"
            menu-name="reports"
            href="${BASE_URL}reports/list"
          >
            <iron-icon id="reports-icon" icon="assignment"></iron-icon>
            <paper-tooltip for="reports-icon" position="right">${translate('REPORTS')}</paper-tooltip>
            <div class="name">${translate('REPORTS')}</div>
          </a>

          <a
            class="nav-menu-item"
            ?hidden="${this.environmentFlags?.prp_mode_off}"
            menu-name="settings"
            href="${BASE_URL}settings"
          >
            <iron-icon id="settings-icon" icon="settings"></iron-icon>
            <paper-tooltip for="settings-icon" position="right">${translate('SETTINGS')}</paper-tooltip>
            <div class="name">${translate('SETTINGS')}</div>
          </a>
        </iron-selector>

        <div class="nav-menu-item section-title">
          <span>${translate('ETOOLS_COMMUNITY_CHANNELS')}</span>
        </div>

        <a
          class="nav-menu-item lighter-item no-transform"
          href="https://app.powerbi.com/groups/me/apps/2c83563f-d6fc-4ade-9c10-bbca57ed1ece/reports/9726e9e7-c72f-4153-9fd2-7b418a1e426c/ReportSection?ctid=77410195-14e1-4fb8-904b-ab1892023667"
          target="_blank"
        >
          <iron-icon id="power-bi-icon" icon="pmp-main-icons:power-bi"></iron-icon>
          <paper-tooltip for="power-bi-icon" position="right"
            >${translate('IMPLEMENTATION_INTELLIGENCE')}</paper-tooltip
          >
          <div class="name">${translate('IMPLEMENTATION_INTELLIGENCE')}</div>
        </a>

        <a
          class="nav-menu-item lighter-item"
          href="http://etools.zendesk.com"
          target="_blank"
          @tap="${this.trackAnalytics}"
          tracker="Knowledge base"
        >
          <iron-icon id="knoledge-icon" icon="maps:local-library"></iron-icon>
          <paper-tooltip for="knoledge-icon" position="right">${translate('KNOWLEDGE_BASE')}</paper-tooltip>
          <div class="name">${translate('KNOWLEDGE_BASE')}</div>
        </a>

        <a
          class="nav-menu-item lighter-item"
          href="https://www.yammer.com/unicef.org/#/threads/inGroup?type=in_group&feedId=5782560"
          target="_blank"
          @tap="${this.trackAnalytics}"
          tracker="Discussion"
        >
          <iron-icon id="discussion-icon" icon="icons:question-answer"></iron-icon>
          <paper-tooltip for="discussion-icon" position="right">${translate('DISCUSSION')}</paper-tooltip>
          <div class="name">${translate('DISCUSSION')}</div>
        </a>
        <a
          class="nav-menu-item lighter-item last-one"
          href="https://etools.unicef.org/landing"
          target="_blank"
          @tap="${this.trackAnalytics}"
          tracker="Information"
        >
          <iron-icon id="information-icon" icon="icons:info"></iron-icon>
          <paper-tooltip for="information-icon" position="right">${translate('INFORMATION')}</paper-tooltip>
          <div class="name">${translate('INFORMATION')}</div>
        </a>
      </div>
    `;
  }

  @property({type: String})
  selectedOption = '';

  @property({type: String})
  rootPath = BASE_URL;

  private _smallMenu = false;
  @property({
    type: Boolean
  })
  get smallMenu() {
    return this._smallMenu;
  }
  set smallMenu(val: boolean) {
    this._menuSizeChange(val, this._smallMenu);
    this._smallMenu = val;
  }

  stateChanged(state: RootState) {
    this.envFlagsStateChanged(state);
  }

  _menuSizeChange(newVal: boolean, oldVal: boolean): void {
    if (newVal !== oldVal) {
      setTimeout(() => fireEvent(this, 'resize-main-layout'));
    }
  }

  _toggleSmallMenu(e: Event): void {
    e.stopImmediatePropagation();
    fireEvent(this, 'toggle-small-menu');
  }
}

window.customElements.define('app-menu', AppMenu);
