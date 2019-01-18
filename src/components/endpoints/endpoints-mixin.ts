import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import {connect} from 'pwa-helpers/connect-mixin.js';

// @ts-ignore
import EtoolsAjaxRequestMixin from 'etools-ajax/etools-ajax-request-mixin.js';
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import {RootState, store} from "../../store";

import pmpEndpoints from './endpoints.js';
import {tokenEndpointsHost, tokenStorageKeys, getTokenEndpoints} from '../../config/config.js';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsAjaxRequestMixin
 * @appliesMixin EtoolsLogsMixin
 */
const EndpointsMixin = dedupingMixin((baseClass: any) =>
    class extends connect(store)(EtoolsAjaxRequestMixin(EtoolsLogsMixin(baseClass))) {

      // TODO: polymer 3 - remove properties from here
      static get properties() {
        return {
          prpCountries: Object,
          currentUser: Object
        };
      }

      public stateChanged(state: RootState) {
        this.prpCountries = state.commonData!.PRPCountryData;
        this.currentUser = state.commonData!.currentUser;
      }

      protected _getPrpCountryId() {
        let currentCountry = this.currentUser.countries_available.find((country: object) => {
          return (country as any).id === this.currentUser.country.id;
        });
        let prpCountry = this.prpCountries.find((prpCountry: object) => {
          return (prpCountry as any).business_area_code === currentCountry.business_area_code;
        });

        if (!prpCountry) {
          let countryNotFoundInPrpWarning = 'Error: ' + this.currentUser.country.name + ' country data was ' +
              'not found in the available PRP countries by business_area_code!';
          throw new Error(countryNotFoundInPrpWarning);
        }

        return prpCountry.id;
      }

      protected _urlTemplateHasCountryId(template: string): boolean {
        return template.indexOf('<%=countryId%>') > -1;
      }

      public getEndpoint(endpointName: string, data?: object) {
        let endpoint = JSON.parse(JSON.stringify((pmpEndpoints as any)[endpointName]));
        let authorizationTokenMustBeAdded = this.authorizationTokenMustBeAdded(endpoint);
        let baseSite = authorizationTokenMustBeAdded
            ? tokenEndpointsHost(endpoint.token)
            : window.location.origin;

        if (this._hasUrlTemplate(endpoint)) {
          if (data && authorizationTokenMustBeAdded && this._urlTemplateHasCountryId(endpoint.template)) {
            // we need to get corresponding PRP country ID
            (data as any).countryId = this._getPrpCountryId();
          }
          endpoint.url = baseSite + this._generateUrlFromTemplate(endpoint.template, data);
        } else {
          if (endpoint.url.indexOf(baseSite) === -1) {
            endpoint.url = baseSite + endpoint.url;
          }
        }

        return endpoint;
      }

      protected _generateUrlFromTemplate(tmpl: string, data: object | undefined) {
        if (!tmpl) {
          throw new Error('To generate URL from endpoint url template you need valid template string');
        }

        if (data && Object.keys(data).length > 0) {
          for(let k in data) {
            let replacePattern = /<%=${k}%>/gi;
            tmpl = tmpl.replace(replacePattern, (data as any)[k]);
          }
        }

        return tmpl;
      }

      protected _hasUrlTemplate(endpoint: object) {
        return endpoint && endpoint.hasOwnProperty('template') && (endpoint as any).template !== '';
      }

      protected _getDeferrer() {
        // create defer object (utils behavior contains to many other unneeded methods to be used)
        let defer: any = {};
        defer.promise = new Promise(function (resolve, reject) {
          defer.resolve = resolve;
          defer.reject = reject;
        });
        return defer;
      }

      public authorizationTokenMustBeAdded(endpoint: object): boolean {
        return endpoint && ('token' in endpoint);
      }

      public getCurrentToken(tokenKey: string) {
        return localStorage.getItem((tokenStorageKeys as any)[tokenKey]);
      }

      public storeToken(tokenKey: string, tokenBase64Encoded: string) {
        localStorage.setItem((tokenStorageKeys as any)[tokenKey], tokenBase64Encoded);
      }

      public decodeBase64Token(encodedToken: string) {
        let base64Url = encodedToken.split('.')[1];
        let base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
      }

      public tokenIsValid(token: string) {
        let decodedToken = this.decodeBase64Token(token);
        return Date.now() < decodedToken.exp;
      }

      public getAuthorizationHeader(token: string) {
        return {'Authorization': 'JWT ' + token};
      }

      public requestToken(endpoint: object) {
        return this.sendRequest({
          endpoint: endpoint
        });
      }

      protected _buildOptionsWithTokenHeader(options: any, token: string) {
        options.headers = this.getAuthorizationHeader(token);
        delete options.endpoint.token; // cleanup token from endpoint object
        return options;
      }

      public getTokenEndpointName(tokenKey: string) {
        return (getTokenEndpoints as any)[tokenKey];
      }

      addTokenToRequestOptions(endpointName: string, data: object) {
        let options: any = {};
        try {
          options.endpoint = this.getEndpoint(endpointName, data);
        } catch (e) {
          return Promise.reject(e);
        }

        // create defer object (utils behavior contains to many other unneeded methods to be used)
        let defer = this._getDeferrer();

        if (this.authorizationTokenMustBeAdded(options.endpoint)) {
          let tokenKey = options.endpoint.token;
          let token = this.getCurrentToken(tokenKey);
          // because we could have other tokens too
          if (token && this.tokenIsValid(token)) {
            // token exists and it's still valid
            options = this._buildOptionsWithTokenHeader(options, token);
            defer.resolve(options);
          } else {
            // request new token
            let self = this;
            let tokenEndpointName = this.getTokenEndpointName(tokenKey);
            this.requestToken(this.getEndpoint(tokenEndpointName)).then(function (response: any) {
              self.storeToken(options.endpoint.token, response.token);
              options = self._buildOptionsWithTokenHeader(options, response.token);
              defer.resolve(options);
            }).catch(function (error: any) {
              // request for getting a new token failed
              defer.reject(error);
            });
          }
        } else {
          defer.resolve(options);
        }
        return defer.promise;
      }

      _addAdditionalRequestOptions(options: any, requestAdditionalOptions: any) {
        if (requestAdditionalOptions) {
          Object.keys(requestAdditionalOptions).forEach(function (key) {
            switch (key) {
              case 'endpoint':
                break;
              case 'headers':
                // add additional headers
                options.headers = Object.assign({}, options.headers, requestAdditionalOptions[key]);
                break;
              default:
                options[key] = requestAdditionalOptions[key];
            }
          });
        }
        return options;
      }

      fireRequest(endpoint: any, endpointTemplateData: object,
                  requestAdditionalOptions: object, activeReqKey: string) {
        if (!endpoint) {
          this.logError('Endpoint name is missing.', 'Endpoints:fireRequest');
          return;
        }
        let defer = this._getDeferrer();
        let self = this;
        this.addTokenToRequestOptions(endpoint, endpointTemplateData)
            .then(function (requestOptions: any) {
              let options = self._addAdditionalRequestOptions(requestOptions, requestAdditionalOptions);
              return self.sendRequest(options, activeReqKey);
            })
            .then(function (endpointResponse: any) {
              defer.resolve(endpointResponse);
            })
            .catch(function (error: any) {
              defer.reject(error);
            });
        return defer.promise;
      }

    });

export default EndpointsMixin;
