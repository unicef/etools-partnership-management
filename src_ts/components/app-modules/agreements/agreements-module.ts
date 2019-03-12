import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-icon/iron-icon';
import '@polymer/app-route/app-route.js';
import '@polymer/paper-button/paper-button.js';
import {store} from '../../../store.js';
import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import AjaxErrorsParserMixin from '../../mixins/ajax-errors-parser-mixin.js';
import ScrollControl from '../../mixins/scroll-control-mixin.js';
import ModuleMainElCommonFunctionalityMixin from '../mixins/module-common-mixin.js';
import EndpointsMixin from '../../endpoints/endpoints-mixin.js';
import CONSTANTS from '../../../config/app-constants.js';
import ModuleRoutingMixin from '../mixins/module-routing-mixin.js';

import {UserPermissions} from '../../../typings/globals.types';
import {Agreement, AgreementAmendment} from './agreement.types.js';
import '../../layout/etools-tabs';
import '../../layout/etools-error-messages-box.js'
import '../../layout/page-content-header';
import {pageContentHeaderSlottedStyles} from '../../layout/page-content-header-slotted-styles';
import {pageLayoutStyles} from '../../styles/page-layout-styles'
import {SharedStyles} from '../../styles/shared-styles';
import {buttonsStyles} from '../../styles/buttons-styles';
import { RESET_UNSAVED_UPLOADS } from '../../../actions/upload-status.js';
import './data/agreement-item-data.js';
import './pages/components/agreement-status.js';
import { fireEvent } from '../../utils/fire-custom-event.js';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin ScrollControl
 * @appliesMixin ModuleRoutingMixin
 * @appliesMixin ModuleMainElCommonFunctionalityMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxErrorsParserMixin
 */
const AgreementsModuleRequiredMixins = EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  ScrollControl,
  ModuleRoutingMixin,
  ModuleMainElCommonFunctionalityMixin,
  EndpointsMixin,
  AjaxErrorsParserMixin,
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin AgreementsModuleRequiredMixins
 */
class AgreementsModule extends AgreementsModuleRequiredMixins {
  [x: string]: any;

  public static get template() {
    // language=HTML
    return html`
      ${pageLayoutStyles} ${SharedStyles} ${buttonsStyles} ${pageContentHeaderSlottedStyles}
      <style>
        :host {
          display: block;
        }
      </style>
      <app-route
          route="{{route}}"
          pattern="/list"
          query-params="{{listPageQueryParams}}"
          active="{{listActive}}"></app-route>

      <app-route
          route="{{route}}"
          pattern="/:id/details"
          active="{{tabsActive}}"
          data="{{routeData}}"></app-route>

      <page-content-header with-tabs-visible="[[_showPageTabs(activePage)]]">
        <div slot="page-title">
          <template is="dom-if" if="[[listActive]]">
            <span>Agreements</span>
          </template>
          <template is="dom-if" if="[[tabsActive]]">
            <span>[[_getAgreementDetailsTitle(agreement, newAgreementActive)]]</span>
          </template>
        </div>

        <div slot="title-row-actions" class="content-header-actions">
          <div class="action" hidden$="[[!listActive]]">
            <a target="_blank" href$="[[csvDownloadUrl]]">
              <paper-button>
                <iron-icon icon="file-download"></iron-icon>
                Export
              </paper-button>
            </a>
          </div>
          <div class="action" hidden$="[[!_showNewAgreementAddButton(listActive, permissions)]]">
            <paper-button class="primary-btn with-prefix" on-tap="_goToNewAgreementPage">
              <iron-icon icon="add"></iron-icon>
              Add New Agreement
            </paper-button>
          </div>
        </div>

        <template is="dom-if" if="[[_showPageTabs(activePage)]]">
          <etools-tabs slot="tabs"
                      tabs="[[agreementsTabs]]"
                      active-tab="details"
                      on-iron-select="_handleTabSelectAction">
          </etools-tabs>
        </template>
      </page-content-header>

      <div id="main">
        <div id="pageContent">
          <etools-error-messages-box id="errorsBox"
                                    title="Errors Saving Agreement"
                                    errors="{{serverErrors}}"></etools-error-messages-box>
          <iron-pages id="agreementsPages"
                      selected="{{activePage}}"
                      attr-for-selected="name"
                      role="main">

            <template is="dom-if" if="[[_pageEquals(activePage, 'list')]]">
              <agreements-list id="list"
                              name="list"
                              active="[[listActive]]"
                              csv-download-url="{{csvDownloadUrl}}"
                              url-params="[[preservedListQueryParams]]">
              </agreements-list>
            </template>

            <template is="dom-if" if="[[_pageEquals(activePage, 'details')]]">
              <agreement-details
                  id="agreementDetails"
                  name="details"
                  agreement="[[agreement]]"
                  authorized-officers="{{authorizedOfficers}}"
                  edit-mode="[[_hasEditPermissions(permissions)]]"
                  is-new-agreement="[[newAgreementActive]]"
                  on-save-agreement="_validateAndTriggerAgreementSave">
              </agreement-details>
            </template>
          </iron-pages>
        </div> <!-- page content end -->

        <template is="dom-if" if="[[_showSidebarStatus(listActive, tabAttached, agreement)]]">
          <!-- sidebar content start -->
          <div id="sidebar">
            <agreement-status status$="[[agreement.status]]"
                              active="[[!listActive]]"
                              new-agreement$="[[newAgreementActive]]"
                              agreement-id$="[[agreement.id]]"
                              agreement-type="[[agreement.agreement_type]]"
                              on-save-agreement="_validateAndTriggerAgreementSave"
                              edit-mode="[[_hasEditPermissions(permissions)]]"
                              on-update-agreement-status="_updateAgreementStatus"
                              on-delete-agreement="_deleteAgreement">
            </agreement-status>
          </div><!-- sidebar content end -->
        </template>

      </div> <!-- main page content end -->

      <agreement-item-data id="agreementData"
                         agreement="{{agreement}}"
                         agreement-id="[[selectedAgreementId]]"
                         error-event-name="agreement-save-error">
    </agreement-item-data>
    `;
  }

