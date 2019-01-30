import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';

import {connect} from "pwa-helpers/connect-mixin";
import {store} from "../../../store";
import {GestureEventListeners} from "@polymer/polymer/lib/mixins/gesture-event-listeners";

// @ts-ignore
import EtoolsMixinFactory from "etools-behaviors/etools-mixin-factory";
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin';
import ScrollControl from "../../mixins/scroll-control-mixin";
import EventHelper from "../../mixins/event-helper-mixin";
import ModuleMainElCommonFunctionalityMixin from '../mixins/module-common-mixin';
import ModuleRoutingMixin from '../mixins/module-routing-mixin';

import '../../layout/page-content-header';
import '../../layout/page-content-header-slotted-styles';
import '../../layout/etools-tabs';
import '../../layout/etools-error-messages-box';
import {UserPermissions} from "../../../typings/globals.types";





/**
 * @polymer
 * @mixinFunction
 * @appliesMixin GestureEventListeners
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin EventHelper
 * @appliesMixin ScrollControl
 * @appliesMixin ModuleRoutingMixin
 * @appliesMixin ModuleMainElCommonFunctionality
 */
const PartnersModuleRequiredMixins = EtoolsMixinFactory.combineMixins([
  GestureEventListeners, EtoolsLogsMixin, EventHelper, ScrollControl,
  ModuleRoutingMixin, ModuleMainElCommonFunctionalityMixin
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin PartnersModuleRequiredMixins
 */
class PartnersModule extends connect(store)(PartnersModuleRequiredMixins as any) {

  public static get template() {
    // main template
    // language=HTML
    return html`
      <h1>Partners pages will load from here...</h1>
    `;
  }

  public static get properties() {
    return {
      partnerTabs: {
        type: Array,
        value: [
          {
            tab: 'overview',
            tabLabel: 'Overview',
            hidden: false
          },
          {
            tab: 'details',
            tabLabel: 'Partner Details',
            hidden: false
          },
          {
            tab: 'financial-assurance',
            tabLabel: 'Assurance',
            hidden: false
          }
        ]
      },
      moduleName: {
        type: String,
        value: 'partners'
      },
      csvDownloadUrl: {
        type: String
      },
      selectedPartnerId: {
        type: Number
      },
      partner: {
        type: Object,
        observer: '_partnerChanged'
      },
      permissions: {
        type: Object
      },
      showOnlyGovernmentType: {
        type: Boolean,
        value: false
      },
      currentModule: String,
      originalPartnerData: Object
    };
  }

  public static get actions() {
    return {
      resetUnsavedUploads: function() {
        return {
          type: 'RESET_UNSAVED_UPLOADS'
        };
      }
    };
  }

  public static get observers() {
    return [
      '_pageChanged(listActive, tabsActive, routeData, currentModule)',
      '_observeRouteDataId(routeData.id)'
    ];
  }

  public ready() {
    super.ready();
    this._initListeners();
    this._createNewPartnerDialog();
  }

  public connectedCallback() {
    super.connectedCallback();
    // deactivate main page loading msg triggered in app-shell
    this.fireEvent('global-loading', {active: false, loadingSource: 'main-page'});
    /**
     * Loading msg used on stamping tabs elements (disabled in each tab main element attached callback)
     */
    this._showPartnersPageLoadingMessage();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._removeNewPartnerDialogFromDom();
    this._removeListeners();
  }

  public _initListeners() {
    this._partnerSaveError = this._partnerSaveError.bind(this);
    this._savePartnerContact = this._savePartnerContact.bind(this);
    this._saveCoreValuesAssessment = this._saveCoreValuesAssessment.bind(this);
    this._handlePartnerSelectionLoadingMsg = this._handlePartnerSelectionLoadingMsg.bind(this);

    this.addEventListener('partner-save-error', this._partnerSaveError);
    this.addEventListener('save-partner-contact', this._savePartnerContact);
    this.addEventListener('save-core-values-assessment', this._saveCoreValuesAssessment);
    this.addEventListener('trigger-partner-loading-msg', this._handlePartnerSelectionLoadingMsg);
  }

  public _removeListeners() {
    this.removeEventListener('partner-save-error', this._partnerSaveError);
    this.removeEventListener('save-partner-contact', this._savePartnerContact);
    this.removeEventListener('save-core-values-assessment', this._saveCoreValuesAssessment);
    this.removeEventListener('trigger-partner-loading-msg', this._handlePartnerSelectionLoadingMsg);
  }

  public _savePartnerContact(e: CustomEvent) {
    this._savePartner({
      id: this.partner.id,
      staff_members: [e.detail]
    });
  }

  public _saveCoreValuesAssessment(e: CustomEvent) {
    this._savePartner({
      id: this.partner.id,
      core_values_assessments: [e.detail]
    });
  }

  public _createNewPartnerDialog() {
    this.newPartnerDialog = document.createElement('new-partner-dialog');
    this.newPartnerDialog.setAttribute('id', 'newPartnerDialog');
    document.querySelector('body').appendChild(this.newPartnerDialog);

    this._createPartner = this._createPartner.bind(this);
    this.newPartnerDialog.addEventListener('create-partner', this._createPartner);
  }

  public _removeNewPartnerDialogFromDom() {
    if (this.newPartnerDialog) {
      this.newPartnerDialog.removeEventListener('create-partner', this._createPartner);
      document.querySelector('body').removeChild(this.newPartnerDialog);
    }
  }

  public _pageChanged(listActive: any, tabsActive: any, routeData: any, currentModule: any) {
    // Using isActiveModule will prevent wrong page import
    if (!this.isActiveModule(this.currentModule) || (!listActive && !tabsActive)) {
      return;
    }

    this.scrollToTopOnCondition(!listActive);

    let fileImportDetails = {
      filenamePrefix: 'partner',
      importErrMsg: 'Partners page import error occurred',
      errMsgPrefixTmpl: '[partner(s) ##page##]',
      loadingMsgSource: 'partners-page'
    };
    this.setActivePage(listActive, routeData.tab, fileImportDetails);
  }

  public _hasEditPermissions(permissions: UserPermissions) {
    return permissions && permissions.editPartnerDetails === true;
  }

  public _savePartner(newPartnerData: any) {
    let partnerData = this.shadowRoot.querySelector('#partnerData');
    if (partnerData) {
      partnerData.savePartner(newPartnerData).then((successfull: any) => {
        if (successfull) {
          this.dispatch('resetUnsavedUploads');
        }
      });
    }
  }

  public _deletePartner(e: CustomEvent) {
    e.stopImmediatePropagation();
    this.fireEvent('global-loading', {
      active: true,
      message: 'Deleting partner...',
      loadingSource: 'partner-data'
    });

    let partnerData = this.shadowRoot.querySelector('#partnerData');
    if (partnerData) {
      partnerData.deletePartner(this.partner);
    }
  }

  public _handlePartnerDeleted() {
    this.fireEvent('global-loading', {
      active: false,
      loadingSource: 'partner-data'
    });
    this.fireEvent('toast', {
      text: 'Partner successfully deleted',
      showCloseBtn: true
    });
    this.fireEvent('update-main-path', {
      path: 'partners/list'
    });
  }

  public _observeRouteDataId(id: any) {
    // Using isActiveModule will prevent wrong partner details request
    // (with an id from other app module, like reports)
    if (!this.isActiveModule(this.currentModule) || typeof id === 'undefined') {
      return;
    }
    if (this.route && this.route.prefix.indexOf('partners') > -1) {
      this.set('selectedPartnerId', id);
    }
  }

  public _partnerSaveError(event: CustomEvent) {
    event.stopImmediatePropagation();
    if ((event.detail instanceof Array && event.detail.length > 0) ||
        (typeof event.detail === 'string' && event.detail !== '')) {
      this.fireEvent('set-server-errors', event.detail);
      this.scrollToTop();
    }
  }

  public _showNewPartnerBtn(listActive: any, permissions: any) {
    return listActive && this._hasEditPermissions(permissions);
  }

  public _openNewPartnerDialog() {
    this.newPartnerDialog.openNewPartnerDialog();
  }

  public _createPartner(event: CustomEvent) {
    let partnerData = this.shadowRoot.querySelector('#partnerData');
    if (partnerData) {
      partnerData.createPartner(event.detail, this._newPartnerCreated,
          this._handleCreatePartnerError);
    }
  }

  public _newPartnerCreated(partner: any) {
    this.fireEvent('update-main-path', {
      path: 'partners/' + partner.id + '/details'
    });
  }

  public _handleCreatePartnerError(errorDetails: any) {
    this.fireEvent('toast', {
      text: errorDetails,
      showCloseBtn: true
    });
  }

  public _partnerChanged(partner: any) {
    if (!_.isEmpty(partner)) {
      // dismiss partner details pages loading
      this.fireEvent('global-loading', {
        active: false,
        loadingSource: 'partner-data'
      });
      // keep a copy of loaded partner to be able to check changed data
      this.set('originalPartnerData', JSON.parse(JSON.stringify(partner)));
    }
    this.fireEvent('clear-server-errors');
  }

  /**
   * All partners pages with editable fields should be validated on save
   */
  public _partnerDataIsValid() {
    let valid = true;
    let partnersPages = [
      this.shadowRoot.querySelector('#financialAssurance')
      // this.shadowRoot.querySelector('#partnerDetails')
    ];
    partnersPages.forEach((pageEl) => {
      if (pageEl && !pageEl._validatePageData()) {
        valid = false;
      }
    });
    return valid;
  }

  public _validateAndTriggerPartnerSave(event: CustomEvent) {
    event.stopImmediatePropagation();
    if (!this._hasEditPermissions(this.permissions)) {
      return;
    }
    if (this._partnerDataIsValid()) {
      // both partner details and financial assurance data is valid
      let partnerChanges = this._cleanUpdateData(this.partner);
      partnerChanges.id = this.partner.id;
      this._savePartner(partnerChanges);
    } else {
      this.fireEvent('toast', {
        text: 'Please check assessments and partner contacts for ' +
            'invalid fields or empty data rows!', showCloseBtn: true
      });
    }
  }

  public _cleanUpdateData(partner: any) {
    let updatableFields = [
      'alternate_name',
      'shared_with',
      'staff_members',
      'assessments',
      'planned_engagement',
      'basis_for_risk_rating'
    ];
    let changes = {};
    updatableFields.forEach((fieldName) => {
      // TODO: improve this
      if (['shared_with', 'assessments', 'staff_members', 'planned_engagement'].indexOf(fieldName) > -1) {
        if (JSON.stringify(partner[fieldName]) !== JSON.stringify(this.originalPartnerData[fieldName])) {
          if (fieldName === 'assessments') {
            changes[fieldName] = [...this._getNewOrWithReportChangedAssessments(partner[fieldName]),
              ...this._getModIgnoringAttachChanges(partner[fieldName])];
            if (changes[fieldName].length === 0) {
              delete changes[fieldName];
            } else {
              // TODO: remove this once old upload properties are removed from backend
              changes[fieldName] = changes[fieldName].map((a) => {
                delete a.report;
                delete a.report_file;
                return a;
              });
            }
          } else {
            changes[fieldName] = partner[fieldName];
          }
        }
      } else {
        if (partner[fieldName] !== this.originalPartnerData[fieldName]) {
          changes[fieldName] = partner[fieldName];
        }
      }
    });
    return changes;
  }

  /**
   * Get all new assessments or those with report attachment changed
   */
  public _getNewOrWithReportChangedAssessments(assessmentsList: any) {
    return assessmentsList.filter(
        a => typeof a.report_attachment === 'number' && a.report_attachment > 0);
  }

  /**
   * Get all assessments with data changed ignoring attachment changes
   */
  public _getModIgnoringAttachChanges(assessmentsList: any) {
    const alreadySavedAssessments = assessmentsList.filter(
        a => typeof a.report_attachment === 'string' && a.report_attachment !== '');
    const modifiedAssessments = [];
    if (alreadySavedAssessments.length > 0) {
      alreadySavedAssessments.forEach((a) => {
        // get original assessment data
        const originalA = this.originalPartnerData.assessments.find(oA => oA.id === a.id);
        // check for new updates
        if (originalA && JSON.stringify(originalA) !== JSON.stringify(a)) {
          delete a.report_attachment; // to avoid BE valid report file ID check
          modifiedAssessments.push(a);
        }
      });
    }
    return modifiedAssessments;
  }

  public _handleTabSelectAction(e: CustomEvent) {
    this._showTabChangeLoadingMsg(e, 'partners-page', 'partner-');
  }

  public _handlePartnerSelectionLoadingMsg() {
    this._showTabChangeLoadingMsg(null, 'partners-page', 'partner-', 'details');
  }

  /**
   * Loading msg used on stamping tabs elements (disabled in each tab main element attached callback)
   */
  public _showPartnersPageLoadingMessage() {
    this.fireEvent('global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'partners-page'
    });
  }

}

window.customElements.define('partners-module', PartnersModule);
