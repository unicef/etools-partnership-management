import {PolymerElement} from '@polymer/polymer';
import {store} from '../../../../store';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';
import AjaxServerErrorsMixin from '../../../mixins/ajax-server-errors-mixin';
import EnvironmentFlagsMixin from '../../../environment-flags/environment-flags-mixin';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import CONSTANTS from '../../../../config/app-constants';
import {RootState} from '../../../../store';
import {isJsonStrMatch} from '../../../utils/utils';
import {connect} from 'pwa-helpers/connect-mixin';
import {
  ListItemIntervention,
  SelectedSection,
  FrsDetails,
  Intervention,
  InterventionAttachment,
  PlannedVisit,
  ExpectedResult
} from '../../../../typings/intervention.types';
import {Agreement, MinimalAgreement} from '../../agreements/agreement.types';
import {fireEvent} from '../../../utils/fire-custom-event';
import {logError, logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {property} from '@polymer/decorators';
import {Office, GenericObject} from '../../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrorsMixin
 * @appliesMixin EnvironmentFlagsMixin
 */
class InterventionItemData extends connect(store)(
  EnvironmentFlagsMixin(AjaxServerErrorsMixin(EndpointsMixin(PolymerElement)))
) {
  @property({type: Object})
  pdEndpoints: {
    DETAILS: string;
    CREATE: string;
    AGREEMENT_DETAILS: string;
    DELETE: string;
  } = {
    DETAILS: 'interventionDetails',
    CREATE: 'interventions',
    AGREEMENT_DETAILS: 'agreementDetails',
    DELETE: 'interventionDelete'
  };

  @property({type: Object, readOnly: true, notify: true})
  intervention!: Intervention;

  @property({type: Object})
  originalIntervention!: Intervention;

  @property({
    type: Number,
    notify: true,
    observer: InterventionItemData.prototype._interventionIdChanged
  })
  interventionId!: number;

  @property({type: Object})
  handleResponseAdditionalCallback!: object;

  @property({type: Array})
  offices!: Office[];

  @property({type: Array})
  sections!: GenericObject[];

  /**
   * ajaxLoadingMsgSource use is required for request errors handling in AjaxServerErrorsBehavior
   */
  @property({type: String})
  ajaxLoadingMsgSource = 'pd-ssfa-data';

  // Defined

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.sections, state.commonData!.sections)) {
      this.sections = state.commonData!.sections;
    }
    if (!isJsonStrMatch(this.offices, state.commonData!.offices)) {
      this.offices = state.commonData!.offices;
    }
  }

  _triggerInterventionRequest(options: any) {
    const self = this;
    const ajaxMethod = options.method || 'GET';
    return sendRequest(options)
      .then(function (resp: any) {
        self._handleResponse(resp, ajaxMethod);
        return true;
      })
      .catch(function (error: any) {
        self._handleErrorResponse(error, ajaxMethod);
        return false;
      });
  }

  _reqInterventionDataWithoutRespHandling() {
    const self = this;
    const options = {
      endpoint: this.getEndpoint(this.pdEndpoints.DETAILS, {
        id: this.interventionId
      })
    };
    return sendRequest(options).catch(function (error: any) {
      self._handleErrorResponse(error, 'GET');
    });
  }

  _interventionIdChanged(newId: any, _old: any) {
    if (!newId) {
      return;
    }

    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: this.ajaxLoadingMsgSource
    });
    this._triggerInterventionRequest({
      endpoint: this.getEndpoint(this.pdEndpoints.DETAILS, {id: newId})
    });
  }

  _handleErrorResponse(response: any, ajaxMethod: string) {
    this.handleErrorResponse(response, ajaxMethod, true);
    if (this.intervention && this.originalIntervention) {
      this._restoreUnsuccessfullyDeletedFrs();
      this._restoreInAmmendmentFlag();
    }
  }

  _restoreUnsuccessfullyDeletedFrs() {
    this.set('intervention.frs_details', this.originalIntervention.frs_details);
    this.set('intervention.frs', this.originalIntervention.frs);
  }

  _restoreInAmmendmentFlag() {
    this.set('intervention.in_amendment', this.originalIntervention.in_amendment);
  }

  _convertIdsToStrings(dataArray: []) {
    return dataArray.map(function (elem: any) {
      return typeof elem === 'number' ? String(elem) : elem;
    });
  }

  _handleDataConversions(intervention: any) {
    const fieldsToConvert = ['flat_locations', 'offices', 'partner_focal_points', 'sections', 'unicef_focal_points'];

    fieldsToConvert.forEach((propName: string) => {
      if (!intervention[propName] || !intervention[propName].length) {
        return;
      }
      intervention[propName] = this._convertIdsToStrings(intervention[propName]);
    });

    return intervention;
  }

  /**
   * Handle received data from request
   */
  _handleResponse(response: any, ajaxMethod: string) {
    // @ts-ignore
    this._setIntervention(this._handleDataConversions(response));

    // call additional callback, if any
    if (typeof this.handleResponseAdditionalCallback === 'function') {
      this.handleResponseAdditionalCallback.bind(this, response)();
      // reset callback
      this.set('handleResponseAdditionalCallback', null);
    }

    const self = this;
    if (ajaxMethod !== 'GET') {
      // update the interventions list in dexieDB
      const mappedResponse = this._formatResponseDataForDexie(response);
      window.EtoolsPmpApp.DexieDb.table('interventions')
        .put(mappedResponse)
        .then(function () {
          fireEvent(self, 'reload-list');
        });

      if (
        response.document_type &&
        response.document_type === CONSTANTS.DOCUMENT_TYPES.SSFA &&
        response.status !== CONSTANTS.STATUSES.Draft.toLowerCase()
      ) {
        sendRequest({
          endpoint: this.getEndpoint(this.pdEndpoints.AGREEMENT_DETAILS, {
            id: response.agreement
          })
        }).then(function (resp: any) {
          self.updateAgreeementStatus.bind(self, resp)();
        });
      }
    }
  }

  updateAgreeementStatus(agreement: Agreement) {
    const minimalAgreement = this._getMinimalAgreementData(agreement);
    window.EtoolsPmpApp.DexieDb.table('agreements').put(minimalAgreement);
  }

  _getMinimalAgreementData(detail: Agreement) {
    const minimalAgrData: MinimalAgreement = {
      agreement_number: '',
      agreement_number_status: '',
      agreement_type: '',
      end: null,
      id: null,
      partner: null,
      partner_name: null,
      signed_by: null,
      signed_by_partner_date: null,
      signed_by_unicef_date: null,
      start: null,
      status: ''
    };
    let propName: string;
    for (propName in minimalAgrData) {
      if (!detail.hasOwnProperty(propName)) {
        logWarn('Mapping property not found');
      } else {
        minimalAgrData[propName] = detail[propName];
      }
    }
    return minimalAgrData;
  }

  _hasFiles(list: InterventionAttachment[], property: string) {
    if (!Array.isArray(list) || (Array.isArray(list) && list.length === 0)) {
      return false;
    }
    let hasF = false;
    let i: number;
    for (i = 0; i < list.length; i++) {
      if (list[i][property] instanceof File) {
        hasF = true;
      } else {
        delete list[i][property];
      }
    }
    return hasF;
  }

  _fileField(intervention: Intervention, property: string) {
    // TODO
    return intervention[property] instanceof File;
  }

  /**
   * Update intervention status. In addition set a callback to be called after request is complete.
   */
  updateInterventionStatus(data: any, callback?: any) {
    if (!data.interventionId) {
      fireEvent(this, 'toast', {
        text: 'Invalid intervention ID',
        showCloseBtn: true
      });
    } else {
      if (
        [
          CONSTANTS.STATUSES.Signed.toLowerCase(),
          CONSTANTS.STATUSES.Suspended.toLowerCase(),
          CONSTANTS.STATUSES.Terminated.toLowerCase()
        ].indexOf(data.status) > -1
      ) {
        // status change is allowed
        // set additional callback if any
        if (callback) {
          this.set('handleResponseAdditionalCallback', callback);
        }
        fireEvent(this, 'global-loading', {
          message: 'Changing intervention status...',
          active: true,
          loadingSource: this.ajaxLoadingMsgSource
        });
        // fire in the hole
        this._triggerInterventionRequest({
          method: 'PATCH',
          endpoint: this.getEndpoint(this.pdEndpoints.DETAILS, {
            id: data.interventionId
          }),
          body: {
            status: data.status
          }
        });
      } else {
        fireEvent(this, 'toast', {
          text: "Changing status to '" + data.status + "' is not allowed!",
          showCloseBtn: true
        });
      }
    }
  }

  /**
   * Save intervention data
   */
  // TODO Intervention | any
  saveIntervention(intervention: Intervention | any, callback?: any) {
    if (intervention && typeof intervention === 'object' && Object.keys(intervention).length === 0) {
      fireEvent(this, 'toast', {
        text: 'Invalid intervention data!',
        showCloseBtn: true
      });
      return Promise.resolve(false);
    } else {
      let endpoint = null;
      let isNew = false;
      let prepareMultipartData = false;

      if (intervention.id) {
        // prepare PATCH endpoint
        endpoint = this.getEndpoint(this.pdEndpoints.DETAILS, {
          id: intervention.id
        });
      } else {
        // new intervention, use POST method for the same endpoint
        endpoint = this.getEndpoint(this.pdEndpoints.CREATE);
        isNew = true;
      }
      // remove id from data
      if (intervention.id) {
        delete intervention.id;
      }
      // set additional callback if any and only if is new intervention
      if (callback && isNew) {
        this.set('handleResponseAdditionalCallback', callback);
      }

      if (this._hasFiles(intervention.attachments, 'attachment')) {
        prepareMultipartData = true;
      }

      if (Array.isArray(intervention.result_links)) {
        intervention.result_links = intervention.result_links.filter(function (elem: ExpectedResult) {
          return elem.cp_output || (Array.isArray(elem.ram_indicators) && elem.ram_indicators.length);
        });
      }
      if (Array.isArray(intervention.planned_visits)) {
        intervention.planned_visits = intervention.planned_visits.filter(function (elem: PlannedVisit) {
          return elem.year || elem.programmatic;
        });
      }
      fireEvent(this, 'global-loading', {
        message: 'Saving...',
        active: true,
        loadingSource: this.ajaxLoadingMsgSource
      });

      const method = isNew ? 'POST' : 'PATCH';
      return this._triggerInterventionRequest({
        method: method,
        endpoint: endpoint,
        body: intervention,
        multiPart: prepareMultipartData,
        prepareMultipartData: prepareMultipartData
      });
    }
  }

  _formatResponseDataForDexie(responseDetail: Intervention) {
    const dexieObject = new ListItemIntervention();
    dexieObject.cp_outputs = [];
    dexieObject.unicef_budget = 0;
    dexieObject.cso_contribution = 0;

    dexieObject.id = responseDetail.id;
    dexieObject.country_programme = responseDetail.country_programme;
    dexieObject.end = responseDetail.end;
    dexieObject.title = responseDetail.title;
    dexieObject.start = responseDetail.start;
    dexieObject.status = responseDetail.status;
    dexieObject.number = responseDetail.number;
    dexieObject.offices = responseDetail.offices;
    dexieObject.partner_name = responseDetail.partner;
    dexieObject.document_type = responseDetail.document_type;
    dexieObject.unicef_focal_points = responseDetail.unicef_focal_points;

    this._updateSections(dexieObject, responseDetail);
    this._updatePlannedBudgetInfo(dexieObject, responseDetail);
    this._updateOffices(dexieObject, responseDetail);
    this._updateFrInfo(dexieObject, responseDetail.frs_details, responseDetail.planned_budget!.currency as string);

    responseDetail.result_links.forEach(function (elem: ExpectedResult) {
      dexieObject.cp_outputs.push(elem.cp_output);
    });

    return dexieObject;
  }

  _updateSections(dexieObject: ListItemIntervention, intervention: Intervention) {
    const selectedSections = this._getSelectedSections(intervention);
    dexieObject.sections = selectedSections.sectionIds;
    dexieObject.section_names = selectedSections.section_names;
  }

  _updatePlannedBudgetInfo(dexieObject: ListItemIntervention, intervention: Intervention) {
    dexieObject.unicef_budget =
      parseFloat(intervention.planned_budget!.unicef_cash_local as string) +
      parseFloat(intervention.planned_budget!.in_kind_amount_local as string);
    dexieObject.cso_contribution = parseFloat(intervention.planned_budget!.partner_contribution_local as string);
    dexieObject.total_budget = dexieObject.unicef_budget + dexieObject.cso_contribution;
    dexieObject.unicef_cash = parseFloat(intervention.planned_budget!.unicef_cash_local as string);
    dexieObject.budget_currency = intervention.planned_budget!.currency;
  }

  _updateFrInfo(dexieObject: ListItemIntervention, intervFrDetails: FrsDetails, plannedBudgetCurrency: string) {
    if (this._noFrOnIntervention(intervFrDetails)) {
      dexieObject.fr_currency = null;
      dexieObject.fr_currencies_are_consistent = null;
      dexieObject.all_currencies_are_consistent = null;
      return;
    }
    dexieObject.frs_total_frs_amt = intervFrDetails.total_frs_amt;
    dexieObject.frs_latest_end_date = intervFrDetails.latest_end_date;
    dexieObject.frs_earliest_start_date = intervFrDetails.earliest_start_date;
    dexieObject.fr_currency = intervFrDetails.currencies_match ? intervFrDetails.frs[0].currency : null;
    dexieObject.fr_currencies_are_consistent = intervFrDetails.currencies_match;
    dexieObject.all_currencies_are_consistent = intervFrDetails.currencies_match
      ? intervFrDetails.frs[0].currency === plannedBudgetCurrency
      : false;
  }

  _noFrOnIntervention(intervFrDetails: FrsDetails) {
    return !intervFrDetails || !intervFrDetails.earliest_start_date;
  }

  _updateOffices(dexieObject: ListItemIntervention, responseDetail: any) {
    if (!responseDetail.offices || !responseDetail.offices.length) {
      dexieObject.offices_names = [];
      return;
    }

    dexieObject.offices_names = this._getSelectedOfficesNames(responseDetail);
  }

  _getSelectedOfficesNames(responseDetail: any) {
    const selectedOffices = this.offices.filter(function (office: any) {
      return responseDetail.offices.indexOf(office.id.toString()) > -1;
    });
    if (!selectedOffices) {
      return [];
    }
    return selectedOffices.map(function (office: any) {
      return office.name;
    });
  }

  _getSelectedSections(responseDetail: any) {
    let selectedSections = new SelectedSection([], []);

    const sections = responseDetail.sections;

    if (sections) {
      const sectionNames: string[] = [];
      const interventionSectionIds = sections.map((sectionId: string) => parseInt(sectionId, 10));

      this.sections.forEach(function (section: any) {
        if (interventionSectionIds.indexOf(parseInt(section.id, 10)) > -1) {
          sectionNames.push(section.name);
        }
      });
      selectedSections = new SelectedSection(interventionSectionIds, sectionNames);
    }
    return selectedSections;
  }

  deleteIntervention(id: string) {
    if (!id) {
      return;
    }
    const reqMethod = 'DELETE';
    this.fireRequest(this.pdEndpoints.DELETE, {id: id}, {method: reqMethod})
      .then(() => {
        this._handleInterventionDeleteSuccess(id);
      })
      .catch((reqError: any) => {
        this.handleErrorResponse(reqError, reqMethod, false);
      });
  }

  _handleInterventionDeleteSuccess(id: string) {
    window.EtoolsPmpApp.DexieDb.interventions
      .where('id')
      .equals(parseInt(id, 10))
      .delete()
      .then((deleteCount: any) => this._handleInterventionDeleteFromDexieSuccess(deleteCount))
      .catch((dexieDeleteErr: any) => this._handleInterventionDeleteFromDexieErr(dexieDeleteErr))
      .then(() => {
        // go to pd/ssfa list after delete
        fireEvent(this, 'update-main-path', {path: 'interventions/list'});
      });
  }

  _handleInterventionDeleteFromDexieSuccess(deleteCount: number) {
    if (deleteCount === 1) {
      fireEvent(this, 'reload-list');
      fireEvent(this, 'toast', {
        text: 'PD/SSFA successfully deleted.',
        showCloseBtn: true
      });
    } else {
      throw new Error('Intervention was not deleted from dexie!');
    }
  }

  _handleInterventionDeleteFromDexieErr(dexieDeleteErr: any) {
    // Agreement dexie deleted issue
    logError('Agreement delete from local dexie db failed!', 'agreement-item-data', dexieDeleteErr);
    fireEvent(this, 'toast', {
      text:
        'The agreement was deleted from server database, but there was an issue on cleaning ' +
        'agreement data from browser cache. Use refresh data functionality to update cached agreements data.',
      showCloseBtn: true
    });
  }
}

window.customElements.define('intervention-item-data', InterventionItemData);

export default InterventionItemData;
