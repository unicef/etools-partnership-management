import {store} from '../../redux/store';

import * as commonDataActions from '../../redux/actions/common-data.js';

import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {Constructor, LabelAndValue} from '@unicef-polymer/etools-types';
import {CommonDataState} from '../../redux/reducers/common-data';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import pmpEdpoints from '../endpoints/endpoints';
import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import EnvironmentFlagsMixinLit from './environment-flags/environment-flags-mixin-lit';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {translateLabelAndValueArray} from '../utils/language';

/**
 * @LitElement
 * @mixinFunction
 */
function CommonDataMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class CommonDataClass extends EnvironmentFlagsMixinLit(EndpointsLitMixin(baseClass)) {
    @property({type: Array})
    reportStatuses: LabelAndValue[] = [
      // TODO: reports list filter statuses? To be confirmed by unicef team.
      {value: 'Acc', label: 'Accepted'},
      {value: 'Due', label: 'Due'},
      {value: 'Sen', label: 'Sent Back'},
      {value: 'Sub', label: 'Submitted'},
      {value: 'Ove', label: 'Overdue'}
    ];

    @property({type: Array})
    reportTypes: LabelAndValue[] = [
      {value: 'HR', label: 'Humanitarian Reports'},
      {value: 'QPR', label: 'Quarterly Progress Reports'},
      {value: 'SR', label: 'Special Reports'}
    ];

    @property({type: Object})
    commonDataEndpoints = {
      pmp: [
        // Don't change order
        'countryProgrammes',
        'dropdownsPmp',
        'dropdownsStatic',
        'locations',
        'offices',
        'sections',
        'sites',
        'unicefUsers',
        'userCountryDetails'
      ],
      pmpPrpSections: ['disaggregations'],
      prp: ['getPRPCountries']
    };

    @property({type: Object})
    commonDataToRefreshOnLanguageChangeEndpoints = {
      pmp: ['dropdownsPmp', 'dropdownsStatic']
    };

    public async loadCommonData() {
      // get PMP static data
      await this.getCommonData(this.commonDataEndpoints.pmp);
      await this._handlePrpData();
    }

    public loadCommonDataOnLanguageChange() {
      this.getCommonDataOnLanguageChange(this.commonDataToRefreshOnLanguageChangeEndpoints.pmp);
    }

    protected getCommonData(endpointsNames: string[]) {
      const promisses = endpointsNames.map((endpointName: string) => {
        // @ts-ignore
        return sendRequest({endpoint: {url: pmpEdpoints[endpointName].url}});
      });
      return Promise.allSettled(promisses).then((response: any[]) => {
        store.dispatch({
          type: commonDataActions.SET_ALL_STATIC_DATA,
          staticData: this.formatResponse(response)
        });
        store.dispatch({
          type: commonDataActions.SET_COMMON_DATA_IS_LOADED
        });
      });
    }

    protected getCommonDataOnLanguageChange(endpointsNames: string[]) {
      const promisses = endpointsNames.map((endpointName: string) => {
        // @ts-ignore
        return sendRequest({endpoint: {url: pmpEdpoints[endpointName].url}});
      });
      Promise.allSettled(promisses).then((response: any[]) => {
        store.dispatch({
          type: commonDataActions.SET_ALL_STATIC_DATA,
          staticData: this.formatResponseOnLanguageChange(response)
        });
        store.dispatch({
          type: commonDataActions.SET_COMMON_DATA_IS_LOADED
        });
      });
    }

    protected _getStaticData(endpointsNames: string[]) {
      endpointsNames.forEach((endpointName: string) => {
        this._makeRequest(endpointName, this._getEndpointSuccessHandler(endpointName), this._errorHandler);
      });
    }

    private formatResponse(response: any[]) {
      const data: Partial<CommonDataState> = {};
      data.countryProgrammes = this.getValue(response[0]);
      this.setStaticAndDynamicData(data, this.getValue(response[1]), this.getValue(response[2]));

      data.locations = this.getValue(response[3]);
      data.offices = this.getValue(response[4]);
      data.sections = this.getValue(response[5]);
      data.sites = this.getValue(response[6]);
      data.unicefUsersData = this.getValue(response[7]);
      data.countryData = this.getValue(response[8]);

      return data;
    }

    private formatResponseOnLanguageChange(response: any[]) {
      const data: Partial<CommonDataState> = {};
      this.setStaticAndDynamicData(data, this.getValue(response[0]), this.getValue(response[1]));
      return data;
    }

    private setStaticAndDynamicData(data: Partial<CommonDataState>, dropdownsPmpRespose: any, dropdownsStatic: any) {
      data.fileTypes = dropdownsPmpRespose.file_types;
      data.cpOutputs = dropdownsPmpRespose.cp_outputs;
      data.signedByUnicefUsers = dropdownsPmpRespose.signed_by_unicef_users;
      data.donors = dropdownsPmpRespose.donors;
      data.grants = dropdownsPmpRespose.grants;
      data.providedBy = dropdownsPmpRespose.supply_item_provided_by;
      data.csoTypes = dropdownsPmpRespose.cso_types;
      data.locationTypes = dropdownsPmpRespose.location_types;
      data.gpdStatuses = dropdownsPmpRespose.gpd_status;

      data.documentTypes = dropdownsStatic.intervention_doc_type;
      data.interventionStatuses = dropdownsStatic.intervention_status;
      data.currencies = dropdownsStatic.currencies;
      data.agreementTypes = dropdownsStatic.agreement_types;
      data.agreementStatuses = dropdownsStatic.agreement_status;
      data.agencyChoices = dropdownsStatic.agency_choices;
      data.agreementAmendmentTypes = dropdownsStatic.agreement_amendment_types;
      data.partnerTypes = dropdownsStatic.partner_types;
      data.seaRiskRatings = dropdownsStatic.sea_risk_ratings;
      data.assessmentTypes = dropdownsStatic.assessment_types;
      data.interventionAmendmentTypes = dropdownsStatic.intervention_amendment_types;
      data.gddAmendmentTypes = dropdownsPmpRespose.gdd_amendment_types;
      data.partnerRiskRatings = dropdownsStatic.partner_risk_rating;
      data.genderEquityRatings = dropdownsStatic.gender_equity_sustainability_ratings;
      data.riskTypes = dropdownsStatic.risk_types;
      data.gpdRiskTypes = dropdownsStatic.gpd_risk_types;
      data.cashTransferModalities = dropdownsStatic.cash_transfer_modalities;

      data.reportStatuses = translateLabelAndValueArray(this.reportStatuses, 'COMMON_DATA.REPORTSTATUSES');
      data.reportTypes = translateLabelAndValueArray(this.reportTypes, 'COMMON_DATA.REPORTTYPES');
    }

    getValue(response: {status: string; value?: any; reason?: any}, defaultValue: any = []) {
      return response.status === 'fulfilled' ? response.value : defaultValue;
    }

    protected _handlePrpData() {
      return this.waitForEnvFlagsToLoad().then(() => {
        if (this.shouldShowPrpReports()) {
          this._getStaticData(this.commonDataEndpoints.pmpPrpSections);
          if (this.prpServerIsOn()) {
            this._getStaticData(this.commonDataEndpoints.prp);
          }
        }
      });
    }

    protected _makeRequest(endpointName: string, successHandler: any, errorHandler: any) {
      this.fireRequest(pmpEdpoints, endpointName, {})
        .then((resp: any) => {
          successHandler.bind(this, resp)();
        })
        .catch((error: any) => {
          errorHandler.bind(this, error)();
        });
    }

    protected _errorHandler(err: any) {
      EtoolsLogger.error('Error getting static data', 'static-common-data', err);
    }

    protected _getEndpointSuccessHandler(endpointName: string) {
      switch (endpointName) {
        case 'countryProgrammes':
          return this._handleCountryProgrammesResponse;
        case 'dropdownsPmp':
          return this._handleDropdownsPmpResponse;
        case 'dropdownsStatic':
          return this._handleDropdownsStaticResponse;
        case 'locations':
          return this._handleLocationsResponse;
        case 'offices':
          return this._handleOfficesResponse;
        case 'sections':
          return this._handleSectionsResponse;
        case 'sites':
          return this._handleSitesResponse;
        case 'unicefUsers':
          return this._handleUnicefUsersResponse;
        case 'userCountryDetails':
          return this._handleUserCountryDataResponse;
        case 'disaggregations':
          return this._handleDisaggregationsResponse;
        case 'getPRPCountries':
          return this._handlePRPCountryDataResponse;
        default:
          return null;
      }
    }

    private _validReqResponseData(data: any): boolean {
      return data instanceof Array && data.length > 0;
    }

    protected _handleCountryProgrammesResponse(response: any) {
      if (this._validReqResponseData(response)) {
        // set setUsersData values
        store.dispatch(commonDataActions.updateCountryProgrammes(response));
      }
    }

    protected _handleDisaggregationsResponse(response: any) {
      if (this._validReqResponseData(response)) {
        store.dispatch(commonDataActions.updateDisaggregations(response));
      }
    }

    protected _handleDropdownsPmpResponse(response: any) {
      if (!isEmptyObject(response)) {
        // set file types value
        if (this._validReqResponseData(response.file_types)) {
          store.dispatch(commonDataActions.updateFileTypes((response as any).file_types));
        }

        // set CP Outputs values
        if (this._validReqResponseData(response.cp_outputs)) {
          store.dispatch(commonDataActions.updateCpOutputs((response as any).cp_outputs));
        }

        // set Signed By UNICEF Users
        if (this._validReqResponseData(response.signed_by_unicef_users)) {
          store.dispatch(commonDataActions.updateSignedByUnicefUsers((response as any).signed_by_unicef_users));
        }

        // set donors
        if (this._validReqResponseData(response.donors)) {
          store.dispatch(commonDataActions.updateDonors((response as any).donors));
        }

        // set donors
        if (this._validReqResponseData(response.grants)) {
          store.dispatch(commonDataActions.updateGrants((response as any).grants));
        }

        // set provided by
        if (this._validReqResponseData(response.supply_item_provided_by)) {
          store.dispatch(commonDataActions.updateProvidedBy((response as any).supply_item_provided_by));
        }

        // set gpd_status values
        if (this._validReqResponseData(response.gpd_status)) {
          store.dispatch(commonDataActions.updateGpdStatuses((response as any).gpd_status));
        }
      }
    }

    protected _handleDropdownsStaticResponse(response: any) {
      if (!isEmptyObject(response)) {
        // set intervention_doc_type values
        if (this._validReqResponseData(response.intervention_doc_type)) {
          store.dispatch(commonDataActions.updateInterventionDocTypes(response.intervention_doc_type));
        }
        // set intervention_status values
        if (this._validReqResponseData(response.intervention_status)) {
          store.dispatch(commonDataActions.updateInterventionStatuses((response as any).intervention_status));
        }
        // set currencies data
        if (this._validReqResponseData(response.currencies)) {
          store.dispatch(commonDataActions.updateCurrencies((response as any).currencies));
        }
        // set agreement types data
        if (this._validReqResponseData(response.agreement_types)) {
          store.dispatch(commonDataActions.updateAgreementTypes((response as any).agreement_types));
        }
        // set agreement statuses data
        if (this._validReqResponseData(response.agreement_status)) {
          store.dispatch(commonDataActions.updateAgreementStatuses((response as any).agreement_status));
        }
        // set agency data
        if (this._validReqResponseData(response.agency_choices)) {
          store.dispatch(commonDataActions.updateAgencyChoices((response as any).agency_choices));
        }
        // set agreement amendment data
        if (this._validReqResponseData(response.agreement_amendment_types)) {
          store.dispatch(commonDataActions.updateAgreementAmendmentTypes((response as any).agreement_amendment_types));
        }
        // set cso types data
        if (this._validReqResponseData(response.cso_types)) {
          store.dispatch(commonDataActions.updateCsoTypes((response as any).cso_types));
        }
        // set partner types data
        if (this._validReqResponseData(response.partner_types)) {
          store.dispatch(commonDataActions.updatePartnerTypes((response as any).partner_types));
        }

        if (this._validReqResponseData(response.sea_risk_ratings)) {
          store.dispatch(commonDataActions.updateSeaRiskRatings((response as any).sea_risk_ratings));
        }

        // set assessment types data
        if (this._validReqResponseData(response.assessment_types)) {
          store.dispatch(commonDataActions.updateAssessmentTypes((response as any).assessment_types));
        }
        // set intervention ammendment data
        if (this._validReqResponseData(response.intervention_amendment_types)) {
          store.dispatch(
            commonDataActions.updateInterventionAmendmentTypes((response as any).intervention_amendment_types)
          );
        }
        // set gdd intervention ammendment data
        if (this._validReqResponseData(response.gdd_amendment_types)) {
          store.dispatch(commonDataActions.updateGDDInterventionAmendmentTypes((response as any).gdd_amendment_types));
        }

        // set admin level/location types
        if (this._validReqResponseData(response.location_types)) {
          store.dispatch(commonDataActions.updateLocationTypes((response as any).location_types));
        }

        if (this._validReqResponseData(response.partner_risk_rating)) {
          store.dispatch(commonDataActions.updatePartnerRiskRatings((response as any).partner_risk_rating));
        }
        // set gender equity sustainability ratings
        if (this._validReqResponseData(response.gender_equity_sustainability_ratings)) {
          store.dispatch(commonDataActions.updateGenderEquity((response as any).gender_equity_sustainability_ratings));
        }
        // set risk types
        if (this._validReqResponseData(response.risk_types)) {
          store.dispatch(commonDataActions.updateRiskTypes((response as any).risk_types));
        }
        // set gpd risk types
        if (this._validReqResponseData(response.gpd_risk_types)) {
          store.dispatch(commonDataActions.updateGpdRiskTypes((response as any).gpd_risk_types));
        }
        // set cash transfer options
        if (this._validReqResponseData(response.cash_transfer_modalities)) {
          store.dispatch(commonDataActions.updateCashTransferModalities((response as any).cash_transfer_modalities));
        }
      }
    }

    protected _handleLocationsResponse(response: any) {
      if (this._validReqResponseData(response)) {
        // set locations values
        store.dispatch(commonDataActions.updateLocations(response));
      }
    }

    protected _handleOfficesResponse(response: any) {
      if (this._validReqResponseData(response)) {
        // set offices values
        store.dispatch(commonDataActions.updateOfficesData(response));
      }
    }

    protected _handlePRPCountryDataResponse(response: any) {
      if (this._validReqResponseData(response)) {
        // set user country data
        store.dispatch(commonDataActions.updatePRPCountries(response));
      }
    }

    protected _handleSitesResponse(response: any) {
      if (this._validReqResponseData(response)) {
        // set offices values
        store.dispatch(commonDataActions.updateSites(response));
      }
    }

    protected _handleSectionsResponse(response: any) {
      if (this._validReqResponseData(response)) {
        // set offices values
        store.dispatch(commonDataActions.updateSections(response));
      }
    }

    protected _handleUnicefUsersResponse(response: any) {
      if (this._validReqResponseData(response)) {
        // set setUsersData values
        store.dispatch(commonDataActions.updateUnicefUsers(response));
      }
    }

    protected _handleUserCountryDataResponse(response: any) {
      if (this._validReqResponseData(response)) {
        // set user country data
        store.dispatch(commonDataActions.updateUserCountryData(response[0]));
      }
    }
  }

  return CommonDataClass;
}

export default CommonDataMixin;
