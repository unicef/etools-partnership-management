import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-ripple/paper-ripple.js';

import {navMenuStyles} from './styles/nav-menu-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../redux/store';
import EnvironmentFlagsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/environment-flags-mixin';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';
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
      ${navMenuStyles}

      <div class="menu-header">
        <span id="app-name">
          Partnership <br />
          Management
        </span>

        <span class="ripple-wrapper main">
          <sl-icon
            id="menu-header-top-icon"
            name="partnership-management"
            @click="${this._toggleSmallMenu}"
          >
          </sl-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>

        <paper-tooltip for="menu-header-top-icon" position="right">Partnership Management</paper-tooltip>

        <span class="chev-right">
          <sl-icon id="expand-menu" name="chevron-right" @click="${this._toggleSmallMenu}"></sl-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>

        <span class="ripple-wrapper">
          <sl-icon id="minimize-menu" name="chevron-left" @click="${this._toggleSmallMenu}"></sl-icon>
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
            <sl-icon id="partners-icon" name="social:people"></sl-icon>
            <paper-tooltip for="partners-icon" position="right">${translate('PARTNERS')}</paper-tooltip>
            <div class="name">${translate('PARTNERS')}</div>
          </a>

          <a class="nav-menu-item" menu-name="agreements" href="${BASE_URL}agreements/list">
            <sl-icon id="agreements-icon" name="av:playlist-add-check"></sl-icon>
            <paper-tooltip for="agreements-icon" position="right">${translate('AGREEMENTS')}</paper-tooltip>
            <div class="name">${translate('AGREEMENTS')}</div>
          </a>

          <a class="nav-menu-item" menu-name="interventions" href="${BASE_URL}interventions/list">
            <sl-icon id="interventions-icon" name="description"></sl-icon>
            <paper-tooltip for="interventions-icon" position="right">${translate('PD_SPD')}</paper-tooltip>
            <div class="name">${translate('PD_SPD')}</div>
          </a>

          <a class="nav-menu-item" menu-name="government-partners" href="${BASE_URL}government-partners/list">
            <sl-icon id="gov-icon" name="account-balance"></sl-icon>
            <paper-tooltip for="gov-icon" position="right">${translate('GOVERNMENT')}</paper-tooltip>
            <div class="name">${translate('GOVERNMENT')}</div>
          </a>

          <a
            class="nav-menu-item"
            ?hidden="${this.environmentFlags?.prp_mode_off}"
            menu-name="reports"
            href="${BASE_URL}reports/list"
          >
            <sl-icon id="reports-icon" name="assignment"></sl-icon>
            <paper-tooltip for="reports-icon" position="right">${translate('REPORTS')}</paper-tooltip>
            <div class="name">${translate('REPORTS')}</div>
          </a>

          <a
            class="nav-menu-item"
            ?hidden="${this.environmentFlags?.prp_mode_off}"
            menu-name="settings"
            href="${BASE_URL}settings"
          >
            <sl-icon id="settings-icon" name="settings"></sl-icon>
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
          <sl-icon id="power-bi-icon" name="power-bi"></sl-icon>
          <paper-tooltip for="power-bi-icon" position="right"
            >${translate('IMPLEMENTATION_INTELLIGENCE')}</paper-tooltip
          >
          <div class="name">${translate('IMPLEMENTATION_INTELLIGENCE')}</div>
        </a>

        <a
          class="nav-menu-item lighter-item"
          href="http://etools.zendesk.com"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Knowledge base"
        >
          <sl-icon id="knoledge-icon" name="maps:local-library"></sl-icon>
          <paper-tooltip for="knoledge-icon" position="right">${translate('KNOWLEDGE_BASE')}</paper-tooltip>
          <div class="name">${translate('KNOWLEDGE_BASE')}</div>
        </a>

        <a
          class="nav-menu-item lighter-item"
          href="https://www.yammer.com/unicef.org/#/threads/inGroup?type=in_group&feedId=5782560"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Discussion"
        >
          <sl-icon id="discussion-icon" name="icons:question-answer"></sl-icon>
          <paper-tooltip for="discussion-icon" position="right">${translate('DISCUSSION')}</paper-tooltip>
          <div class="name">${translate('DISCUSSION')}</div>
        </a>
        <a
          class="nav-menu-item lighter-item last-one"
          href="https://etools.unicef.org/landing"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Information"
        >
          <sl-icon id="information-icon" name="icons:info"></sl-icon>
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
