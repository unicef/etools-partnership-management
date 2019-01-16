import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import {connect} from "pwa-helpers/connect-mixin";
import {store} from "../../store";

import {updateCountryProgrammes, updateDisaggregations} from '../../actions/common-data.js';

// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EndpointsMixin from '../endpoints/endpoints-mixin.js';

// TODO: polymer 3 - integrate environments flags mixin

/**
 * @polymer
 * @mixinFunction
 */
const CommonData = dedupingMixin((baseClass: any) =>
    class extends connect(store)(EtoolsMixinFactory.combineMixins([EndpointsMixin], baseClass) as typeof baseClass) {

      public static get properties() {
        return {
          commonDataEndpoints: Object
        };
      }

      public commonDataEndpoints: {
        pmp: string[],
        pmpPrpSections: string[],
        prp: string[]
      } = {
        pmp: ['countryProgrammes', 'dropdownsPmp', 'dropdownsStatic', 'locations', 'offices',
          'sections', 'unicefUsers', 'userCountryDetails'],
        pmpPrpSections: ['disaggregations'],
        prp: ['getPRPCountries']
      };

      public loadCommonData() {
        // get PMP static data
        this._getStaticData(this.commonDataEndpoints.pmp);
        this._handlePrpData();
      }

      // @ts-ignore
      protected _getStaticData(endpointsNames: string[]) {
        endpointsNames.forEach((endpointName: string) => {
          this._makeRequest(endpointName, this._getEndpointSuccessHandler(endpointName), this._errorHandler);
        });
      }

      protected _handlePrpData() {
        // this._waitForEnvFlagsToLoad().then(() => {
        //   if (this.showPrpReports()) {
        //     this._getStaticData(this.commonDataEndpoints.pmpPrpSections);
        //     if (this.prpServerIsOn()) {
        //       this._getStaticData(this.commonDataEndpoints.prp);
        //     }
        //   }
        // });
      }

      protected _makeRequest(endpointName: string, successHandler: any, errorHandler: any) {
        this.fireRequest(endpointName, {}).then((resp: any) => {
          successHandler.bind(this, resp)();
        }).catch((error: any) => {
          errorHandler.bind(this, error)();
        });
      }

      protected _errorHandler(err: any) {
        this.logError('Error getting static data', 'static-common-data', err);
      }

      protected _getEndpointSuccessHandler(endpointName: string) {
        switch (endpointName) {
          case 'countryProgrammes':
            return this._handleCountryProgrammesResponse;
            //   case 'dropdownsPmp':
            //     return this._handleDropdownsPmpResponse;
            //   case 'dropdownsStatic':
            //     return this._handleDropdownsStaticResponse;
            //   case 'locations':
            //     return this._handleLocationsResponse;
            //   case 'offices':
            //     return this._handleOfficesResponse;
            //   case 'sections':
            //     return this._handleSectionsResponse;
            //   case 'unicefUsers':
            //     return this._handleUnicefUsersResponse;
            //   case 'userCountryDetails':
            //     return this._handleUserCountryDataResponse;
          case 'disaggregations':
            return this._handleDisaggregationsResponse;
            //   case 'getPRPCountries':
            //     return this._handlePRPCountryDataResponse;
          default:
            return null;
        }
      }

      protected _handleCountryProgrammesResponse(response: any) {
        if (response instanceof Array && response.length > 0) {
          // set setUsersData values
          store.dispatch(updateCountryProgrammes(response));
        }
      }

      protected _handleDisaggregationsResponse(response: any) {
        if (response instanceof Array && response.length > 0) {
          store.dispatch(updateDisaggregations(response));
        }
      }

    });

export default CommonData;
