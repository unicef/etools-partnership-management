import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import CONSTANTS from '../../../config/app-constants';
import {GenericObject, UserPermissions} from '../../../typings/globals.types';
import { Intervention } from '../../../typings/intervention.types';
import EndpointsMixin from '../../endpoints/endpoints-mixin';
import ScrollControl from '../../mixins/scroll-control-mixin';
import ModuleMainElCommonFunctionalityMixin from '../mixins/module-common-mixin';
import ModuleRoutingMixin from '../mixins/module-routing-mixin';
import InterventionPageTabsMixin from './mixins/intervention-page-tabs-mixin';
import InterventionPermissionsMixin from './mixins/intervention-permissions-mixin';
import SaveInterventionMixin from './mixins/save-intervention-mixin';
import '../../layout/page-content-header.js';
import '../../layout/page-content-header-slotted-styles.js';
import '../../layout/etools-error-messages-box.js';
import '../../layout/etools-tabs.js';
import './data/intervention-item-data.js';
import '../agreements/data/agreement-item-data.js';
import './components/intervention-status.js';
import {pageLayoutStyles} from '../../styles/page-layout-styles.js';
import {SharedStyles} from '../../styles/shared-styles.js';
import {buttonsStyles} from '../../styles/buttons-styles.js';
import { pageContentHeaderSlottedStyles } from '../../layout/page-content-header-slotted-styles';
import { isEmptyObject } from '../../utils/utils';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { setInAmendment, setPageDataPermissions } from '../../../actions/page-data';
import { store, RootState } from '../../../store';
import { connect } from 'pwa-helpers/connect-mixin';
import { fireEvent } from '../../utils/fire-custom-event';
import { property } from '@polymer/decorators';
import { Agreement } from '../agreements/agreement.types';
import InterventionItemData from './data/intervention-item-data.js';
import { createDynamicDialog, removeDialog } from 'etools-dialog/dynamic-dialog';

/**
 * @polymer
 * @customElement
 * @appliesMixin DynamicDialogMixin
 * @appliesMixin EnvironmentFlagsMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin ScrollControl
 * @appliesMixin ModuleMainElCommonFunctionalityMixin
 * @appliesMixin ModuleRoutingMixin
 * @appliesMixin InterventionPageTabsMixin
 * @appliesMixin InterventionPermissionsMixin
 * @appliesMixin SaveInterventionMixin
 */
