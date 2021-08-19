/* eslint-disable lit-a11y/anchor-is-valid */
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import CONSTANTS from '../../../config/app-constants';
import EndpointsMixin from '../../endpoints/endpoints-mixin';
import ScrollControlMixin from '../../mixins/scroll-control-mixin';
import ModuleMainElCommonFunctionalityMixin from '../mixins/module-common-mixin';
import ModuleRoutingMixin from '../mixins/module-routing-mixin';
import '../../layout/page-content-header.js';
import '../../layout/page-content-header-slotted-styles.js';
import '../../layout/etools-error-messages-box.js';
import '../../layout/etools-tabs.js';
import './data/intervention-item-data.js';
import '../agreements/data/agreement-item-data.js';
import {pageLayoutStyles} from '../../styles/page-layout-styles';
import {SharedStyles} from '../../styles/shared-styles';
import {buttonsStyles} from '../../styles/buttons-styles';
import {pageContentHeaderSlottedStyles} from '../../layout/page-content-header-slotted-styles';
import {isEmptyObject, isJsonStrMatch} from '../../utils/utils';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {store, RootState} from '../../../store';
import {connect} from 'pwa-helpers/connect-mixin';
import {fireEvent} from '../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import InterventionItemData from './data/intervention-item-data.js';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import './pages/intervention-tab-pages/intervention-tabs';
import get from 'lodash-es/get';
import {Agreement, Intervention, UserPermissions, GenericObject} from '@unicef-polymer/etools-types';
import CommonMixin from '../../mixins/common-mixin';
import EnvironmentFlagsPolymerMixin from '../../environment-flags/environment-flags-mixin';
import {setStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
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
class InterventionsModule extends connect(store)(
  ScrollControlMixin(
    ModuleMainElCommonFunctionalityMixin(
      ModuleRoutingMixin(CommonMixin(EnvironmentFlagsPolymerMixin(EndpointsMixin(PolymerElement))))
    )
  )
) {
  static get template() {
    return html`
      ${pageLayoutStyles} ${SharedStyles} ${buttonsStyles} ${pageContentHeaderSlottedStyles}
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
        route="{{route}}"
        pattern="/list"
        query-params="{{listPageQueryParams}}"
        active="{{listActive}}"
      ></app-route>

      <app-route route="{{route}}" pattern="/new" active="{{newPageActive}}"></app-route>
      <app-route
        route="{{route}}"
        pattern="/:id/:tab"
        active="{{tabsActive}}"
        data="{{routeData}}"
        tail="{{subroute}}"
      ></app-route>
      <app-route route="{{subroute}}" pattern="/:subtab" active="[[tabsActive]]" data="{{subRouteData}}"></app-route>

      <div hidden="[[showNewPMP(activePage)]]">
        <page-content-header with-tabs-visible="[[tabsActive]]">
          <div slot="page-title">
            <template is="dom-if" if="[[listActive]]"> PD/SPDs </template>
            <template is="dom-if" if="[[newPageActive]]">
              <span class="no-capitalization">[[_getTranslation('INTERVENTIONS_LIST.ADD_PROGRAMME_DOCUMENT')]]</span>
            </template>
            <template is="dom-if" if="[[tabsActive]]">
              <span>
                <a class="primary" href$="[[rootPath]]partners/[[intervention.partner_id]]/overview" target="_blank"
                  >[[intervention.partner]]</a
                >
                <span>: [[intervention.number]]</span>
              </span>
            </template>
          </div>

          <div slot="title-row-actions" class="content-header-actions export-options">
            <div class="action" hidden$="[[!listActive]]">
              <paper-menu-button id="pdExportMenuBtn" close-on-activate>
                <paper-button slot="dropdown-trigger">
                  <iron-icon icon="file-download"></iron-icon>
                  [[_getTranslation('EXPORT')]]
                </paper-button>
                <paper-listbox slot="dropdown-content">
                  <paper-item on-tap="_exportPdBudget"
                    >[[_getTranslation('INTERVENTIONS_LIST.PD_BUDGET_EXPORT')]]</paper-item
                  >
                  <paper-item on-tap="_exportPdResult"
                    >[[_getTranslation('INTERVENTIONS_LIST.PD_RESULT_EXPORT')]]</paper-item
                  >
                  <paper-item on-tap="_exportPdLocations"
                    >[[_getTranslation('INTERVENTIONS_LIST.PD_LOCATIONS_EXPORT')]]</paper-item
                  >
                </paper-listbox>
              </paper-menu-button>
            </div>

            <div class="action" hidden$="[[!_showAddNewIntervBtn(listActive, permissions)]]">
              <paper-button class="primary-btn with-prefix" on-tap="_goToNewInterventionPage">
                <iron-icon icon="add"></iron-icon>
                [[_getTranslation('INTERVENTIONS_LIST.ADD_NEW_PD')]]
              </paper-button>
            </div>
          </div>
        </page-content-header>

        <div id="main">
          <div id="pageContent">
            <etools-error-messages-box
              id="errorsBox"
              title$="[[errorMsgBoxTitle]]"
              errors="{{serverErrors}}"
            ></etools-error-messages-box>

            <template is="dom-if" if="[[_pageEquals(activePage, 'list')]]">
              <interventions-list
                id="list"
                name="list"
                active="[[listActive]]"
                csv-download-qs="{{csvDownloadQs}}"
                url-params="[[preservedListQueryParams]]"
              >
              </interventions-list>
            </template>

            <template is="dom-if" if="[[_pageEquals(activePage, 'new')]]" restamp>
              <intervention-new on-create-intervention="onCreateIntervention"></intervention-new>
            </template>
          </div>

          <intervention-item-data
            id="interventionData"
            intervention="{{intervention}}"
            intervention-id="[[selectedInterventionId]]"
            original-intervention="[[originalIntervention]]"
            error-event-name="intervention-save-error"
          ></intervention-item-data>

          <!-- main page content end -->
        </div>
      </div>
      <intervention-tabs hidden="[[!showNewPMP(activePage)]]"></intervention-tabs>
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

  @property({type: Object, notify: true})
  intervention!: Intervention;

  @property({type: Object})
  originalIntervention!: Intervention;

  @property({type: Object})
  agreement!: Agreement;

  @property({type: String})
  csvDownloadQs!: string;

  @property({
    type: Boolean,
    computed: '_updateNewItemPageFlag(routeData, listActive)'
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

  static get observers() {
    return ['_pageChanged(listActive, tabsActive, newPageActive, routeData)', '_observeRouteDataId(routeData.id)'];
  }

  stateChanged(state: RootState) {
    this.envStateChanged(state);

    if (!this.intervention || get(this, 'intervention.id') !== get(state, 'interventions.current.id')) {
      this.intervention = get(state, 'interventions.current');
    } else {
      const currentPD = get(state, 'interventions.current');
      if (!isJsonStrMatch(this.intervention, currentPD)) {
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

  ready() {
    super.ready();
    if (this.newInterventionActive) {
      // @ts-ignore
      this._setNewInterventionObj();
    }

    this._initInterventionsModuleListeners();
  }

  connectedCallback() {
    super.connectedCallback();
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
  }

  _removeInterventionsModuleListeners() {
    this.removeEventListener('intervention-save-error', this._interventionSaveErrors as any);
    this.removeEventListener('trigger-intervention-loading-msg', this._handleInterventionSelectionLoadingMsg);
  }

  _interventionChanged(intervention: Intervention, permissions: UserPermissions) {
    if (typeof intervention === 'undefined' || typeof permissions === 'undefined') {
      return;
    }
    this._displayAnyMigrationErrors(intervention);
    this._makeSureMigrationErrorIsNotShownAgainAfterSave(intervention);

    this.set('originalIntervention', JSON.parse(JSON.stringify(intervention)));
    if (!isEmptyObject(intervention)) {
      // set edit permissions
      const isNewIntervention = this._redirectToNewIntervPageInProgress || this.newInterventionActive;
      if (isNewIntervention) {
        this.set('intervention.reference_number_year', new Date().getFullYear());
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

  _displayAnyMigrationErrors(intervention: any) {
    if (intervention.metadata && intervention.metadata.error_msg && intervention.metadata.error_msg.length) {
      if (this.saved.interventionId !== intervention.id && !this.saved.justSaved) {
        // Avoid showing msg again after save
        this.set(
          'errorMsgBoxTitle',
          'eTools validation code has been upgraded and this record is now considered invalid due to:'
        );
        fireEvent(this, 'set-server-errors', intervention.metadata.error_msg);
      }
    }
  }

  /* Show metadata error message on intervention detail 'page load'*/
  _makeSureMigrationErrorIsNotShownAgainAfterSave(intervention: Intervention) {
    if (this.saved.interventionId !== intervention.id) {
      this.saved.justSaved = false;
    }
    this.saved.interventionId = intervention.id;
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
      this.set('_redirectToNewIntervPageInProgress', false);
    }
  }

  _pageChanged(listActive: boolean, tabsActive: boolean, newPageActive: boolean, routeData: any) {
    // Using isActiveModule will prevent wrong page import
    if (!this.isActiveModule() || (!listActive && !tabsActive && !newPageActive)) {
      return;
    }

    this.scrollToTopOnCondition(!listActive);

    if (listActive || newPageActive) {
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
      if (listActive) {
        page = 'list';
      } else if (newPageActive) {
        page = 'new';
      } else {
        page = routeData.tab;
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
        this.set('selectedInterventionId', id);
      }
    }, 0);
  }

  updateDexieData(intervention: Intervention) {
    (this.$.interventionData as InterventionItemData).updateInterventionsListInDexieDb(intervention);
  }

  _isNewIntervention() {
    return !this.intervention.id;
  }

  _deleteIntervention(e: CustomEvent) {
    (this.$.interventionData as InterventionItemData).deleteIntervention(e.detail.id);
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
    this.set('_redirectToNewIntervPageInProgress', true);
    this.set('selectedInterventionId', null);
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
    this.set('route.path', '/' + intervention.id + '/metadata');
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
    const csvDownloadUrl = url + '?' + this.csvDownloadQs;
    window.open(csvDownloadUrl, '_blank');
  }

  onCreateIntervention({detail}: CustomEvent) {
    const intervention = this.cleanUpBeforeSave(detail.intervention);
    (this.$.interventionData as InterventionItemData)
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
}

window.customElements.define('interventions-module', InterventionsModule);

export {InterventionsModule};
