import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-icon-button/paper-icon-button';
import CONSTANTS from '../../../config/app-constants';
import ModuleMainElCommonFunctionalityMixinLit from '../../common/mixins/module-common-mixin-lit';
import ModuleRoutingMixinLit from '../../common/mixins/module-routing-mixin-lit';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import '../../common/components/page-content-header.js';
import '../../common/components/etools-error-messages-box.js';
import './data/intervention-item-data.js';
import '../agreements/data/agreement-item-data.js';
import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {buttonsStyles} from '../../styles/buttons-styles-lit';
import {pageContentHeaderSlottedStyles} from '../../styles/page-content-header-slotted-styles-lit';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/general.util';
import {store, RootState} from '../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import InterventionItemData from './data/intervention-item-data.js';
import './pages/intervention-tab-pages/intervention-tabs';
import get from 'lodash-es/get';
import {Agreement, Intervention, UserPermissions, GenericObject} from '@unicef-polymer/etools-types';
import CommonMixinLit from '../../common/mixins/common-mixin-lit';
import {setStore} from '@unicef-polymer/etools-utils/dist/store.util';
import ScrollControlMixinLit from '../../common/mixins/scroll-control-mixin-lit';
import EnvironmentFlagsMixinLit from '../../common/environment-flags/environment-flags-mixin-lit';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config';
import pmpEdpoints from '../../endpoints/endpoints';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {translate} from 'lit-translate';
import './pages/new/ecn-import-dialog';
import {PaperMenuButton} from '@polymer/paper-menu-button/paper-menu-button.js';

// @ts-ignore
setStore(store);

/**
 * @polymer
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
        ModuleRoutingMixinLit(CommonMixinLit(EnvironmentFlagsMixinLit(EndpointsLitMixin(LitElement))))
      )
    )
  )
) {
  render() {
    return html`
      ${pageLayoutStyles} ${sharedStyles} ${buttonsStyles} ${pageContentHeaderSlottedStyles}
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
        paper-button paper-menu-button {
          padding: 8px 2px;
          margin-inline-start: 10px;
        }
        .other-options {
          padding: 10px 24px;
          color: var(--primary-text-color);
          white-space: nowrap;
        }

        .other-options:hover {
          background-color: var(--secondary-background-color);
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
              <paper-menu-button id="pdExportMenuBtn" close-on-activate>
                <paper-button slot="dropdown-trigger" class="focus-as-link">
                  <iron-icon icon="file-download"></iron-icon>
                  ${translate('EXPORT')}
                </paper-button>
                <paper-listbox slot="dropdown-content">
                  <paper-item @tap="${this._exportPdBudget}" tracker="Export PD Budget"
                    >${translate('INTERVENTIONS_LIST.PD_BUDGET_EXPORT')}</paper-item
                  >
                  <paper-item @tap="${this._exportPdResult}" tracker="Export PD Result"
                    >${translate('INTERVENTIONS_LIST.PD_RESULT_EXPORT')}</paper-item
                  >
                  <paper-item @tap="${this._exportPdLocations}" tracker="Export PD Locations"
                    >${translate('INTERVENTIONS_LIST.PD_LOCATIONS_EXPORT')}</paper-item
                  >
                </paper-listbox>
              </paper-menu-button>
            </div>

            <div
              class="action"
              ?hidden="${!this._showAddNewIntervBtn(this.activePage == 'list', this.userPermissions)}"
            >
              <paper-button
                class="primary-btn with-prefix main-button with-additional"
                @click="${this._goToNewInterventionPage}"
              >
                <iron-icon icon="add"></iron-icon>
                ${translate('INTERVENTIONS_LIST.ADD_NEW_PD')}
                <paper-menu-button id="importEcn" horizontal-align="right">
                  <paper-icon-button
                    slot="dropdown-trigger"
                    class="option-button"
                    icon="expand-more"
                    @click="${(event: MouseEvent) => {
                      event.stopImmediatePropagation();
                    }}"
                  ></paper-icon-button>
                  <div slot="dropdown-content">
                    <div
                      class="other-options"
                      @click="${(e: CustomEvent) => {
                        e.stopImmediatePropagation();
                        this.openEcnImportDialog();
                      }}"
                    >
                      ${translate('IMPORT_ECN')}
                    </div>
                  </div>
                </paper-menu-button>
              </paper-button>
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
    }

    if (!this.intervention || get(this, 'intervention.id') !== get(state, 'interventions.current.id')) {
      this.intervention = get(state, 'interventions.current');
    } else {
      const currentPD = get(state, 'interventions.current');
      if (!isJsonStrMatch(this.intervention, currentPD) && currentPD) {
        this.updateDexieData(currentPD);
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
      'info'
    ].includes(activePage);
  }

  openEcnImportDialog() {
    this.closeEcnDropdown();
    openDialog({
      dialog: 'ecn-import-dialog'
    });
  }

  closeEcnDropdown() {
    const element: PaperMenuButton | null = this.shadowRoot!.querySelector('paper-menu-button#importEcn');
    if (element) {
      element.close();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'interv-page'
    });
    this._initInterventionsModuleListeners();

    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'main-page'
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeInterventionsModuleListeners();
  }

  _initInterventionsModuleListeners() {
    this._interventionSaveErrors = this._interventionSaveErrors.bind(this);
    // this._handleInterventionSelectionLoadingMsg = this._handleInterventionSelectionLoadingMsg.bind(this);
    this.addEventListener('intervention-save-error', this._interventionSaveErrors as any);
    // this.addEventListener('trigger-intervention-loading-msg', this._handleInterventionSelectionLoadingMsg);

    this.onAmendmentAdded = this.onAmendmentAdded.bind(this);
    this.onAmendmentDeleted = this.onAmendmentDeleted.bind(this);
    this.addEventListener('amendment-added', this.onAmendmentAdded as any);
    this.addEventListener('amendment-deleted', this.onAmendmentDeleted as any);
  }

  _removeInterventionsModuleListeners() {
    this.removeEventListener('intervention-save-error', this._interventionSaveErrors as any);
    // this.removeEventListener('trigger-intervention-loading-msg', this._handleInterventionSelectionLoadingMsg);

    this.removeEventListener('amendment-added', this.onAmendmentAdded as any);
    this.removeEventListener('amendment-deleted', this.onAmendmentDeleted as any);
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

  onAmendmentDeleted(e: CustomEvent) {
    (this.shadowRoot?.querySelector('#interventionData') as InterventionItemData).deleteInterventionFromDexie(
      e.detail.id
    );
  }

  onAmendmentAdded(e: CustomEvent) {
    this.updateDexieData(e.detail);
  }

  updateDexieData(intervention: Intervention) {
    (this.shadowRoot?.querySelector('#interventionData') as InterventionItemData).updateInterventionsListInDexieDb(
      intervention
    );
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
    history.pushState(window.history.state, '', `${ROOT_PATH}interventions/new`);
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
    history.pushState(window.history.state, '', `${ROOT_PATH}interventions/${intervention.id}/metadata`);
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