class InterventionsModule extends connect(store)(
  InterventionPermissionsMixin(
      ScrollControl(
        ModuleMainElCommonFunctionalityMixin(
          ModuleRoutingMixin(
            InterventionPageTabsMixin(
              SaveInterventionMixin(
                  EndpointsMixin(PolymerElement)))))))) {

  static get template() {
    return html`
      ${pageLayoutStyles} ${SharedStyles} ${buttonsStyles} ${pageContentHeaderSlottedStyles}
      <style>
        :host {
          display: block;
          min-height: calc(100vh - 120px);
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
          };
        }

        #pdExportMenuBtn paper-item {
          --paper-item-selected: {
            font-weight: normal !important;
          };
          /* Prevent first item highlighted by default */
          --paper-item-focused-before: {
            background: none;
            opacity: 0;
          };
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
          active="{{listActive}}"></app-route>

      <app-route
          route="{{route}}"
          pattern="/:id/:tab"
          active="{{tabsActive}}"
          data="{{routeData}}"></app-route>

      <page-content-header with-tabs-visible="[[tabsActive]]">
        <div slot="page-title">
          <template is="dom-if" if="[[listActive]]">
            PD/SSFAs
          </template>
          <template is="dom-if" if="[[tabsActive]]">
            <span class="no-capitalization" hidden$="[[!newInterventionActive]]">
              Add Programme Document or SSFA
            </span>
            <span hidden$="[[newInterventionActive]]">
              <a class="primary"
                href$="[[rootPath]]partners/[[intervention.partner_id]]/overview"
                target="_blank">[[intervention.partner]]</a>
              <span>: [[intervention.number]]</span>
            </span>
          </template>
        </div>

        <div slot="title-row-actions" class="content-header-actions export-options">

          <div class="action" hidden$="[[!listActive]]">
            <paper-menu-button id="pdExportMenuBtn" close-on-activate>
              <paper-button slot="dropdown-trigger">
                <iron-icon icon="file-download"></iron-icon>
                Export
              </paper-button>
              <paper-listbox slot="dropdown-content">
                <paper-item on-tap="_exportPdBudget">PD Budget Export</paper-item>
                <paper-item on-tap="_exportPdResult">PD Result Export</paper-item>
                <paper-item on-tap="_exportPdLocations">PD Locations Export</paper-item>
              </paper-listbox>
            </paper-menu-button>
          </div>

          <div class="action" hidden$="[[!_showAddNewIntervBtn(listActive, permissions)]]">
            <paper-button class="primary-btn with-prefix" on-tap="_goToNewInterventionPage">
              <iron-icon icon="add"></iron-icon>
              Add new PD/SSFA
            </paper-button>
          </div>
        </div>

        <template is="dom-if" if="[[_showPageTabs(activePage)]]">
          <etools-tabs slot="tabs"
                      tabs="[[interventionTabs]]"
                      active-tab="{{routeData.tab}}"
                      on-iron-select="_handleTabSelectAction"></etools-tabs>
        </template>
      </page-content-header>

      <div id="main">
        <div id="pageContent">

          <etools-error-messages-box id="errorsBox"
                                    title$="[[errorMsgBoxTitle]]"
                                    errors="{{serverErrors}}"></etools-error-messages-box>

          <template is="dom-if" if="[[_pageEquals(activePage, 'list')]]">
            <interventions-list id="list"
                                name="list"
                                active="[[listActive]]"
                                csv-download-qs="{{csvDownloadQs}}"
                                url-params="[[preservedListQueryParams]]">
            </interventions-list>
          </template>

          <template is="dom-if" if="[[_visibleTabContent(activePage, 'overview', newInterventionActive)]]">
            <intervention-overview name="overview"
                                  intervention="[[intervention]]"
                                  intervention-agreement="[[agreement]]">
            </intervention-overview>
          </template>

          <template is="dom-if" if="[[_pageEquals(activePage, 'details')]]">
            <intervention-details id="interventionDetails"
                                  name="details"
                                  intervention="{{intervention}}"
                                  new-intervention="[[newInterventionActive]]"
                                  original-intervention="[[originalIntervention]]"
                                  user-edit-permission="[[_hasEditPermissions(permissions, intervention)]]">
            </intervention-details>
          </template>

          <template is="dom-if" if="[[_pageEquals(activePage, 'review-and-sign')]]">
            <intervention-review-and-sign id="interventionReviewAndSign"
                                          name="review-and-sign"
                                          intervention="{{intervention}}"
                                          original-intervention="[[originalIntervention]]"
                                          agreement="[[agreement]]">
            </intervention-review-and-sign>
          </template>

          <template is="dom-if" if="[[_pageEquals(activePage, 'attachments')]]">
            <intervention-attachments id="intervAttachments"
                                      name="attachments"
                                      active="[[_isAttachementsTabActive(routeData.tab)]]"
                                      intervention-id="[[intervention.id]]"
                                      intervention-status="[[intervention.status]]"
                                      new-intervention="[[newInterventionActive]]">
            </intervention-attachments>
          </template>

          <template is="dom-if" if="[[_visibleTabContent(activePage, 'reports', newInterventionActive)]]" restamp>
            <intervention-reports id="interventionReports"
                                  name="reports"
                                  intervention-id="[[intervention.id]]"
                                  active="[[_pageEquals(activePage, 'reports')]]"
                                  prev-params="{{reportsPrevParams}}"></intervention-reports>
          </template>

          <template is="dom-if" if="[[_visibleTabContent(activePage, 'progress', newInterventionActive)]]" restamp>
            <intervention-progress name="progress"
                                  intervention-id="[[intervention.id]]"></intervention-progress>
          </template>

          <intervention-item-data id="interventionData"
                                  intervention="{{intervention}}"
                                  intervention-id="[[selectedInterventionId]]"
                                  original-intervention="[[originalIntervention]]"
                                  error-event-name="intervention-save-error"></intervention-item-data>

          <agreement-item-data id="agreement"
                              agreement-id="[[intervention.agreement]]"
                              agreement="{{agreement}}"></agreement-item-data>

        </div> <!-- main page content end -->

        <!-- sidebar content start -->
        <template is="dom-if" if="[[_showInterventionSidebarStatus(listActive, tabAttached, activePage)]]">
          <div id="sidebar">
            <intervention-status status="[[intervention.status]]"
                                active="[[!listActive]]"
                                active-tab="[[routeData.tab]]"
                                intervention-id="[[intervention.id]]"
                                new-intervention="[[newInterventionActive]]"
                                intervention-agreement-status="[[agreement.status]]"
                                on-save-intervention="_validateAndSaveIntervention"
                                on-update-intervention-status="_updateInterventionStatus"
                                on-delete-intervention="_deleteIntervention"
                                on-terminate-pd="_terminatePd"
                                edit-mode="[[_hasEditPermissions(permissions, intervention)]]">
            </intervention-status>
          </div> <!-- sidebar content end -->
        </template>

      </div>

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

  @property({type: Boolean, computed: '_updateNewItemPageFlag(routeData, listActive)'})
  newInterventionActive!: boolean;

  @property({type: Boolean})
  editMode!: boolean;

  @property({type: Boolean})
  _redirectToNewIntervPageInProgress!: boolean;

  @property({type: String})
  errorMsgBoxTitle: string = 'Errors Saving PD/SSFA';

  @property({type: Object})
  saved: {
    interventionId: any,
    justSaved: boolean
  } = {
        interventionId: null,
        justSaved: false
      };

  @property({type: Boolean})
  _forceDetUiValidationOnAttach!: boolean;

  @property({type: Boolean})
  _forceReviewUiValidationOnAttach!: boolean;

  @property({type: Object})
  reportsPrevParams!: object;

  @property({type: String})
  moduleName: string = 'interventions';

  // This shouldn't be neccessary, but the Analyzer isn't picking up
  // Polymer.Element#rootPath
  @property({type: String})
  rootPath!: string

  private finalizeAmendmentConfirmationDialog! : PolymerElement & {opened: boolean};
  private _pageChangeDebouncer!: Debouncer;

  static get observers() {
    return [
      '_pageChanged(listActive, tabsActive, routeData)',
      '_observeRouteDataId(routeData.id)',
      '_interventionChanged(intervention, permissions)',
      '_amendmentModeChanged(intervention.in_amendment, tabAttached, listActive)'
    ];
  }

  stateChanged(state: RootState) {
    this.envStateChanged(state);
  }

  ready() {
    super.ready();
    if (this.newInterventionActive) {
      this._setNewInterventionObj();
    }

    this._createFinalizeAmendConfirmDialog();
    this._initInterventionsModuleListeners();
  }

  connectedCallback() {
    super.connectedCallback();
    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'main-page'});
    this._showInterventionPageLoadingMessage();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeFinalizeAmendConfirmDialog();
    this._removeInterventionsModuleListeners();
  }

  _initInterventionsModuleListeners() {
    this._interventionSaveErrors = this._interventionSaveErrors.bind(this);
    this._interventionPageAttached = this._interventionPageAttached.bind(this);
    this._handleInterventionSelectionLoadingMsg = this._handleInterventionSelectionLoadingMsg.bind(this);
    this._refreshInterventionPermissions = this._refreshInterventionPermissions.bind(this);
    this._amendmentAddedHandler = this._amendmentAddedHandler.bind(this);

    this.addEventListener('intervention-save-error', this._interventionSaveErrors as any);
    this.addEventListener('tab-content-attached', this._interventionPageAttached);
    this.addEventListener('trigger-intervention-loading-msg', this._handleInterventionSelectionLoadingMsg);
    this.addEventListener('refresh-intervention-permissions', this._refreshInterventionPermissions as any);
    this.addEventListener('new-amendment-added', this._amendmentAddedHandler as any);
  }

  _removeInterventionsModuleListeners() {
    this.removeEventListener('intervention-save-error', this._interventionSaveErrors as any);
    this.removeEventListener('tab-content-attached', this._interventionPageAttached);
    this.removeEventListener('trigger-intervention-loading-msg', this._handleInterventionSelectionLoadingMsg);
    this.removeEventListener('refresh-intervention-permissions', this._refreshInterventionPermissions as any);
    this.removeEventListener('new-amendment-added', this._amendmentAddedHandler as any);
  }

  _createFinalizeAmendConfirmDialog() {
    this._finalizeAmendmentConfirmationCallback = this._finalizeAmendmentConfirmationCallback.bind(this);
    let dialog = document.createElement('div');
    dialog.setAttribute('id', 'finalizeAmendmentConfirmation');
    dialog.innerHTML = 'All fields in the details tab will now be closed for editing. Do you want to continue?';
    let conf: any = {
      title: 'Finalize Amendment',
      size: 'md',
      okBtnText: 'Yes',
      cancelBtnText: 'Cancel',
      closeCallback: this._finalizeAmendmentConfirmationCallback,
      content: dialog
    };
    this.finalizeAmendmentConfirmationDialog = createDynamicDialog(conf);
  }

  _removeFinalizeAmendConfirmDialog() {
    if (this.finalizeAmendmentConfirmationDialog) {
      this.finalizeAmendmentConfirmationDialog.removeEventListener('close',
          this._finalizeAmendmentConfirmationCallback as any);
      removeDialog(this.finalizeAmendmentConfirmationDialog);
    }
  }

  _showFinalizeAmendmentDialog() {
    if (this.finalizeAmendmentConfirmationDialog) {
      this.finalizeAmendmentConfirmationDialog.opened = true;
    }
  }

  _amendmentModeChanged(amendmentModeActive: boolean, tabAttached: boolean, listActive: boolean) {
    if (typeof amendmentModeActive === 'undefined' || !this.intervention || (!tabAttached && !listActive)) {
      return;
    }
    if (listActive) {
      store.dispatch(setInAmendment(false));
      return;
    }
    if (this.selectedInterventionId === this.intervention.id) {
      store.dispatch(setInAmendment(amendmentModeActive));
    }
  }

  _amendmentAddedHandler(event: CustomEvent) {
    event.stopImmediatePropagation();
    // redirect to the details tab for editing
    this.set('routeData.tab', 'details');
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
      let isNewIntervention = this._redirectToNewIntervPageInProgress || this.newInterventionActive;
      if (isNewIntervention) {
        this.set('intervention.reference_number_year', new Date().getFullYear());
      }
      this.checkAndUpdateInterventionPermissions(intervention,
          this._hasEditPermissions(permissions), isNewIntervention);
      setTimeout(() => {
        // ensure intervention get/save/change status loading msgs close
        fireEvent(this, 'global-loading', {active: false, loadingSource: 'pd-ssfa-data'});
      }, 1000);
    }
  }

  _displayAnyMigrationErrors(intervention: any) {
    if (intervention.metadata && intervention.metadata.error_msg && intervention.metadata.error_msg.length) {
      if (this.saved.interventionId !== intervention.id && !this.saved.justSaved) {
        // Avoid showing msg again after save
        this.set('errorMsgBoxTitle',
            'eTools validation code has been upgraded and this record is now considered invalid due to:');
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

  _pageChanged(listActive: boolean, tabsActive: boolean, routeData: any) {
    // Using isActiveModule will prevent wrong page import
    if (!this.isActiveModule() || (!listActive && !tabsActive)) {
      return;
    }

    this.scrollToTopOnCondition(!listActive);

    if (listActive) {
      this.reportsPrevParams = {};
    }
    this._pageChangeDebouncer = Debouncer.debounce(this._pageChangeDebouncer,
        timeOut.after(10),
        () => {
          let fileImportDetails = {
            filenamePrefix: 'intervention',
            baseUrl: '../app-elements/interventions/',
            importErrMsg: 'Interventions page import error occurred',
            errMsgPrefixTmpl: '[intervention(s) ##page##]',
            loadingMsgSource: 'interv-page'
          };
          this.setActivePage(listActive, routeData.tab, fileImportDetails, this._canAccessPdTab,
              null, this._resetRedirectToNewInterventionFlag);
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
        store.dispatch(setInAmendment(false));
      }
    }, 0);
  }

  _finalizeAmendmentConfirmationCallback(event: CustomEvent) {
    let preparedData: GenericObject = {id: this.intervention.id, in_amendment: false};

    if (event.detail.confirmed) {
      return (this.$.interventionData as InterventionItemData).saveIntervention(preparedData as Intervention,
          this._newInterventionSaved.bind(this))
          .then((successfull: boolean) => {
              if (successfull) {
                  this.set('intervention.in_amendment', false);
                  return true;
              } else {
                  this.set('intervention.in_amendment', true);
                  return false;
              }
          });
    }
  }

  _isNewIntervention() {
    return !this.intervention.id;
  }

  _refreshInterventionPermissions(e: CustomEvent) {
    e.stopImmediatePropagation();
    (this.$.interventionData as InterventionItemData)._reqInterventionDataWithoutRespHandling()
        .then((resp: any) => {
          if (!isEmptyObject(resp.permissions)) {
            this.set('intervention.permissions', resp.permissions);
            this.set('intervention.in_amendment', resp.in_amendment);
            this.set('originalIntervention.in_amendment', resp.in_amendment);
            store.dispatch(setPageDataPermissions(resp.permissions));
          }
        })
        .then(() => {
          this.checkAndUpdatePlannedBudgetPermissions(this.intervention.status);
        });
  }

  _updateInterventionStatus(e: CustomEvent) {
    e.stopImmediatePropagation();
    (this.$.interventionData as InterventionItemData).updateInterventionStatus(e.detail);
  }

  _deleteIntervention(e: CustomEvent) {
    (this.$.interventionData as InterventionItemData).deleteIntervention(e.detail.id);
  }

  _userHasEditPermissions(permissions: UserPermissions) {
    return permissions && permissions.editInterventionDetails === true &&
        (permissions.partnershipManager || permissions.PME);
  }

  _hasEditPermissions(permissions: UserPermissions, intervention?: Intervention) {
    if (permissions && permissions.editInterventionDetails === true) {
      if (intervention) {
        if (!(permissions.partnershipManager || permissions.PME) &&
            (!intervention.status ||
              intervention.status !== CONSTANTS.STATUSES.Draft.toLowerCase())) {
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
    this._setNewInterventionObj();
    this.set('selectedInterventionId', null);
    fireEvent(this, 'update-main-path', {path: 'interventions/new/details'});
    this._handleInterventionSelectionLoadingMsg();
  }

  _setNewInterventionObj() {
    this.set('intervention', new Intervention());
  }

  _visibleTabContent(activePage: string, expectedPage: string,
    newInterventionActive: boolean) {
    return this._pageEquals(activePage, expectedPage) && !newInterventionActive;
  }

  /**
   * Go to details page once the new intervention has been saved
   */
  _newInterventionSaved(intervention: Intervention) {
    this.set('route.path', '/' + intervention.id + '/details');
  }

  _showAddNewIntervBtn(listActive: boolean, permissions: UserPermissions) {
    return (listActive && this._hasEditPermissions(permissions));
  }

  _interventionSaveErrors(event: CustomEvent) {
    event.stopImmediatePropagation();
    if ((event.detail instanceof Array && event.detail.length > 0) ||
        (typeof event.detail === 'string' && event.detail !== '')) {
      fireEvent(this, 'set-server-errors', event.detail);
      this.scrollToTop();
    }
  }

  _isAttachementsTabActive(activeTab: string) {
    return activeTab === 'attachments';
  }

  _handleTabSelectAction(e: CustomEvent) {
    this._showTabChangeLoadingMsg(e, 'interv-page', 'intervention-');
  }

  _interventionPageAttached() {
    // force styles updates according with intervention permissions
    // (event handled is triggered by interventions tab elements)
    this._updateRelatedPermStyles(false, this._forceDetUiValidationOnAttach, this._forceReviewUiValidationOnAttach);
  }

  _showInterventionSidebarStatus(listActive: boolean, tabAttached: boolean,
    activePage: string) {
    return (['reports', 'progress'].indexOf(activePage) > -1)
        ? false
        : this._showSidebarStatus(listActive, tabAttached);
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

  _handleInterventionSelectionLoadingMsg() {
    this._showTabChangeLoadingMsg(null, 'interv-page', 'intervention-', 'details');
  }

  _exportPdBudget() {
    this._exportPD(this.getEndpoint('interventions').url);
  }

  _exportPdResult() {
    this._exportPD(this.getEndpoint('resultExports').url);
  }

  _exportPdLocations() {
    this._exportPD(this.getEndpoint('pdLocationsExport').url);
  }

  _exportPD(url: string) {
    let csvDownloadUrl = url + '?' + this.csvDownloadQs;
    window.open(csvDownloadUrl, '_blank');
  }

}

window.customElements.define('interventions-module', InterventionsModule);

export {InterventionsModule};

