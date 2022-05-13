import {LitElement, html, property, query, customElement, PropertyValues} from 'lit-element';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-icon/iron-icon';
import '@polymer/app-route/app-route.js';
import '@polymer/paper-button/paper-button.js';
import {store} from '../../../redux/store';

import ScrollControlMixin from '../../common/mixins/scroll-control-mixin-lit';
import ModuleMainElCommonFunctionalityMixin from '../../common/mixins/module-common-mixin-lit';
import CommonMixinLit from '../../common/mixins/common-mixin-lit';
import ModuleRoutingMixin from '../../common/mixins/module-routing-mixin-lit';
import CONSTANTS from '../../../config/app-constants.js';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

import '../../common/components/etools-tabs';
import '../../common/components/etools-error-messages-box';
import '../../common/components/page-content-header';

import {pageContentHeaderSlottedStyles} from '../../styles/page-content-header-slotted-styles-lit';
import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {buttonsStyles} from '../../styles/buttons-styles-lit';
import {RESET_UNSAVED_UPLOADS} from '../../../redux/actions/upload-status';
import './data/agreement-item-data.js';
import './pages/components/agreement-status.js';
import {fireEvent} from '../../utils/fire-custom-event';
import {AgreementItemDataEl} from './data/agreement-item-data.js';
import {GenericObject, UserPermissions, EtoolsTab, Agreement, AgreementAmendment} from '@unicef-polymer/etools-types';
import set from 'lodash-es/set';
import cloneDeep from 'lodash-es/cloneDeep';
import {translate, get as getTranslation} from 'lit-translate';
import {areEqual, isJsonStrMatch} from '../../utils/utils';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin ScrollControlMixin
 * @appliesMixin ModuleRoutingMixin
 * @appliesMixin ModuleMainElCommonFunctionalityMixin
 * @appliesMixin EndpointsMixin
 */
const AgreementsModuleRequiredMixins = MatomoMixin(
  ScrollControlMixin(CommonMixinLit(ModuleRoutingMixin(ModuleMainElCommonFunctionalityMixin(LitElement))))
);

/**
 * @polymer
 * @customElement
 * @appliesMixin AgreementsModuleRequiredMixins
 */
