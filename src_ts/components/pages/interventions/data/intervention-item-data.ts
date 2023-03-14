import {store} from '../../../../redux/store';
import AjaxServerErrorsMixin from '../../../common/mixins/ajax-server-errors-mixin-lit';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import CONSTANTS from '../../../../config/app-constants';
import {RootState} from '../../../../redux/store';
import {isJsonStrMatch} from '../../../utils/utils';
import {connect} from 'pwa-helpers/connect-mixin';
import {fireEvent} from '../../../utils/fire-custom-event';
import {logError, logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {
  ExpectedResult,
  FrsDetails,
  InterventionAttachment,
  ListItemIntervention,
  PlannedVisit,
  Intervention,
  Office,
  GenericObject,
  Agreement,
  MinimalAgreement
} from '@unicef-polymer/etools-types';
import {LitElement, property} from 'lit-element';
import EnvironmentFlagsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/environment-flags-mixin';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../../endpoints/endpoints';
import {get as getTranslation} from 'lit-translate';
import {setShouldReGetList} from '../pages/intervention-tab-pages/common/actions/interventions';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrorsMixin
 * @appliesMixin EnvironmentFlagsPolymerMixin
 */
class InterventionItemData extends connect(store)(
  EnvironmentFlagsMixin(AjaxServerErrorsMixin(EndpointsLitMixin(LitElement)))
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

  @property({type: Object})
  intervention!: Intervention;

  @property({type: Object})
  originalIntervention!: Intervention;

  @property({
    type: Number
  })
  interventionId!: number;

  @property({type: Object})
  handleResponseAdditionalCallback!: GenericObject | null;

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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const ajaxMethod = options.method || 'GET';
    return sendRequest(options)
      .then(function (resp: any) {
        self._handleResponse(resp, ajaxMethod);
        store.dispatch(setShouldReGetList(true));
        return true;
      })
      .catch(function (error: any) {
        self._handleErrorResponse(error, ajaxMethod);
        return false;
      });
  }

  _reqInterventionDataWithoutRespHandling() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const options = {
      endpoint: this.getEndpoint(pmpEdpoints, this.pdEndpoints.DETAILS, {
        id: this.interventionId
      })
    };
    return sendRequest(options).catch(function (error: any) {
      self._handleErrorResponse(error, 'GET');
    });
  }

  // _interventionIdChanged(newId: any, _old: any) {
  //   if (!newId) {
  //     return;
  //   }

  //   fireEvent(this, 'global-loading', {
  //     message: 'Loading...',
  //     active: true,
  //     loadingSource: this.ajaxLoadingMsgSource
  //   });
  //   this._triggerInterventionRequest({
  //     endpoint: this.getEndpoint(this.pdEndpoints.DETAILS, {id: newId})
  //   });
  // }

  _handleErrorResponse(response: any, ajaxMethod: string) {
    this.handleErrorResponse(response, ajaxMethod, true);
    if (this.intervention && this.originalIntervention) {
      this._restoreUnsuccessfullyDeletedFrs();
      this._restoreInAmmendmentFlag();
    }
  }

  _restoreUnsuccessfullyDeletedFrs() {
    this.intervention.frs_details = this.originalIntervention.frs_details;
    this.intervention.frs = this.originalIntervention.frs;
  }

  _restoreInAmmendmentFlag() {
    this.intervention.in_amendment = this.originalIntervention.in_amendment;
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
  _handleResponse(response: Intervention, ajaxMethod: string) {
    // @ts-ignore
    this.intervention = this._handleDataConversions(response);

    // call additional callback, if any
    if (typeof this.handleResponseAdditionalCallback === 'function') {
      this.handleResponseAdditionalCallback.bind(this, response)();
      // reset callback
      this.handleResponseAdditionalCallback = null;
    }

    if (ajaxMethod !== 'GET') {
      this.updateInterventionsListInDexieDb(response);
      // TODO - in theory this is not needed anymore because SSFA agreements will no longer exist
      // this.updateAgreementInDexieDb(response.agreement!, response.document_type!, response.status);
    }
  }

  updateInterventionsListInDexieDb(intervention: Intervention) {
    const mappedResponse = this._formatResponseDataForDexie(intervention);
    window.EtoolsPmpApp.DexieDb.table('interventions')
      .put(mappedResponse)
      .then(() => {
        fireEvent(this, 'reload-list');
      });
  }

  updateAgreementInDexieDb(agreementId: number, document_type: string, status: string) {
    if (!agreementId) {
      return;
    }
    if (
      document_type &&
      document_type === CONSTANTS.DOCUMENT_TYPES.SSFA &&
      status !== CONSTANTS.STATUSES.Draft.toLowerCase()
    ) {
      sendRequest({
        endpoint: this.getEndpoint(pmpEdpoints, this.pdEndpoints.AGREEMENT_DETAILS, {
          id: agreementId
        })
      }).then((resp: any) => {
        this.updateAgreeementStatus.bind(this, resp)();
      });
    }
  }

  updateAgreeementStatus(agreement: Agreement) {
    const minimalAgreement = this._getMinimalAgreementData(agreement);
    window.EtoolsPmpApp.DexieDb.table('agreements').put(minimalAgreement);
  }

  _getMinimalAgreementData(detail: Agreement) {
    const minimalAgrData: Partial<MinimalAgreement> = {
      agreement_number: '',
      agreement_number_status: '',
      agreement_type: '',
      end: '',
      id: null,
      partner: null,
      partner_name: '',
      signed_by: null,
      signed_by_partner_date: '',
      signed_by_unicef_date: '',
      start: '',
      status: ''
    };
    let propName: string;
    for (propName in minimalAgrData) {
      if (!Object.prototype.hasOwnProperty.call(detail, propName)) {
        logWarn('Mapping property not found');
      } else {
        // @ts-ignore
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

  _fileField(intervention: Intervention, property: keyof Intervention) {
    // TODO
    return intervention[property] instanceof File;
  }

  /**
   * Save intervention data
   */
  // TODO Intervention | any
  saveIntervention(intervention: Intervention | any, callback?: any) {
    if (intervention && typeof intervention === 'object' && Object.keys(intervention).length === 0) {
      fireEvent(this, 'toast', {
        text: 'Invalid intervention data!'
      });
      return Promise.resolve(false);
    } else {
      let endpoint = null;
      let isNew = false;

      if (intervention.id) {
        // prepare PATCH endpoint
        endpoint = this.getEndpoint(pmpEdpoints, this.pdEndpoints.DETAILS, {
          id: intervention.id
        });
      } else {
        // new intervention, use POST method for the same endpoint
        endpoint = this.getEndpoint(pmpEdpoints, this.pdEndpoints.CREATE);
        isNew = true;
      }

      if (intervention.id) {
        delete intervention.id;
      }
      // set additional callback if any and only if is new intervention
      if (callback && isNew) {
        this.handleResponseAdditionalCallback = callback;
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
        message: getTranslation('GENERAL.SAVING_DATA'),
        active: true,
        loadingSource: this.ajaxLoadingMsgSource
      });

      return this._triggerInterventionRequest({
        method: isNew ? 'POST' : 'PATCH',
        endpoint: endpoint,
        body: intervention
      }).then((resp: boolean) => {
        setTimeout(() => {
          fireEvent(this, 'global-loading', {
            message: getTranslation('GENERAL.SAVING_DATA'),
            active: false,
            loadingSource: this.ajaxLoadingMsgSource
          });
        }, 300);
        return resp;
      });
    }
  }

  _formatResponseDataForDexie(responseDetail: Intervention) {
    const dexieObject = new ListItemIntervention();
    dexieObject.cp_outputs = [];
    dexieObject.unicef_budget = 0;
    dexieObject.cso_contribution = 0;

    dexieObject.id = responseDetail.id;
    dexieObject.country_programmes = responseDetail.country_programmes;
    dexieObject.end = responseDetail.end;
    dexieObject.title = responseDetail.title;
    dexieObject.start = responseDetail.start;
    dexieObject.status = responseDetail.status;
    dexieObject.number = responseDetail.number;
    dexieObject.offices = responseDetail.offices;
    dexieObject.partner_name = responseDetail.partner;
    dexieObject.document_type = responseDetail.document_type;
    dexieObject.unicef_focal_points = responseDetail.unicef_focal_points;
    dexieObject.contingency_pd = responseDetail.contingency_pd;
    dexieObject.cfei_number = responseDetail.cfei_number;
    dexieObject.partner_accepted = responseDetail.partner_accepted;
    dexieObject.unicef_accepted = responseDetail.unicef_accepted;
    dexieObject.unicef_court = responseDetail.unicef_court;
    dexieObject.date_sent_to_partner = responseDetail.date_sent_to_partner;

    this._updateSections(dexieObject, responseDetail);
    this._updatePlannedBudgetInfo(dexieObject, responseDetail);
    this._updateOffices(dexieObject, responseDetail);
    this._updateFrInfo(
      dexieObject,
      responseDetail.frs_details,
      responseDetail.planned_budget && (responseDetail.planned_budget!.currency as string)
    );

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
    if (!intervention.planned_budget) {
      return;
    }
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
      return responseDetail.offices.indexOf(office.id) > -1;
    });
    if (!selectedOffices) {
      return [];
    }
    return selectedOffices.map(function (office: any) {
      return office.name;
    });
  }

  _getSelectedSections(responseDetail: any) {
    let selectedSections = {
      sectionIds: [],
      section_names: [] as string[]
    };

    const sections = responseDetail.sections;

    if (sections) {
      const sectionNames: string[] = [];
      const interventionSectionIds = sections.map((sectionId: string) => parseInt(sectionId, 10));

      this.sections.forEach(function (section: any) {
        if (interventionSectionIds.indexOf(parseInt(section.id, 10)) > -1) {
          sectionNames.push(section.name);
        }
      });
      selectedSections = {sectionIds: interventionSectionIds, section_names: sectionNames};
    }
    return selectedSections;
  }

  deleteIntervention(id: string) {
    if (!id) {
      return;
    }
    const reqMethod = 'DELETE';
    this.fireRequest(this.pdEndpoints.DELETE as any, {id: id}, {method: reqMethod})
      .then(() => {
        this._handleInterventionDeleteSuccess(id);
      })
      .catch((reqError: any) => {
        this.handleErrorResponse(reqError, reqMethod, false);
      });
  }

  deleteInterventionFromDexie(id: string) {
    window.EtoolsPmpApp.DexieDb.interventions
      .where('id')
      .equals(parseInt(id, 10))
      .delete()
      .catch((dexieDeleteErr: any) => this._handleInterventionDeleteFromDexieErr(dexieDeleteErr));
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
        text: 'PD/SPD successfully deleted.'
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
        'agreement data from browser cache. Use refresh data functionality to update cached agreements data.'
    });
  }
}

window.customElements.define('intervention-item-data', InterventionItemData);

export default InterventionItemData;
