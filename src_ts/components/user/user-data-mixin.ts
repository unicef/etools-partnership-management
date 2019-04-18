//import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import {store} from '../../store';

import EtoolsPageRefreshMixin from 'etools-behaviors/etools-page-refresh-mixin.js';
import EndpointsMixin from '../endpoints/endpoints-mixin.js';
import UserPermisionsMixin from './user-permissions-mixin.js';
import {updateCurrentUser} from '../../actions/common-data';
import {isEmptyObject} from '../utils/utils';
import { fireEvent } from '../utils/fire-custom-event';
import { logError } from 'etools-behaviors/etools-logging';
import { Constructor } from '../../typings/globals.types';
import { PolymerElement } from '@polymer/polymer';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsPageRefreshMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin UserPermisionsMixin
 */
function UserDataMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
    // @ts-ignore
    class userDataClass extends EndpointsMixin(UserPermisionsMixin(EtoolsPageRefreshMixin(baseClass))) {

      static get properties() {
        return {
          endpointName: String,
          user: {
            type: Object,
            readOnly: true,
            notify: true
          },
          userGroups: {
            type: Array,
            readOnly: true
          },
          permissions: {
            type: Object,
            readOnly: true,
            notify: true
          }
        };
      }

      public endpointName: string = 'myProfile';

      public requestUserData() {
        this.sendRequest({
          endpoint: this.getEndpoint(this.endpointName)
        }).then((res: any) => {
          // TODO: check response to make sure it contains a valid user
          this._setUserData(res);
          store.dispatch(updateCurrentUser(res));
          this.checkDexieCountryIsUserCountry(res);
        }).catch((error: any) => {
          this._resetUserAndPermissions();
          logError('Error occurred on logged user data request', 'user request', error);
          if (error.status === 403) {
            fireEvent(this, 'forbidden', {bubbles: true, composed: true});
          }
        });
      }

      public checkDexieCountryIsUserCountry(user: any) {
        let country = {
          id: user.country.id,
          name: user.country.name
        };
        window.EtoolsPmpApp.DexieDb.ajaxDefaultDataTable.where('cacheKey').equals('currentCountry').toArray()
            .then((response: any) => {
              if (response.length > 0) {
                if (parseInt(response[0].data.id) !== parseInt(user.country.id)) {
                  let eventPayload = {
                    message: 'Please wait while data is refreshed...',
                    active: true,
                    loadingSource: 'country-update'
                  };
                  fireEvent(this, 'global-loading', eventPayload);
                  this.refresh();
                }
              } else {
                this.addCountryInIndexedDb(country);
              }
            });
      }

      public addCountryInIndexedDb(country: any) {
        let dataToCache = {
          cacheKey: 'currentCountry',
          data: country
        };
        window.EtoolsPmpApp.DexieDb.ajaxDefaultDataTable.put(dataToCache);
      }

      protected _findGroup(groupName: any) {
        return this.userGroups.find((grp: any) => {
          return grp.name === groupName;
        });
      }

      protected _resetUserAndPermissions() {
        this._setUser(undefined);
        this._setPermissions(undefined);
      }

      protected _setUserData(data: any) {
        let _user = data;
        let _permissions = {};
        this._setUser(_user);
        let permissionsList = this.getAllPermissions();
        if (!isEmptyObject(data)) {
          this._setUserGroups(_user.groups);
          permissionsList.defaultPermissions.forEach(function (perm: any) {
            // @ts-ignore
            _permissions[perm] = true;
          });
          if (this._findGroup('UNICEF User')) {
            permissionsList.unicefUserPermissions.forEach(function (perm: any) {
              // @ts-ignore
              _permissions[perm] = true;
            });
          }
          if (this._findGroup('Partnership Manager')) {
            permissionsList.partnershipManagerPermissions.forEach(function (perm: any) {
              // @ts-ignore
              _permissions[perm] = true;
            });
          }
          if (this._findGroup('PME')) {
            permissionsList.PMEPermissions.forEach(function (perm: any) {
              // @ts-ignore
              _permissions[perm] = true;
            });
          }
          if (this._findGroup('ICT')) {
            permissionsList.ICTPermissions.forEach(function (perm: any) {
              // @ts-ignore
              _permissions[perm] = true;
            });
          }
        } else {
          // TODO: we need to redirect to login page if no user data received
          // permissionsList.superPermissions.forEach(function(perm) {
          //  _permissions[perm] = true;
          // });
        }
        this._setPermissions(_permissions);
      }

    };
    return userDataClass;
}

export default UserDataMixin;
