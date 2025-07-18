import {LitElement, html} from 'lit';
import {property, query, customElement, state} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {RootState, store} from '../../../redux/store';

import ScrollControlMixin from '../../common/mixins/scroll-control-mixin-lit';
import ModuleMainElCommonFunctionalityMixin from '../../common/mixins/module-common-mixin-lit';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import ModuleRoutingMixin from '../../common/mixins/module-routing-mixin-lit';
import CONSTANTS from '../../../config/app-constants.js';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

import '../../common/components/etools-error-messages-box';
import '../../common/components/page-content-header';

import {pageContentHeaderSlottedStyles} from '../../styles/page-content-header-slotted-styles-lit';
import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import './data/agreement-item-data.js';
import './pages/components/agreement-status.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AgreementItemDataEl} from './data/agreement-item-data.js';
import {GenericObject, UserPermissions, EtoolsTab, Agreement, AsyncAction} from '@unicef-polymer/etools-types';
import cloneDeep from 'lodash-es/cloneDeep';
import {translate, get as getTranslation, langChanged} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {AgreementDetails} from './pages/details/agreement-details';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import get from 'lodash-es/get';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import pmpEdpoints from '../../endpoints/endpoints';
import {setUnicefRepresentatives} from '../../../redux/actions/agreements';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {UPLOAD_STATUS_KEYS} from '@unicef-polymer/etools-unicef/src/etools-upload/uploads-mixin.js';

/**
 * @LitElement
 * @mixinFunction
 * @appliesMixin ScrollControlMixin
 * @appliesMixin ModuleRoutingMixin
 * @appliesMixin ModuleMainElCommonFunctionalityMixin
 * @appliesMixin EndpointsMixin
 */
const AgreementsModuleRequiredMixins = MatomoMixin(
  ScrollControlMixin(CommonMixin(ModuleRoutingMixin(ModuleMainElCommonFunctionalityMixin(LitElement))))
);

/**
 * @LitElement
 * @customElement
 * @appliesMixin AgreementsModuleRequiredMixins
 */
