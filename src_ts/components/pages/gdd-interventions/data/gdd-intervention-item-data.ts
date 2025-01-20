import {store} from '../../../../redux/store';
import AjaxServerErrorsMixin from '../../../common/mixins/ajax-server-errors-mixin-lit';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {RootState} from '../../../../redux/store';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {
  GDDExpectedResult,
  GDDFrsDetails,
  GDDPlannedVisit,
  GDD,
  Office,
  GenericObject
} from '@unicef-polymer/etools-types';
import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import EnvironmentFlagsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/environment-flags-mixin';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../../endpoints/endpoints';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
// TODO change this import after intervention tab pages location is changed
import {setShouldReGetList} from '../pages/intervention-tab-pages/common/actions/gddInterventions';

/**
 * @LitElement
 * @customElement
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrorsMixin
 * @appliesMixin EnvironmentFlagsPolymerMixin
 */
class GddInterventionItemData extends connect(store)(
  EnvironmentFlagsMixin(AjaxServerErrorsMixin(EndpointsLitMixin(LitElement)))
) {
  @property({type: Object})
  pdEndpoints: {
    DETAILS: string;
    CREATE: string;
    AGREEMENT_DETAILS: string;
    DELETE: string;
  } = {
    DETAILS: 'gddInterventionDetails',
    CREATE: 'gddInterventions',
    AGREEMENT_DETAILS: 'agreementDetails',
    DELETE: 'gddInterventionDelete'
  };

  @property({type: Object})
  intervention!: GDD;

  @property({type: Object})
  originalIntervention!: GDD;

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
  _handleResponse(response: GDD, _ajaxMethod: string) {
    // @ts-ignore
    this.intervention = this._handleDataConversions(response);

    // call additional callback, if any
    if (typeof this.handleResponseAdditionalCallback === 'function') {
      this.handleResponseAdditionalCallback.bind(this, response)();
      // reset callback
      this.handleResponseAdditionalCallback = null;
    }
  }

  /**
   * Save intervention data
   */
  // TODO GDD | any
  saveIntervention(intervention: GDD | any, callback?: any) {
    if (intervention && typeof intervention === 'object' && Object.keys(intervention).length === 0) {
      fireEvent(this, 'toast', {
        text: getTranslation('INVALID_INTERVENTION_DATA')
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
        intervention.result_links = intervention.result_links.filter(function (elem: GDDExpectedResult) {
          return elem.cp_output || (Array.isArray(elem.ram_indicators) && elem.ram_indicators.length);
        });
      }
      if (Array.isArray(intervention.planned_visits)) {
        intervention.planned_visits = intervention.planned_visits.filter(function (elem: GDDPlannedVisit) {
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

  _noFrOnIntervention(intervFrDetails: GDDFrsDetails) {
    return !intervFrDetails || !intervFrDetails.earliest_start_date;
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

  deleteIntervention(id: string) {
    if (!id) {
      return;
    }
    const reqMethod = 'DELETE';
    this.fireRequest(this.pdEndpoints.DELETE as any, {id: id}, {method: reqMethod})
      .then(() => {
        fireEvent(this, 'toast', {
          text: getTranslation('GDD_DELETE_SUCCCESS')
        });
        // go to pd list after delete
        fireEvent(this, 'update-main-path', {path: 'gpd-interventions/list'});
      })
      .catch((reqError: any) => {
        this.handleErrorResponse(reqError, reqMethod, false);
      });
  }
}

window.customElements.define('gdd-intervention-item-data', GddInterventionItemData);

export default GddInterventionItemData;
