import {LitElement, property} from 'lit-element';
import {store} from '../../../redux/store';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import EtoolsPageRefreshMixinLit from '@unicef-polymer/etools-behaviors/etools-page-refresh-mixin-lit.js';
import {updateUserData} from '../../../redux/actions/user';
import {isEmptyObject} from '../../utils/utils';
import {fireEvent} from '../../utils/fire-custom-event';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {getAllPermissions} from './user-permissions';
import {UserPermissions, UserGroup, User, Constructor, EtoolsUser} from '@unicef-polymer/etools-types';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../endpoints/endpoints';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsPageRefreshMixin
 * @appliesMixin EndpointsMixin
 */
function UserDataMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class UserDataClass extends EndpointsLitMixin(EtoolsPageRefreshMixinLit(baseClass)) {
    @property({type: String})
    endpointName = 'myProfile';

    @property({type: Object})
    user!: User;

    @property({type: Object})
    userGroups!: UserGroup[];

    @property({type: Object})
    permissions!: UserPermissions;

    public requestUserData() {
      sendRequest({
        endpoint: this.getEndpoint(pmpEdpoints, this.endpointName)
      })
        .then((res: any) => {
          if (this.redirectToEPDIfNeccessary(res)) {
            return;
          }
          // TODO: check response to make sure it contains a valid user
          this._setUserData(res);

          // TODO - storing in state.user also to match with intervention-tab-pages expectations
          store.dispatch(updateUserData(res));

          this.checkDexieCountryIsUserCountry(res);
        })
        .catch((error: any) => {
          this._resetUserAndPermissions();
          logError('Error occurred on logged user data request', 'user request', error);
          if (error.status === 403) {
            fireEvent(this, 'forbidden', {bubbles: true, composed: true});
          }
        });
    }

    redirectToEPDIfNeccessary(user: EtoolsUser) {
      if (!user.is_unicef_user) {
        if (window.location.href.includes('/interventions')) {
          // preserve url
          window.location.href = window.location.href.replace('pmp', 'epd');
        } else {
          window.location.href = window.location.origin + '/epd/';
        }
        return true;
      }
      return false;
    }

    public checkDexieCountryIsUserCountry(user: any) {
      const country = {
        id: user.country.id,
        name: user.country.name
      };
      window.EtoolsPmpApp.DexieDb.ajaxDefaultDataTable
        .where('cacheKey')
        .equals('currentCountry')
        .toArray()
        .then((response: any) => {
          if (response.length > 0) {
            if (parseInt(response[0].data.id) !== parseInt(user.country.id)) {
              const eventPayload = {
                message: 'Please wait while data is refreshed...',
                active: true,
                loadingSource: 'country-update'
              };
              fireEvent(this, 'global-loading', eventPayload);
              // @ts-ignore TODOOO
              this.refresh();
            }
          } else {
            this.addCountryInIndexedDb(country);
          }
        });
    }

    public addCountryInIndexedDb(country: any) {
      const dataToCache = {
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
      // @ts-ignore
      this.user = undefined;
      // @ts-ignore
      this.permissions = undefined;
    }

    protected _setUserData(data: any) {
      const _user = data;
      const _permissions = {};
      // @ts-ignore
      this.user = _user;
      const permissionsList = getAllPermissions();
      if (!isEmptyObject(data)) {
        // @ts-ignore
        this.userGroups = _user.groups;
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
      // @ts-ignore
      this.permissions = _permissions;
    }
  }
  return UserDataClass;
}

export default UserDataMixin;