@customElement('agreements-module')
export class AgreementsModule extends connect(store)(AgreementsModuleRequiredMixins) {
  render() {
    // language=HTML
    return html`
      ${pageLayoutStyles} ${sharedStyles} ${pageContentHeaderSlottedStyles}
      <style>
        :host {
          display: block;
        }
      </style>

      <page-content-header>
        <div slot="page-title">
          ${this.listActive ? html`<span>${translate('AGREEMENTS')}</span>` : ''}
          ${this.tabsActive
            ? html`<span
                >${langChanged(() => this._getAgreementDetailsTitle(this.agreement, this.newAgreementActive))}</span
              >`
            : ''}
        </div>

        <div slot="title-row-actions" class="content-header-actions">
          <div class="action" ?hidden="${!this.listActive}">
            <etools-button
              class="neutral"
              variant="text"
              target="_blank"
              href="${this.csvDownloadUrl}"
              @click="${this.trackAnalytics}"
              tracker="Agreements export"
            >
              <etools-icon name="file-download" slot="prefix"></etools-icon>
              ${translate('EXPORT')}
            </etools-button>
          </div>
          <div class="action" ?hidden="${!this._showNewAgreementAddButton(this.listActive, this.permissions)}">
            <etools-button variant="primary" @click="${this._goToNewAgreementPage}">
              <etools-icon name="add" slot="prefix"></etools-icon>
              ${translate('ADD_NEW_AGREEMENT')}
            </etools-button>
          </div>
        </div>
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
            ?hidden="${!this.listActive}"
            .active="${this.listActive}"
            .csv-download-url="${this.csvDownloadUrl}"
            @csvDownloadUrl-changed=${(e: any) => {
              this.csvDownloadUrl = e.detail;
            }}
          >
          </agreements-list>
          ${this.tabsActive
            ? html` <agreement-details
                id="agreementDetails"
                name="details"
                .agreement="${cloneDeep(this.agreement)}"
                .editMode="${this._hasEditPermissions(this.permissions)}"
                @save-amendment="${this.saveAmendment}"
              >
              </agreement-details>`
            : ``}
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

  originalAgreementData!: Agreement;

  @query('#agreementData')
  agreementDataEl!: AgreementItemDataEl;

  @property({type: Object})
  prevRouteDetails!: any;

  @state() isInitialLoading = true;

  connectedCallback() {
    super.connectedCallback();

    this._initListeners();
    if (this.newAgreementActive) {
      // Useful when refreshing the page
      this.agreement = new Agreement();
    }
    this._getUnicefRepresentatives();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  stateChanged(state: RootState) {
    if (get(state, 'app.routeDetails.routeName') != 'agreements') {
      return;
    }

    if (!state.app?.routeDetails!.subRouteName) {
      EtoolsRouter.replaceAppLocation('/pmp/agreements/list');
    }

    if (this.isInitialLoading) {
      this.isInitialLoading = false;
      this._hideMainLoading();
    }

    const routeDetails = state.app?.routeDetails;
    if (!isJsonStrMatch(this.prevRouteDetails, routeDetails) || this.activePage !== routeDetails!.subRouteName) {
      this.prevRouteDetails = routeDetails;
      this.listActive = routeDetails!.subRouteName == 'list';
      if (this.listActive) {
        // if list is shown, reset details errors
        this.serverErrors = [];
      }
      this.tabsActive = routeDetails!.subRouteName == 'details';
      const currentAgrId = state.app?.routeDetails?.params?.agreementId;
      this.newAgreementActive = currentAgrId === 'new';

      if (currentAgrId && !this.newAgreementActive && isNaN(Number(currentAgrId))) {
        fireEvent(this, '404');
        return;
      }
      this.selectedAgreementId = !currentAgrId || isNaN(Number(currentAgrId)) ? null : Number(currentAgrId);
      this._pageChanged(this.listActive, this.tabsActive, this.newAgreementActive);
    }
  }

  _initListeners() {
    this._agreementSaveErrors = this._agreementSaveErrors.bind(this);
    // this._handleAgreementSelectionLoadingMsg = this._handleAgreementSelectionLoadingMsg.bind(this);

    this.addEventListener('agreement-save-error', this._agreementSaveErrors as EventListenerOrEventListenerObject);
    // this.addEventListener('trigger-agreement-loading-msg', this._handleAgreementSelectionLoadingMsg);
    this._newAgreementSaved = this._newAgreementSaved.bind(this);
  }

  _removeListeners() {
    this.removeEventListener('agreement-save-error', this._agreementSaveErrors as EventListenerOrEventListenerObject);
    // this.removeEventListener('trigger-agreement-loading-msg', this._handleAgreementSelectionLoadingMsg);
  }

  _showNewAgreementAddButton(listActive: boolean, permissions: UserPermissions) {
    return listActive && permissions && permissions.partnershipManager;
  }

  _pageChanged(listActive: boolean, tabsActive: boolean, _newAgreementActive: boolean) {
    if (!listActive && !tabsActive) {
      return;
    }

    this.scrollToTopOnCondition(!listActive);
  }

  // compute agreement details page title including partner name and agreement number
  _getAgreementDetailsTitle(agreement: Agreement, newAgreement: boolean) {
    if (!agreement) {
      return '';
    }
    if (newAgreement) {
      return getTranslation('ADD_AGREEMENT');
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

    return new Promise((resolve) => {
      this.agreementDataEl.saveAgreement(agreementData, this._newAgreementSaved).then((successfull: boolean) => {
        if (successfull) {
          fireEvent(this, 'upload-status-reset', {key: UPLOAD_STATUS_KEYS.UNSAVED});
        }
        resolve(successfull);
      });
    });
  }

  _updateAgreementStatus(e: CustomEvent) {
    e.stopImmediatePropagation();

    this.agreementDataEl.updateAgreementStatus(e.detail);
  }

  // Go to details page once the new agreement has been saved
  _newAgreementSaved(agreement: Agreement) {
    EtoolsRouter.updateAppLocation('agreements/' + agreement.id + '/details');
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
    // this._handleAgreementSelectionLoadingMsg();
  }

  saveAmendment(event: CustomEvent) {
    const agrDataToSave: Partial<Agreement> = {};
    agrDataToSave.id = this.agreement.id;
    agrDataToSave.amendments = event.detail.amendment;
    if (event.detail.ao && event.detail.ao.length > 0) {
      agrDataToSave.authorized_officers = event.detail.ao;
    }
    this._saveAgreement(agrDataToSave).then((response: any) => {
      if (response.id) {
        this.agreement = response;
        this.originalAgreementData = JSON.parse(JSON.stringify(response));
      }
    });
    return true;
  }

  _validateAndTriggerAgreementSave(e: CustomEvent) {
    e.stopImmediatePropagation();
    if (!this.validateAgreement()) {
      return;
    }

    let agrDataToSave: GenericObject;
    const currentAgreement = this.shadowRoot?.querySelector<AgreementDetails>('agreement-details')!.agreement!;
    if (this.newAgreementActive) {
      agrDataToSave = this._prepareNewAgreementDataForSave(currentAgreement);
    } else {
      agrDataToSave = this._getCurrentChanges(currentAgreement);
      agrDataToSave.id = this.agreement.id;
    }
    // sync agreement with the agreement from details page
    this.agreement = {
      ...currentAgreement,
      ...agrDataToSave,
      ...{authorized_officers: currentAgreement.authorized_officers}
    };
    this._saveAgreement(agrDataToSave);
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
        text: getTranslation('PLEASE_FILL_IN_REQUIRED_DATA')
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
      authorized_officers: (agreement.authorized_officers || []).map((item) => item.id) as any[]
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

    if (agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.GTC) {
      newAgreement.country_programme = agreement.country_programme;
    }

    if (agreement.signed_by) {
      newAgreement.signed_by = agreement.signed_by?.id;
    }

    return newAgreement;
  }

  // Get agreement changed properties
  _getCurrentChanges(currentAgreement: Agreement) {
    const changes: GenericObject = {};
    if (!currentAgreement || currentAgreement.id !== this.originalAgreementData.id) {
      // prevent the possibility of checking 2 different agreements
      return {};
    }

    if (this._primitiveFieldIsModified('partner', currentAgreement)) {
      changes.partner = currentAgreement.partner;
    }
    if (this._primitiveFieldIsModified('reference_number_year', currentAgreement)) {
      changes.reference_number_year = currentAgreement.reference_number_year;
    }

    if (this._primitiveFieldIsModified('special_conditions_pca', currentAgreement)) {
      changes.special_conditions_pca = currentAgreement.special_conditions_pca;
    }

    if (currentAgreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.MOU) {
      const currentAuthOfficeIDs = (currentAgreement.authorized_officers || []).map((item: any) => String(item.id));
      if (this._authorizedOfficersChanged(currentAuthOfficeIDs)) {
        changes.authorized_officers = currentAuthOfficeIDs;
      }
    }
    if (currentAgreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.SSFA) {
      const signedByFields = ['partner_manager', 'signed_by_partner_date', 'signed_by_unicef_date', 'attachment'];
      signedByFields.forEach((fieldName: string) => {
        if (this._primitiveFieldIsModified(fieldName, currentAgreement)) {
          changes[fieldName] = currentAgreement[fieldName];
        }
      });
    }

    if (currentAgreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.MOU) {
      ['start', 'end'].forEach((fieldName: string) => {
        if (this._primitiveFieldIsModified(fieldName, currentAgreement)) {
          changes[fieldName] = currentAgreement[fieldName];
        }
      });
    }

    if (currentAgreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.PCA) {
      if (this._primitiveFieldIsModified('country_programme', currentAgreement)) {
        changes.country_programme = currentAgreement.country_programme;
      }

      // if (this._objectFieldIsModified('amendments', currentAgreement)) {
      //   // keep only new amendments
      //   if (currentAgreement.amendments) {
      //     changes.amendments = currentAgreement.amendments.filter(
      //       (a: AgreementAmendment) =>
      //         !a.id && typeof a.signed_amendment_attachment === 'number' && a.signed_amendment_attachment > 0
      //     );
      //   }
      // }
    }

    if (currentAgreement.signed_by) {
      if (String(currentAgreement.signed_by?.id) !== String(this.originalAgreementData.signed_by?.id)) {
        changes.signed_by = currentAgreement.signed_by?.id;
      }
    }

    return changes;
  }

  _primitiveFieldIsModified(fieldName: string, currentAgreement: Agreement) {
    return this.originalAgreementData[fieldName] !== currentAgreement[fieldName];
  }

  _authorizedOfficersChanged(currentAuthorizedOfficers: string[]) {
    const initialAuthOfficers = this._getInitialAuthorizedOfficersIds();
    return JSON.stringify(initialAuthOfficers) !== JSON.stringify(currentAuthorizedOfficers);
  }

  _objectFieldIsModified(fieldName: string, currentAgreement: Agreement) {
    return JSON.stringify(this.originalAgreementData[fieldName]) !== JSON.stringify(currentAgreement[fieldName]);
  }

  _getInitialAuthorizedOfficersIds() {
    if (!this.originalAgreementData.authorized_officers) {
      return [];
    }
    return this.originalAgreementData.authorized_officers.map(function (off: any) {
      return off.id.toString();
    });
  }

  // _handleAgreementSelectionLoadingMsg() {
  //   this._showTabChangeLoadingMsg(null, 'ag-page', 'agreement-', 'details');
  // }

  // Loading msg used on stamping tabs elements (disabled in each tab main element attached callback)
  _hideMainLoading() {
    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'main-page'
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
      this._agreementChanged(e.detail);
      this.requestUpdate();
    }
  }

  _agreementChanged(agreement: Agreement) {
    // keep a copy of the agreement before changes are made and use it later to save only the changes
    this.originalAgreementData = JSON.parse(JSON.stringify(agreement));
    fireEvent(this, 'clear-server-errors');
  }

  _getUnicefRepresentatives() {
    sendRequest({
      endpoint: pmpEdpoints.unicefRepresentatives
    }).then((res: any) => {
      getStore().dispatch<AsyncAction>(setUnicefRepresentatives(res || []));
    });
  }

  onErrorsChanged(e: CustomEvent) {
    this.serverErrors = e.detail.value;
  }
}