@customElement('agreements-module')
export class AgreementsModule extends AgreementsModuleRequiredMixins {
  render() {
    // language=HTML
    return html`
      ${pageLayoutStyles} ${sharedStyles} ${buttonsStyles} ${pageContentHeaderSlottedStyles}
      <style>
        :host {
          display: block;
        }
      </style>

      <app-route
        .route="${this.route}"
        @route-changed="${({detail}: CustomEvent) => {
          // Sometimes only __queryParams get changed
          // In this case  detail will contain detail.path = 'route._queryParams'
          // and value will contain only the value for this.route._queryParams and not the entire route object
          if (detail.path) {
            set(this, detail.path, detail.value);
            this.route = {...this.route};
          } else {
            this.route = detail.value;
          }
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
        }}"
      ></app-route>

      <app-route
        .route="${this.route}"
        @route-changed="${({detail}: CustomEvent) => {
          // Sometimes only __queryParams get changed
          // In this case  detail will contain detail.path = 'route._queryParams'
          // and value will contain only the value for this.route._queryParams and not the entire route object
          if (detail.path) {
            set(this, detail.path, detail.value);
            this.route = {...this.route};
          } else {
            this.route = detail.value;
          }
        }}"
        @data-changed="${({detail}: CustomEvent) => {
          this.routeData = detail.value;
        }}"
        pattern="/:id/:details"
        .active="${this.tabsActive}"
        @active-changed="${({detail}: CustomEvent) => {
          this.tabsActive = detail.value;
        }}"
      ></app-route>

      <page-content-header ?with-tabs-visible="${this._showPageTabs(this.activePage)}">
        <div slot="page-title">
          ${this.listActive ? html`<span>${translate('AGREEMENTS')}</span>` : ''}
          ${this.tabsActive
            ? html`<span>${this._getAgreementDetailsTitle(this.agreement, this.newAgreementActive)}</span>`
            : ''}
        </div>

        <div slot="title-row-actions" class="content-header-actions">
          <div class="action" ?hidden="${!this.listActive}">
            <a target="_blank" href="${this.csvDownloadUrl}" @tap="${this.trackAnalytics}" tracker="Agreements export">
              <paper-button>
                <iron-icon icon="file-download"></iron-icon>
                ${translate('EXPORT')}
              </paper-button>
            </a>
          </div>
          <div class="action" ?hidden="${!this._showNewAgreementAddButton(this.listActive, this.permissions)}">
            <paper-button class="primary-btn with-prefix" @click="${this._goToNewAgreementPage}">
              <iron-icon icon="add"></iron-icon>
              ${translate('ADD_NEW_AGREEMENT')}
            </paper-button>
          </div>
        </div>

        ${this._showPageTabs(this.activePage)
          ? html` <etools-tabs
              slot="tabs"
              .tabs="${this.agreementsTabs}"
              active-tab="details"
              @iron-select="${this._handleTabSelectAction}"
            >
            </etools-tabs>`
          : ''}
      </page-content-header>

      <div id="main">
        <div id="pageContent">
          <etools-error-messages-box
            id="errorsBox"
            title="Errors Saving Agreement"
            .errors="${this.serverErrors}"
            @errors-changed="${this.onErrorsChanged}"
          ></etools-error-messages-box>

          <agreements-list
            id="list"
            name="list"
            ?hidden="${!this._pageEquals(this.activePage, 'list')}"
            .active="${this.listActive}"
            .csv-download-url="${this.csvDownloadUrl}"
            @csvDownloadUrl-changed=${(e: any) => {
              this.csvDownloadUrl = e.detail;
            }}
            .url-params="${this.preservedListQueryParams}"
          >
          </agreements-list>

          <agreement-details
            id="agreementDetails"
            name="details"
            ?hidden="${!this._pageEquals(this.activePage, 'details')}"
            .agreement="${this.agreement}"
            @authorized-officers-changed="${(e: CustomEvent) => {
              if (!areEqual(this.authorizedOfficers, e.detail)) {
                this.authorizedOfficers = e.detail;
              }
            }}"
            .editMode="${this._hasEditPermissions(this.permissions)}"
            .isNewAgreement="${this.newAgreementActive}"
            @save-agreement="${this._validateAndTriggerAgreementSave}"
          >
          </agreement-details>
        </div>
        <!-- page content end -->

        ${this._showSidebarStatus(this.listActive, this.tabAttached, this.agreement)
          ? html` <!-- sidebar content start -->
              <div id="sidebar">
                <agreement-status
                  .status="${this.agreement?.status}"
                  .active="${!this.listActive}"
                  .newAgreement="${this.newAgreementActive}"
                  .agreementId="${this.agreement?.id}"
                  .agreementType="${this.agreement?.agreement_type}"
                  @save-agreement="${this._validateAndTriggerAgreementSave}"
                  .editMode="${this._hasEditPermissions(this.permissions)}"
                  @terminate-agreement="${this._terminateAgreementNow}"
                  @update-agreement-status="${this._updateAgreementStatus}"
                  @delete-agreement="${this._deleteAgreement}"
                >
                </agreement-status>
              </div>
              <!-- sidebar content end -->`
          : ''}
      </div>
      <!-- main page content end -->

      <agreement-item-data
        id="agreementData"
        @agreement-changed="${this.onAgreementChanged}"
        .agreementId="${this.selectedAgreementId}"
        errorEventName="agreement-save-error"
      >
      </agreement-item-data>
    `;
  }

  @property({type: Array})
  agreementsTabs: EtoolsTab[] = [
    {
      tab: 'details',
      tabLabel: getTranslation('AGREEMENT_DETAILS'),
      hidden: false
    }
  ];

  @property({type: Object})
  permissions!: UserPermissions;

  @property({type: Number})
  selectedAgreementId!: number | null;