  static get properties() {
    return {
      agreementsTabs: {
        type: Array,
        value: [{
          tab: 'details',
          tabLabel: 'Agreement Details',
          hidden: false
        }]
      },
      permissions: {
        type: Object
      },
      selectedAgreementId: {
        type: Number
      },
      newAgreementModel: {
        type: Object,
        value: () => new Agreement()
      },
      csvDownloadUrl: {
        type: String
      },
      newAgreementActive: {
        type: Boolean,
        computed: '_updateNewItemPageFlag(routeData, listActive)'
      },
      agreement: {
        type: Object,
        observer: '_agreementChanged'
      },
      moduleName: {
        type: String,
        value: 'agreements'
      },
      authorizedOfficers: Array
    };
  }

  static get observers() {
    return [
      '_pageChanged(listActive, tabsActive, newAgreementActive)',
      '_observeRouteDataId(routeData.id)'
    ];
  }

  ready() {
    super.ready();
    this._initListeners();
    if (this.newAgreementActive) {
      // Useful when refreshing the page
      this.set('agreement', JSON.parse(JSON.stringify(this.newAgreementModel)));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // deactivate main page loading msg triggered in app-shell
    fireEvent(this,'global-loading', {active: false, loadingSource: 'main-page'});
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

    this.addEventListener('agreement-save-error', this._agreementSaveErrors);
    this.addEventListener('trigger-agreement-loading-msg', this._handleAgreementSelectionLoadingMsg);
  }

  _removeListeners() {
    this.removeEventListener('agreement-save-error', this._agreementSaveErrors);
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

    let fileImportDetails = {
      filenamePrefix: 'agreement',
      importErrMsg: 'Agreements page import error occurred',
      errMsgPrefixTmpl: '[agreement(s) ##page##]',
      loadingMsgSource: 'ag-page'
    };
    this.setActivePage(listActive, 'details', fileImportDetails);
  }

  // compute agreement details page title including partner name and agreement number
  _getAgreementDetailsTitle(agreement: Agreement, newAgreement: boolean) {
    if (!agreement) {
      return '';
    }
    if (newAgreement) {
      return 'Add Agreement';
    }
    return agreement.id ? (agreement.partner_name + ': ' + agreement.agreement_number) : '';
  }

  _hasEditPermissions(permissions: UserPermissions) {
    return permissions && permissions.editAgreementDetails === true;
  }

  _saveAgreement(agreementData: Agreement) {
    if (!agreementData.id) {
      agreementData.status = CONSTANTS.STATUSES.Draft.toLowerCase();
    }
    this.$.agreementData.saveAgreement(agreementData, this._newAgreementSaved.bind(this))
        .then((successfull: boolean) => {
          if (successfull) {
            store.dispatch({type: RESET_UNSAVED_UPLOADS});
          }
        });
  }

  _updateAgreementStatus(e: CustomEvent) {
    e.stopImmediatePropagation();
    this.$.agreementData.updateAgreementStatus(e.detail);
  }

  // Go to details page once the new agreement has been saved
  _newAgreementSaved(agreement: Agreement) {
    this.set('route.path', '/' + agreement.id + '/details');
  }

  _agreementSaveErrors(e: CustomEvent) {
    e.stopImmediatePropagation();
    if ((e.detail instanceof Array && e.detail.length > 0) ||
        (typeof e.detail === 'string' && e.detail !== '')) {
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
    this.set('agreement', JSON.parse(JSON.stringify(this.newAgreementModel)));
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
    this.set('selectedAgreementId', id);
  }

  _agreementChanged(agreement: Agreement) {
    // keep a copy of the agreement before changes are made and use it later to save only the changes
    this.set('originalAgreementData', JSON.parse(JSON.stringify(agreement)));
    fireEvent(this, 'clear-server-errors');
  }

  _validateAndTriggerAgreementSave(e: CustomEvent) {
    e.stopImmediatePropagation();
    if (!this.validateAgreement()) {
      return false;
    }

    let agrDataToSave: Agreement;
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
    let agreementDetailsEl = this.shadowRoot.querySelector('#agreementDetails');
    if (!agreementDetailsEl) {
      return false;
    }
    if (!agreementDetailsEl._validateAgreement()) {
      fireEvent(this, 'toast', {
        text: 'Document can not be saved ' +
            'because of missing data in Details tab', showCloseBtn: true
      });
      return false;
    }
    return true;
  }

  _prepareNewAgreementDataForSave(agreement: Agreement): Agreement {
    let newAgreement: Agreement = {
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
    let changes: Agreement = {};
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
      let signedByFields = ['partner_manager', 'signed_by_partner_date', 'signed_by_unicef_date',
        'attachment'];
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
        changes.amendments = this.agreement.amendments.filter(
            (a: AgreementAmendment) => !a.id && typeof a.signed_amendment_attachment === 'number' && a.signed_amendment_attachment > 0);
      }
    }

    return changes;
  }

  _primitiveFieldIsModified(fieldName: string) {
    return this.originalAgreementData[fieldName] !== this.agreement[fieldName];
  }

  _authorizedOfficersChanged() {
    let initialAuthOfficers = this._getInitialAuthorizedOfficersIds();
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
    this.$.agreementData.deleteAgreement(e.detail.id);
  }

}

window.customElements.define('agreements-module', AgreementsModule);
