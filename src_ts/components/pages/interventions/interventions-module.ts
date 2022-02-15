import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import CONSTANTS from '../../../config/app-constants';
import ModuleMainElCommonFunctionalityMixinLit from '../../common/mixins/module-common-mixin-lit';
import ModuleRoutingMixinLit from '../../common/mixins/module-routing-mixin-lit';
import '../../common/components/page-content-header.js';
import '../../styles/page-content-header-slotted-styles.js';
import '../../common/components/etools-error-messages-box.js';
import '../../common/components/etools-tabs.js';
import './data/intervention-item-data.js';
import '../agreements/data/agreement-item-data.js';
import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {buttonsStyles} from '../../styles/buttons-styles-lit';
import {pageContentHeaderSlottedStyles} from '../../styles/page-content-header-slotted-styles-lit';
import {isEmptyObject, isJsonStrMatch} from '../../utils/utils';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {store, RootState} from '../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import {fireEvent} from '../../utils/fire-custom-event';
import InterventionItemData from './data/intervention-item-data.js';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import './pages/intervention-tab-pages/intervention-tabs';
import get from 'lodash-es/get';
import {Agreement, Intervention, UserPermissions, GenericObject} from '@unicef-polymer/etools-types';
import CommonMixinLit from '../../common/mixins/common-mixin-lit';
import {setStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import ScrollControlMixinLit from '../../common/mixins/scroll-control-mixin-lit';
import EnvironmentFlagsMixinLit from '../../common/environment-flags/environment-flags-mixin-lit';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

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
  ScrollControlMixinLit(
    ModuleMainElCommonFunctionalityMixinLit(
      ModuleRoutingMixinLit(CommonMixinLit(EnvironmentFlagsMixinLit(EndpointsLitMixin(LitElement))))
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

        paper-menu-button {
          --paper-menu-button: {
            padding: 8px 0 0 0;
          }
        }

        #pdExportMenuBtn paper-item {
          --paper-item-selected: {
            font-weight: normal !important;
          }
          /* Prevent first item highlighted by default */
          --paper-item-focused-before: {
            background: none;
            opacity: 0;
          }
          --paper-item-focused-after: {
            background: none;
            opacity: 0;
          }
        }
      </style>

      <app-route
        .route="${this.route}"
        @route-changed="${({detail}: CustomEvent) => {
          console.log(detail);
          this.route = detail.value;
        }}"
        pattern="/list"
        .queryParams="${this.listPageQueryParams}"
        @query-params-changed="${({detail}: CustomEvent) => {
          setTimeout(() => {
            this.listPageQueryParams = detail.value;
          }, 100);
        }}"
        .active="${this.listActive}"
        @active-changed="${({detail}: CustomEvent) => {
          this.listActive = detail.value;
          this.newInterventionActive = this._updateNewItemPageFlag();
          this._pageChanged();
        }}"
      ></app-route>

      <app-route
        .route="${this.route}"
        pattern="/new"
        .active="${this.newPageActive}"
        @active-changed="${({detail}: CustomEvent) => {
          this.newPageActive = detail.value;
          this._pageChanged();
        }}"
      ></app-route>
      <app-route
        .route="${this.route}"
        pattern="/:id/:tab"
        .active="${this.tabsActive}"
        .data="${this.routeData}"
        @active-changed="${({detail}: CustomEvent) => {
          this.tabsActive = detail.value;
          this._pageChanged();
        }}"
        @data-changed="${({detail}: CustomEvent) => {
          this.routeData = detail.value;
          this.newInterventionActive = this._updateNewItemPageFlag();
          this._pageChanged();
        }}"
        tail="${this.subroute}"
        @tail-changed="${({detail}: CustomEvent) => {
          this.subroute = detail.value;
        }}"
      ></app-route>
      <app-route
        .route="${this.subroute}"
        pattern="/:subtab"
        .active="${this.tabsActive}"
        @data-changed="${({detail}: CustomEvent) => {
          this.subRouteData = detail.value;
        }}"
        .data="${this.subRouteData}"
      ></app-route>

      <div ?hidden="${this.showNewPMP(this.activePage)}">
        <page-content-header with-tabs-visible="${this.tabsActive}">
          <div slot="page-title">
            <span ?hidden="${!this.listActive}"> PD/SPDs </span>
            <span ?hidden="${!this.newPageActive}">
              <span class="no-capitalization"
                >${this._getTranslation('INTERVENTIONS_LIST.ADD_PROGRAMME_DOCUMENT')}</span
              >
            </span>
            <span ?hidden="${!this.tabsActive}">
              <span>
                <a
                  class="primary"
                  .href="${this.rootPath}partners/${this.intervention.partner_id}/overview"
                  target="_blank"
                  >${this.intervention.partner}</a
                >
                <span>: ${this.intervention.number}</span>
              </span>
            </span>
          </div>

          <div slot="title-row-actions" class="content-header-actions export-options">
            <div class="action" ?hidden="${!this.listActive}">
              <paper-menu-button id="pdExportMenuBtn" close-on-activate>
                <paper-button slot="dropdown-trigger">
                  <iron-icon icon="file-download"></iron-icon>
                  ${this._getTranslation('EXPORT')}
                </paper-button>
                <paper-listbox slot="dropdown-content">
                  <paper-item on-tap="_exportPdBudget"
                    >${this._getTranslation('INTERVENTIONS_LIST.PD_BUDGET_EXPORT')}</paper-item
                  >
                  <paper-item on-tap="_exportPdResult"
                    >${this._getTranslation('INTERVENTIONS_LIST.PD_RESULT_EXPORT')}</paper-item
                  >
                  <paper-item on-tap="_exportPdLocations"
                    >${this._getTranslation('INTERVENTIONS_LIST.PD_LOCATIONS_EXPORT')}</paper-item
                  >
                </paper-listbox>
              </paper-menu-button>
            </div>

            <div class="action" ?hidden="${!this._showAddNewIntervBtn(this.listActive, this.permissions)}">
              <paper-button class="primary-btn with-prefix" @tap="${this._goToNewInterventionPage}">
                <iron-icon icon="add"></iron-icon>
                ${this._getTranslation('INTERVENTIONS_LIST.ADD_NEW_PD')}
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
              .active="${this.listActive}"
              @csv-download-url-changed="${this.csvDownloadUrlChanged}"
            >
            </interventions-list>

            <intervention-new
              ?hidden="${this._pageEquals(this.activePage, 'new')}"
              @create-intervention="${this.onCreateIntervention}"
            ></intervention-new>
          </div>

          <!-- main page content end -->
        </div>
      </div>
      <intervention-tabs ?hidden="${!this.showNewPMP(this.activePage)}"></intervention-tabs>
    `;
  }

  /**
   * User permissions at this level
   * TODO: rename to userPermissions
   */
  @property({type: Object})
  permissions!: UserPermissions;

  @property({type: Number})
  selectedInterventionId!: number;

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

  @property({type: Boolean})
  _redirectToNewIntervPageInProgress!: boolean;

  @property({type: String})
  errorMsgBoxTitle = 'Errors Saving PD/SSFA';

  @property({type: Object})
  saved: {
    interventionId: any;
    justSaved: boolean;
  } = {
    interventionId: null,
    justSaved: false
  };

  @property({type: Boolean})
  _forceDetUiValidationOnAttach!: boolean;

  @property({type: Boolean})
  _forceReviewUiValidationOnAttach!: boolean;

  @property({type: Boolean})
  newPageActive!: boolean;

  @property({type: Object})
  reportsPrevParams!: GenericObject;

  @property({type: String})
  moduleName = 'interventions';

  // This shouldn't be neccessary, but the Analyzer isn't picking up
  // Polymer.Element#rootPath
  @property({type: String})
  rootPath!: string;

  finalizeAmendmentConfirmationDialog!: EtoolsDialog;
  private _pageChangeDebouncer!: Debouncer;

  // static get observers() {
  //   return ['_pageChanged(listActive, tabsActive, newPageActive, routeData)', '_observeRouteDataId(routeData.id)'];
  // }

  stateChanged(state: RootState) {
    this.envStateChanged(state);

    if (!this.intervention || get(this, 'intervention.id') !== get(state, 'interventions.current.id')) {
      this.intervention = get(state, 'interventions.current');
    } else {
      const currentPD = get(state, 'interventions.current');
      if (!isJsonStrMatch(this.intervention, currentPD) && currentPD) {
        this.updateDexieData(currentPD);
        console.log('Updated Intervention list Dexie data');
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
      'strategy',
      'attachments',
      'review',
      'progress',
      'reports',
      'info'
    ].includes(activePage);
  }

  connectedCallback() {
    super.connectedCallback();
    // if (this.newInterventionActive) {
    //   // @ts-ignore
    //   this._setNewInterventionObj();
    // }

    this._initInterventionsModuleListeners();
    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'main-page'
    });
    // this._showInterventionPageLoadingMessage();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeInterventionsModuleListeners();
  }

  _initInterventionsModuleListeners() {
    this._interventionSaveErrors = this._interventionSaveErrors.bind(this);
    this._handleInterventionSelectionLoadingMsg = this._handleInterventionSelectionLoadingMsg.bind(this);
    this.addEventListener('intervention-save-error', this._interventionSaveErrors as any);
    this.addEventListener('trigger-intervention-loading-msg', this._handleInterventionSelectionLoadingMsg);

    this.onAmendmentAdded = this.onAmendmentAdded.bind(this);
    this.onAmendmentDeleted = this.onAmendmentDeleted.bind(this);
    this.addEventListener('amendment-added', this.onAmendmentAdded as any);
    this.addEventListener('amendment-deleted', this.onAmendmentDeleted as any);
  }

  _removeInterventionsModuleListeners() {
    this.removeEventListener('intervention-save-error', this._interventionSaveErrors as any);
    this.removeEventListener('trigger-intervention-loading-msg', this._handleInterventionSelectionLoadingMsg);

    this.removeEventListener('amendment-added', this.onAmendmentAdded as any);
    this.removeEventListener('amendment-deleted', this.onAmendmentDeleted as any);
  }

  _interventionChanged(intervention: Intervention, permissions: UserPermissions) {
    if (typeof intervention === 'undefined' || typeof permissions === 'undefined') {
      return;
    }
    // this._displayAnyMigrationErrors(intervention);
    // this._makeSureMigrationErrorIsNotShownAgainAfterSave(intervention);

    this.originalIntervention = JSON.parse(JSON.stringify(intervention));
    if (!isEmptyObject(intervention)) {
      // set edit permissions
      const isNewIntervention = this._redirectToNewIntervPageInProgress || this.newInterventionActive;
      if (isNewIntervention) {
        this.intervention.reference_number_year = new Date().getFullYear();
        this.requestUpdate();
      }

      setTimeout(() => {
        // ensure intervention get/save/change status loading msgs close
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'pd-ssfa-data'
        });
      }, 1000);
    }
  }

  _displayAnyMigrationErrors(_intervention: any) {
    // TODO -remove
    // if (intervention.metadata && intervention.metadata.error_msg && intervention.metadata.error_msg.length) {
    //   if (this.saved.interventionId !== intervention.id && !this.saved.justSaved) {
    //     // Avoid showing msg again after save
    //     this.set(
    //       'errorMsgBoxTitle',
    //       'eTools validation code has been upgraded and this record is now considered invalid due to:'
    //     );
    //     fireEvent(this, 'set-server-errors', intervention.metadata.error_msg);
    //   }
    // }
  }

  /* Show metadata error message on intervention detail 'page load'*/
  _makeSureMigrationErrorIsNotShownAgainAfterSave(_intervention: Intervention) {
    // if (this.saved.interventionId !== intervention.id) {
    //   this.saved.justSaved = false;
    // }
    // this.saved.interventionId = intervention.id;
  }

  _isPrpTab(tabName: string) {
    return ['reports', 'progress'].indexOf(tabName) > -1;
  }

  _canAccessPdTab(tabName: string) {
    if (this._isPrpTab(tabName)) {
      return this.showPrpReports();
    } else {
      // not prp tab, allow access
      return true;
    }
  }

  _resetRedirectToNewInterventionFlag() {
    if (this._redirectToNewIntervPageInProgress) {
      this._redirectToNewIntervPageInProgress = false;
    }
  }

  _pageChanged() {
    // Using isActiveModule will prevent wrong page import
    if (!this.isActiveModule() || (!this.listActive && !this.tabsActive && !this.newPageActive)) {
      return;
    }

    this.scrollToTopOnCondition(!this.listActive);

    if (this.listActive || this.newPageActive) {
      this.reportsPrevParams = {};
    }
    this._pageChangeDebouncer = Debouncer.debounce(this._pageChangeDebouncer, timeOut.after(10), () => {
      const fileImportDetails = {
        filenamePrefix: 'intervention',
        baseUrl: '../app-elements/interventions/',
        importErrMsg: 'Interventions page import error occurred',
        errMsgPrefixTmpl: '[intervention(s) ##page##]',
        loadingMsgSource: 'interv-page'
      };
      let page;
      if (this.listActive) {
        page = 'list';
      } else if (this.newPageActive) {
        page = 'new';
      } else {
        page = this.routeData.tab;
      }
      this.setActivePage(page, fileImportDetails, this._canAccessPdTab, null, this._resetRedirectToNewInterventionFlag);
    });
  }

  _observeRouteDataId(idStr: string) {
    // Using isActiveModule will prevent PD details/reports/progress request with the wrong id (report id)
    if (!this.isActiveModule() || typeof idStr === 'undefined') {
      return;
    }
    setTimeout(() => {
      let id: number | null = parseInt(idStr, 10);
      if (isNaN(id)) {
        id = null;
      }
      if (this.selectedInterventionId !== id) {
        this.selectedInterventionId = id;
      }
    }, 0);
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
    if (!this._hasEditPermissions(this.permissions)) {
      return;
    }
    this._redirectToNewIntervPageInProgress = true;
    this.selectedInterventionId = null;
    fireEvent(this, 'update-main-path', {path: 'interventions/new'});
    this._handleInterventionSelectionLoadingMsg();
  }

  _visibleTabContent(activePage: string, expectedPage: string, newInterventionActive: boolean) {
    return this._pageEquals(activePage, expectedPage) && !newInterventionActive;
  }

  /**
   * Go to details page once the new intervention has been saved
   */
  _newInterventionSaved(intervention: Intervention) {
    this.route.path = '/' + intervention.id + '/metadata';
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

  _handleTabSelectAction(e: CustomEvent) {
    setTimeout(() => {
      this._showTabChangeLoadingMsg(e, 'interv-page', 'intervention-', 'tabs');
    });
  }

  _handleInterventionSelectionLoadingMsg() {
    setTimeout(() => {
      this._showTabChangeLoadingMsg(null, 'interv-page', 'intervention-', 'tabs');
    });
  }

  /**
   * Loading msg used stamping tabs elements (disabled in each tab main element attached callback)
   */
  _showInterventionPageLoadingMessage() {
    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'interv-page'
    });
  }

  _exportPdBudget() {
    // @ts-ignore TODO-convert EtoolsAjaxRequestMixin to module in order for EndpointsMixin members to be visible
    this._exportPD(this.getEndpoint('interventions').url);
  }

  _exportPdResult() {
    // @ts-ignore
    this._exportPD(this.getEndpoint('resultExports').url);
  }

  _exportPdLocations() {
    // @ts-ignore
    this._exportPD(this.getEndpoint('pdLocationsExport').url);
  }

  _exportPD(url: string) {
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
}