  @property({type: String})
  csvDownloadUrl!: string;

  private _newAgreementActive!: boolean;
  @property({type: Boolean})
  get newAgreementActive() {
    return this._newAgreementActive;
  }

  set newAgreementActive(newAgreementActive: boolean) {
    if (this.newAgreementActive !== newAgreementActive) {
      // Useful when refreshing the page
      this._newAgreementActive = newAgreementActive;
      if (this.newAgreementActive) {
        this.agreement = new Agreement();
      }
    }
  }

  @property({type: Object})
  agreement!: Agreement;

  @property({type: String})
  moduleName = 'agreements';

  @property({type: Array})
  authorizedOfficers!: [];

  originalAgreementData!: Agreement;

  @query('#agreementData')
  agreementDataEl!: AgreementItemDataEl;

  connectedCallback() {
    super.connectedCallback();
    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'main-page'
    });

    this._initListeners();
    if (this.newAgreementActive) {
      // Useful when refreshing the page
      this.agreement = new Agreement();
    }
    // fire agreement page loading message
    this._showAgreementsPageLoadingMessage();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  _initListeners() {
    this._agreementSaveErrors = this._agreementSaveErrors.bind(this);
    this._handleAgreementSelectionLoadingMsg = this._handleAgreementSelectionLoadingMsg.bind(this);

    this.addEventListener('agreement-save-error', this._agreementSaveErrors as EventListenerOrEventListenerObject);
    this.addEventListener('trigger-agreement-loading-msg', this._handleAgreementSelectionLoadingMsg);
    this._newAgreementSaved = this._newAgreementSaved.bind(this);
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('agreement')) {
      this._agreementChanged(this.agreement);
    }
    if (changedProperties.has('routeData')) {
      this._observeRouteDataId(this.routeData.id);
    }
    if (changedProperties.has('routeData') || changedProperties.has('listActive')) {
      this.newAgreementActive = this._updateNewItemPageFlag();
    }
    if (
      changedProperties.has('listActive') ||
      changedProperties.has('tabsActive') ||
      changedProperties.has('newAgreementActive')
    ) {
      this._pageChanged(this.listActive, this.tabsActive, this.newAgreementActive);
    }
  }

  _removeListeners() {
    this.removeEventListener('agreement-save-error', this._agreementSaveErrors as EventListenerOrEventListenerObject);
    this.removeEventListener('trigger-agreement-loading-msg', this._handleAgreementSelectionLoadingMsg);
  }

  _showNewAgreementAddButton(listActive: boolean, permissions: UserPermissions) {
    return listActive && permissions && permissions.partnershipManager;
  }

  _pageChanged(listActive: boolean, tabsActive: boolean, _newAgreementActive: boolean) {
    if (!listActive && !tabsActive) {
      return;
    }

    this.scrollToTopOnCondition(!listActive);

    const fileImportDetails = {
      filenamePrefix: 'agreement',
      importErrMsg: 'Agreements page import error occurred',
      errMsgPrefixTmpl: '[agreement(s) ##page##]',
      loadingMsgSource: 'ag-page'
    };
    const page: string = listActive ? 'list' : 'details';
    this.setActivePage(page, fileImportDetails);
  }

  // compute agreement details page title including partner name and agreement number
  _getAgreementDetailsTitle(agreement: Agreement, newAgreement: boolean) {
    if (!agreement) {
      return '';
    }
    if (newAgreement) {
      return 'Add Agreement';
    }
    return agreement.id ? agreement.partner_name + ': ' + agreement.agreement_number : '';
  }

  _hasEditPermissions(permissions: UserPermissions) {
    return permissions && permissions.editAgreementDetails === true;
  }

  _saveAgreement(agreementData: GenericObject) {
    if (!agreementData.id) {
      agreementData.status = CONSTANTS.STATUSES.Draft.toLowerCase();
    }

    this.agreementDataEl.saveAgreement(agreementData, this._newAgreementSaved).then((successfull: boolean) => {
      if (successfull) {
        store.dispatch({type: RESET_UNSAVED_UPLOADS});
      }
    });
  }

  _updateAgreementStatus(e: CustomEvent) {
    e.stopImmediatePropagation();

    this.agreementDataEl.updateAgreementStatus(e.detail);
  }

  // Go to details page once the new agreement has been saved
  _newAgreementSaved(agreement: Agreement) {
    fireEvent(this, 'update-main-path', {
      path: 'agreements/' + agreement.id + '/details'
    });
  }

  _agreementSaveErrors(e: CustomEvent) {
    e.stopImmediatePropagation();
    if ((e.detail instanceof Array && e.detail.length > 0) || (typeof e.detail === 'string' && e.detail !== '')) {
      fireEvent(this, 'set-server-errors', e.detail as any);
      this.scrollToTop();
    }
  }

  /**
   * Go to new agreement page, it's just tha same details page with an empty agreement
   * The new agreement model is defined in this element
   */
  _goToNewAgreementPage() {
    // go to new agreement
    this.agreement = new Agreement();
    fireEvent(this, 'update-main-path', {path: 'agreements/new/details'});
    this._handleAgreementSelectionLoadingMsg();
  }

  _observeRouteDataId(idStr: string) {
    if (typeof idStr === 'undefined') {
      return;
    }
    let id: number | null = parseInt(idStr, 10);
    if (isNaN(id)) {
      id = null;
    }
    this.selectedAgreementId = id;
  }

  _agreementChanged(agreement: Agreement) {
    // keep a copy of the agreement before changes are made and use it later to save only the changes
    this.originalAgreementData = JSON.parse(JSON.stringify(agreement));
    fireEvent(this, 'clear-server-errors');
  }

  _validateAndTriggerAgreementSave(e: CustomEvent) {
    e.stopImmediatePropagation();
    if (!this.validateAgreement()) {
      return false;
    }

    let agrDataToSave: GenericObject;
    if (this.newAgreementActive) {
      agrDataToSave = this._prepareNewAgreementDataForSave(this.agreement);
    } else {
      agrDataToSave = this._getCurrentChanges();
      agrDataToSave.id = this.agreement.id; // we need the id
    }

    this._saveAgreement(agrDataToSave);
    return true;
  }

  validateAgreement() {
    if (!this._hasEditPermissions(this.permissions)) {
      return false;
    }
    const agreementDetailsEl = this.shadowRoot!.querySelector('#agreementDetails') as any;
    if (!agreementDetailsEl) {
      return false;
    }
    if (!agreementDetailsEl._validateAgreement()) {
      fireEvent(this, 'toast', {
        text: this._getTranslation('DOCUMENT_CAN_NOT_BE_SAVED_BECAUSE_OF_MISSING_DATA_IN_DETAILS_TAB'),
        showCloseBtn: true
      });
      return false;
    }
    return true;
  }

  _prepareNewAgreementDataForSave(agreement: Agreement): Partial<Agreement> {
    let newAgreement: Partial<Agreement> = {
      id: null,
      status: '',
      agreement_type: agreement.agreement_type,
      partner: agreement.partner,
      reference_number_year: agreement.reference_number_year,
      authorized_officers: this.authorizedOfficers
    };

    if (agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.SSFA) {
      return newAgreement; // SSFA has only the fields set above
    } else {
      if (agreement.attachment) {
        newAgreement.attachment = agreement.attachment;
      }
    }

    newAgreement = Object.assign(newAgreement, {
      signed_by_unicef_date: agreement.signed_by_unicef_date,
      signed_by_partner_date: agreement.signed_by_partner_date,
      partner_manager: agreement.partner_manager
    });

    if (agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.MOU) {
      newAgreement.start = agreement.start;
      newAgreement.end = agreement.end;
      delete newAgreement.authorized_officers;
    }

    if (agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.PCA) {
      newAgreement.country_programme = agreement.country_programme;
      newAgreement.special_conditions_pca = agreement.special_conditions_pca;
    }
    return newAgreement;
  }

  // Get agreement changed properties
  _getCurrentChanges() {
    const changes: GenericObject = {};
    if (!this.agreement || this.agreement.id !== this.originalAgreementData.id) {
      // prevent the possibility of checking 2 different agreements
      return {};
    }

    if (this._primitiveFieldIsModified('partner')) {
      changes.partner = this.agreement.partner;
    }
    if (this._primitiveFieldIsModified('reference_number_year')) {
      changes.reference_number_year = this.agreement.reference_number_year;
    }

    if (this._primitiveFieldIsModified('special_conditions_pca')) {
      changes.special_conditions_pca = this.agreement.special_conditions_pca;
    }

    if (this.agreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.MOU) {
      if (this._authorizedOfficersChanged()) {
        changes.authorized_officers = this.authorizedOfficers;
      }
    }
    if (this.agreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.SSFA) {
      const signedByFields = ['partner_manager', 'signed_by_partner_date', 'signed_by_unicef_date', 'attachment'];
      signedByFields.forEach((fieldName: string) => {
        if (this._primitiveFieldIsModified(fieldName)) {
          changes[fieldName] = this.agreement[fieldName];
        }
      });
    }

    if (this.agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.MOU) {
      ['start', 'end'].forEach((fieldName: string) => {
        if (this._primitiveFieldIsModified(fieldName)) {
          changes[fieldName] = this.agreement[fieldName];
        }
      });
    }

    if (this.agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.PCA) {
      if (this._primitiveFieldIsModified('country_programme')) {
        changes.country_programme = this.agreement.country_programme;
      }
      if (this._objectFieldIsModified('amendments')) {
        // keep only new amendments
        if (this.agreement.amendments) {
          changes.amendments = this.agreement.amendments.filter(
            (a: AgreementAmendment) =>
              !a.id && typeof a.signed_amendment_attachment === 'number' && a.signed_amendment_attachment > 0
          );
        }
      }
    }

    return changes;
  }

  _primitiveFieldIsModified(fieldName: string) {
    return this.originalAgreementData[fieldName] !== this.agreement[fieldName];
  }

  _authorizedOfficersChanged() {
    const initialAuthOfficers = this._getInitialAuthorizedOfficersIds();
    return JSON.stringify(initialAuthOfficers) !== JSON.stringify(this.authorizedOfficers);
  }

  _objectFieldIsModified(fieldName: string) {
    return JSON.stringify(this.originalAgreementData[fieldName]) !== JSON.stringify(this.agreement[fieldName]);
  }

  _getInitialAuthorizedOfficersIds() {
    if (!this.originalAgreementData.authorized_officers) {
      return null;
    }
    return this.originalAgreementData.authorized_officers.map(function (off: any) {
      return off.id.toString();
    });
  }

  _handleTabSelectAction(e: CustomEvent) {
    this._showTabChangeLoadingMsg(e, 'ag-page', 'agreement-');
  }

  _handleAgreementSelectionLoadingMsg() {
    this._showTabChangeLoadingMsg(null, 'ag-page', 'agreement-', 'details');
  }

  // Loading msg used on stamping tabs elements (disabled in each tab main element attached callback)
  _showAgreementsPageLoadingMessage() {
    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'ag-page'
    });
  }

  _deleteAgreement(e: CustomEvent) {
    this.agreementDataEl.deleteAgreement(e.detail.id);
  }

  _terminateAgreementNow(e: CustomEvent) {
    e.stopImmediatePropagation();
    const terminationData = {
      agreementId: e.detail.agreementId,
      termination_doc: e.detail.terminationData.fileId,
      status: e.detail.status
    };
    this.agreementDataEl.updateAgreementStatus(terminationData);
  }

  onAgreementChanged(e: CustomEvent) {
    if (!isJsonStrMatch(this.agreement, e.detail)) {
      this.agreement = cloneDeep(e.detail);
    }
  }

  onErrorsChanged(e: CustomEvent) {
    this.serverErrors = e.detail.value;
  }
}
