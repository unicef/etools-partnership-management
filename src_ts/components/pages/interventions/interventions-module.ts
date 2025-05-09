import {html, LitElement} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import CONSTANTS from '../../../config/app-constants';
import ModuleMainElCommonFunctionalityMixinLit from '../../common/mixins/module-common-mixin-lit';
import ModuleRoutingMixinLit from '../../common/mixins/module-routing-mixin-lit';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import '../../common/components/page-content-header.js';
import '../../common/components/etools-error-messages-box.js';
import './data/intervention-item-data.js';
import '../agreements/data/agreement-item-data.js';
import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {pageContentHeaderSlottedStyles} from '../../styles/page-content-header-slotted-styles-lit';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {store, RootState} from '../../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import InterventionItemData from './data/intervention-item-data.js';
import './pages/intervention-tab-pages/intervention-tabs';
import get from 'lodash-es/get';
import {Agreement, Intervention, UserPermissions, GenericObject} from '@unicef-polymer/etools-types';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import {setStore} from '@unicef-polymer/etools-utils/dist/store.util';
import ScrollControlMixinLit from '../../common/mixins/scroll-control-mixin-lit';
import EnvironmentFlagsMixinLit from '../../common/environment-flags/environment-flags-mixin-lit';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import pmpEdpoints from '../../endpoints/endpoints';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import './pages/intervention-new/ecn-import-dialog.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';

// @ts-ignore
setStore(store);

/**
 * @LitElement
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin ScrollControlMixin
 * @appliesMixin ModuleMainElCommonFunctionalityMixin
 * @appliesMixin ModuleRoutingMixin
 * @appliesMixin SaveInterventionMixin
 */

