import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import {connect} from "pwa-helpers/connect-mixin";
import {store} from "../../store";

// @ts-ignore
import EtoolsMixinFactory from "etools-behaviors/etools-mixin-factory.js";
// @ts-ignore
import EtoolsPageRefreshMixin from 'etools-behaviors/etools-page-refresh-mixin.js';
import EndpointsMixin from "../endpoints/endpoints-mixin.js";
// @ts-ignore
import UserPermisionsMixin from "user-permissions-mixin.js";
import {updateCurrentUser} from "../../actions/common-data";
import {isEmptyObject} from "../utils/utils";



/**
 * @polymer
 * @mixinFunction
 */
const UserDataMixin = dedupingMixin((baseClass: any) =>
    class extends connect(store)(EtoolsMixinFactory.combineMixins([
        EtoolsPageRefreshMixin,EndpointsMixin, UserPermisionsMixin], baseClass) as typeof baseClass) {

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

      public endpointName : string = 'myProfile';

      public requestUserData() {
        this.sendRequest({
          endpoint: this.getEndpoint(this.endpointName)
          // @ts-ignore
        }).then((res) => {
          // TODO: check response to make sure it contains a valid user
          this._setUserData(res);
          // this.dispatch('setCurrentUser', res);
          this.store.dispatch(updateCurrentUser(res));
          this.checkDexieCountryIsUserCountry(res);
          // @ts-ignore
        }).catch((error) => {
          this._resetUserAndPermissions();
          this.logError('Error occurred on logged user data request', 'user request', error);
          if (error.status === 403) {
            this.fireEvent('forbidden', {bubbles: true, composed: true});
          }
        });
      }
// @ts-ignore
      public checkDexieCountryIsUserCountry(user) {
        let country = {
          id: user.country.id,
          name: user.country.name
        };
        window.EtoolsPmpApp.DexieDb.ajaxDefaultDataTable.where('cacheKey').equals('currentCountry').toArray()
        // @ts-ignore
            .then((response) => {
              if (response.length > 0) {
                if (parseInt(response[0].data.id) !== parseInt(user.country.id)) {
                  let eventPayload = {
                    message: 'Please wait while data is refreshed...',
                    active: true,
                    loadingSource: 'country-update'
                  };
                  this.fireEvent('global-loading', eventPayload);
                  this.refresh();
                }
              } else {
                this.addCountryInIndexedDb(country);
              }
            });
      }
// @ts-ignore
      public addCountryInIndexedDb(country) {
        let dataToCache = {
          cacheKey: 'currentCountry',
          data: country
        };
        window.EtoolsPmpApp.DexieDb.ajaxDefaultDataTable.put(dataToCache);
      }
// @ts-ignore
      protected _findGroup(groupName) {
        // @ts-ignore
        return this.userGroups.find((grp) =>{
          return grp.name === groupName;
        });

        // return _.find(this.userGroups, function(grp) {
        //   return grp.name === groupName;
        // });
      }

      protected _resetUserAndPermissions() {
        this._setUser(undefined);
        this._setPermissions(undefined);
      }
// @ts-ignore
      protected _setUserData(data) {
        let _user = data;
        let _permissions = {};
        this._setUser(_user);
        let permissionsList = this.getAllPermissions();
        if (!isEmptyObject(data)) {
          this._setUserGroups(_user.groups);
          // @ts-ignore
          permissionsList.defaultPermissions.forEach(function(perm) {
            // @ts-ignore
            _permissions[perm] = true;
          });
          if (this._findGroup('UNICEF User')) {
            // @ts-ignore
            permissionsList.unicefUserPermissions.forEach(function(perm) {
              // @ts-ignore
              _permissions[perm] = true;
            });
          }
          if (this._findGroup('Partnership Manager')) {
            // @ts-ignore
            permissionsList.partnershipManagerPermissions.forEach(function(perm) {
              // @ts-ignore
              _permissions[perm] = true;
            });
          }
          if (this._findGroup('PME')) {
            // @ts-ignore
            permissionsList.PMEPermissions.forEach(function(perm) {
              // @ts-ignore
              _permissions[perm] = true;
            });
          }
          if (this._findGroup('ICT')) {
            // @ts-ignore
            permissionsList.ICTPermissions.forEach(function(perm) {
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

    });

export default UserDataMixin;