@customElement('interventions-module')
export class InterventionsModule extends connect(store)(
  MatomoMixin(
    ScrollControlMixinLit(
      ModuleMainElCommonFunctionalityMixinLit(
        ModuleRoutingMixinLit(CommonMixin(EnvironmentFlagsMixinLit(EndpointsLitMixin(LitElement))))
      )
    )
  )
) {
  render() {
    return html`
      ${pageLayoutStyles} ${sharedStyles} ${pageContentHeaderSlottedStyles}
      <style>
        :host {
          display: flex;
          min-height: calc(100vh - 150px);
        }

        :host > div,
        intervention-tabs {
          width: 100%;
        }

        .no-capitalization {
          text-transform: none;
        }

        .export-dd {
          width: 105px;
        }

        .option-button {
          height: 36px;
          border-inline-start: 2px solid rgba(255, 255, 255, 0.12);
        }
        .main-button.with-additional {
          padding-inline-end: 0;
          padding-inline-start: 18px;
        }

        .main-button.with-additional span {
          margin-inline-end: 15px;
        }

        .main-button span {
          margin-inline-end: 7px;
          vertical-align: middle;
          line-height: 36px;
        }
        .main-button {
          height: 36px;
          padding: 0 18px;
          color: white;
          background: var(--primary-color);
          font-weight: 500;
          text-transform: uppercase;
          border-radius: 3px;
        }

        .other-options {
          padding: 10px 24px;
          color: var(--primary-text-color);
          white-space: nowrap;
        }

        .other-options:hover {
          background-color: var(--secondary-background-color);
        }

        .split-btn {
          --sl-spacing-medium: 0;
        }
        sl-dropdown#importEcn::part(trigger) {
          display: inline-flex;
          vertical-align: middle;
        }

        etools-icon[slot='trigger'] {
          padding: 4px 10px;
          border-inline-start: 1px solid rgba(255, 255, 255, 0.12);
        }
      </style>

      <div ?hidden="${this.showNewPMP(this.activePage)}">
        <page-content-header ?with-tabs-visible="${this.tabsActive}">
          <div slot="page-title">
            <span ?hidden="${!this._pageEquals(this.activePage, 'list')}"> ${translate('PD_SPDS')} </span>
            <span ?hidden="${!this._pageEquals(this.activePage, 'new')}">
              <span class="no-capitalization">${translate('INTERVENTIONS_LIST.ADD_PROGRAMME_DOCUMENT')}</span>
            </span>
          </div>

          <div slot="title-row-actions" class="content-header-actions export-options">
            <div class="action" ?hidden="${!this._pageEquals(this.activePage, 'list')}">
              <sl-dropdown id="pdExportMenuBtn" close-on-activate>
                <etools-button slot="trigger" variant="text" class="neutral" caret>
                  <etools-icon name="file-download" slot="prefix"></etools-icon>
                  ${translate('EXPORT')}
                </etools-button>
                <sl-menu>
                  <sl-menu-item @click="${this._exportPdBudget}" tracker="Export PD Budget"
                    >${translate('INTERVENTIONS_LIST.PD_BUDGET_EXPORT')}</sl-menu-item
                  >
                  <sl-menu-item @click="${this._exportPdResult}" tracker="Export PD Result"
                    >${translate('INTERVENTIONS_LIST.PD_RESULT_EXPORT')}</sl-menu-item
                  >
                  <sl-menu-item @click="${this._exportPdLocations}" tracker="Export PD Locations"
                    >${translate('INTERVENTIONS_LIST.PD_LOCATIONS_EXPORT')}</sl-menu-item
                  >
                </sl-menu>
              </sl-dropdown>
            </div>

            <div
              class="action"
              ?hidden="${!this._showAddNewIntervBtn(this.activePage == 'list', this.userPermissions)}"
            >
              <etools-button
                variant="primary"
                class="split-btn"
                @click="${this._goToNewInterventionPage}"
                ?hidden="${this.listLoadingActive}"
              >
                <etools-icon name="add" slot="prefix"></etools-icon>
                <span style="padding: 0 10px 0 0">${translate('INTERVENTIONS_LIST.ADD_NEW_PD')}</span>
                <sl-dropdown id="importEcn">
                  <etools-icon
                    slot="trigger"
                    name="expand-more"
                    @click="${(event: MouseEvent) => {
                      event.stopImmediatePropagation();
                      ((event.currentTarget as any)!.parentElement as SlDropdown).show();
                    }}"
                  ></etools-icon>
                  <sl-menu>
                    <sl-menu-item
                      @click="${(e: CustomEvent) => {
                        e.stopImmediatePropagation();
                        this.openEcnImportDialog();
                      }}"
                    >
                      ${translate('IMPORT_ECN')}
                    </sl-menu-item>
                  </sl-menu>
                </sl-dropdown>
              </etools-button>
            </div>
          </div>
        </page-content-header>

        <div id="main">
          <div id="pageContent">
            <etools-error-messages-box
              id="errorsBox"
              .title="${this.errorMsgBoxTitle}"
              .errors="${this.serverErrors}"
            ></etools-error-messages-box>

            <interventions-list
              id="list"
              name="list"
              ?hidden="${!this._pageEquals(this.activePage, 'list')}"
              .active="${this._pageEquals(this.activePage, 'list')}"
              @csv-download-url-changed="${this.csvDownloadUrlChanged}"
              @list-loading-active="${(ev: CustomEvent) => (this.listLoadingActive = ev.detail.value)}"
            >
            </interventions-list>

            ${this._pageEquals(this.activePage, 'new')
              ? html`<intervention-new @create-intervention="${this.onCreateIntervention}"></intervention-new>`
              : html``}
          </div>

          <!-- main page content end -->
        </div>
      </div>
      <intervention-tabs ?hidden="${!this.showNewPMP(this.activePage)}"></intervention-tabs>

      <intervention-item-data id="interventionData"></intervention-item-data>
    `;
  }

  @property({type: Object})
  userPermissions!: UserPermissions;

  @property({type: Object})
  intervention: Partial<Intervention> = {};

  @property({type: Object})
  originalIntervention!: Intervention;

  @property({type: Object})
  agreement!: Agreement;

  @property({type: String})
  csvDownloadQs!: string;

  @property({
    type: Boolean
  })
  newInterventionActive!: boolean;

  @property({type: Boolean})
  editMode!: boolean;

  @property({type: String})
  errorMsgBoxTitle = 'Errors Saving PD/SSFA';

  @property({type: Object})
  reportsPrevParams!: GenericObject;

  @property({type: String})
  moduleName = 'interventions';

  // This shouldn't be neccessary, but the Analyzer isn't picking up
  // Polymer.Element#rootPath
  @property({type: String})
  rootPath!: string;

  @property({type: Object})
  prevRouteDetails!: any;

  @property({type: Boolean})
  listLoadingActive = true;

  @state() isInitialLoading = true;

  stateChanged(state: RootState) {
    this.envStateChanged(state);

    if (get(state, 'app.routeDetails.routeName') !== 'interventions') {
      return;
    } else {
      const routeDetials = state.app?.routeDetails;
      if (!isJsonStrMatch(this.prevRouteDetails, routeDetials) || this.activePage !== routeDetials!.subRouteName) {
        this.prevRouteDetails = routeDetials;
        this.tabsActive = !['list', 'new'].includes(routeDetials!.subRouteName!);
        this.activePage = routeDetials!.subRouteName!;
        this.pageChanged(routeDetials!.subRouteName!);
      }
      if (this.isInitialLoading) {
        this.isInitialLoading = false;
        this._setInterventionsPageLoading();
      }
    }

    if (!this.intervention || get(this, 'intervention.id') !== get(state, 'interventions.current.id')) {
      this.intervention = get(state, 'interventions.current');
    } else {
      const currentPD = get(state, 'interventions.current');
      if (!isJsonStrMatch(this.intervention, currentPD) && currentPD) {
        this.intervention = currentPD;
      }
    }
  }

  showNewPMP(activePage: string) {
    return [
      'metadata',
      'overview',
      'timing',
      'workplan',
      'workplan-editor',
      'strategy',
      'attachments',
      'review',
      'progress',
      'reports',
      'info',
      'implementation-status',
      'monitoring-activities',
      'results-reported'
    ].includes(activePage);
  }

  openEcnImportDialog() {
    openDialog({
      dialog: 'ecn-import-dialog'
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._initInterventionsModuleListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeInterventionsModuleListeners();
  }

  _setInterventionsPageLoading() {
    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'main-page'
    });
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'interv-page'
    });
  }

  _initInterventionsModuleListeners() {
    this._interventionSaveErrors = this._interventionSaveErrors.bind(this);
    // this._handleInterventionSelectionLoadingMsg = this._handleInterventionSelectionLoadingMsg.bind(this);
    this.addEventListener('intervention-save-error', this._interventionSaveErrors as any);
    // this.addEventListener('trigger-intervention-loading-msg', this._handleInterventionSelectionLoadingMsg);
  }

  _removeInterventionsModuleListeners() {
    this.removeEventListener('intervention-save-error', this._interventionSaveErrors as any);
    // this.removeEventListener('trigger-intervention-loading-msg', this._handleInterventionSelectionLoadingMsg);
  }

  pageChanged(page: string) {
    // Using isActiveModule will prevent wrong page import
    // if (!this.isActiveModule() || (!this.listActive && !this.tabsActive && !this.newPageActive)) {
    //   return;
    // }

    this.scrollToTopOnCondition(!this._pageEquals(page, 'list'));

    if (['list', 'new'].includes(page)) {
      this.reportsPrevParams = {};
    }
  }

  _isNewIntervention() {
    return !this.intervention.id;
  }

  _deleteIntervention(e: CustomEvent) {
    (this.shadowRoot?.querySelector('#interventionData') as InterventionItemData).deleteIntervention(e.detail.id);
  }

  _userHasEditPermissions(permissions: UserPermissions) {
    return (
      permissions && permissions.editInterventionDetails === true && (permissions.partnershipManager || permissions.PME)
    );
  }

  _hasEditPermissions(permissions: UserPermissions, intervention?: Intervention) {
    if (permissions && permissions.editInterventionDetails === true) {
      if (intervention) {
        if (
          !(permissions.partnershipManager || permissions.PME) &&
          (!intervention.status || intervention.status !== CONSTANTS.STATUSES.Draft.toLowerCase())
        ) {
          // other users than partnershipManager or PME will be able to edit only if intervention status is draft
          return false;
        }
      }
      return true;
    }
    return false;
  }

  _goToNewInterventionPage() {
    // go to new intervention
    if (!this._hasEditPermissions(this.userPermissions)) {
      return;
    }
    history.pushState(window.history.state, '', `${Environment.basePath}interventions/new`);
    window.dispatchEvent(new CustomEvent('popstate'));
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'interv-page'
    });
  }

  _visibleTabContent(activePage: string, expectedPage: string, newInterventionActive: boolean) {
    return this._pageEquals(activePage, expectedPage) && !newInterventionActive;
  }

  /**
   * Go to details page once the new intervention has been saved
   */
  _newInterventionSaved(intervention: Intervention) {
    history.pushState(window.history.state, '', `${Environment.basePath}interventions/${intervention.id}/metadata`);
    window.dispatchEvent(new CustomEvent('popstate'));
    this.requestUpdate();
  }

  _showAddNewIntervBtn(listActive: boolean, permissions: UserPermissions) {
    return listActive && this._hasEditPermissions(permissions);
  }

  _interventionSaveErrors(event: CustomEvent) {
    event.stopImmediatePropagation();
    if (
      (event.detail instanceof Array && event.detail.length > 0) ||
      (typeof event.detail === 'string' && event.detail !== '')
    ) {
      fireEvent(this, 'set-server-errors', event.detail);
      this.scrollToTop();
    }
  }

  // _handleInterventionSelectionLoadingMsg() {
  //   setTimeout(() => {
  //     this._showTabChangeLoadingMsg(null, 'interv-page', 'intervention-', 'tabs');
  //   });
  // }

  /**
   * Loading msg used stamping tabs elements (disabled in each tab main element attached callback)
   */
  // _showInterventionPageLoadingMessage() {
  //   fireEvent(this, 'global-loading', {
  //     message: 'Loading...',
  //     active: true,
  //     loadingSource: 'interv-page'
  //   });
  // }

  _exportPdBudget(e: CustomEvent) {
    this._exportPD(e, pmpEdpoints.interventions.url);
  }

  _exportPdResult(e: CustomEvent) {
    this._exportPD(e, pmpEdpoints.resultExports.url);
  }

  _exportPdLocations(e: CustomEvent) {
    this._exportPD(e, pmpEdpoints.pdLocationsExport.url);
  }

  _exportPD(e: CustomEvent, url: string) {
    this.trackAnalytics(e);
    const csvDownloadUrl = url + (url.indexOf('?') > -1 ? '&' : '?') + this.csvDownloadQs;
    window.open(csvDownloadUrl, '_blank');
  }

  onCreateIntervention({detail}: CustomEvent) {
    const intervention = this.cleanUpBeforeSave(detail.intervention);
    (this.shadowRoot?.querySelector('#interventionData') as InterventionItemData)
      // @ts-ignore
      .saveIntervention(intervention, this._newInterventionSaved.bind(this));
  }

  private cleanUpBeforeSave(intervention: Partial<Intervention>) {
    if (!intervention.cfei_number) {
      // Errors out on bk otherwise
      delete intervention.cfei_number;
    }
    return intervention;
  }
  csvDownloadUrlChanged(e: CustomEvent) {
    this.csvDownloadQs = e.detail;
  }

  protected isActiveSubPage(currentSubPageName: string, expectedSubPageNames: string): boolean {
    const subPages: string[] = expectedSubPageNames.split('|');
    return subPages.indexOf(currentSubPageName) > -1;
  }
}
