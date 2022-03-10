import {LitElement} from 'lit-element';
import {store} from '../../../redux/store';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import EtoolsPageRefreshMixin from '@unicef-polymer/etools-behaviors/etools-page-refresh-mixin.js';
import EndpointsMixin from '../../endpoints/endpoints-mixin.js';
import {updateUserData} from '../../../redux/actions/user';
import {isEmptyObject} from '../../utils/utils';
import {fireEvent} from '../../utils/fire-custom-event';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {property} from '@polymer/decorators';
import {getAllPermissions} from './user-permissions';
import {UserPermissions, UserGroup, User, Constructor, EtoolsUser} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsPageRefreshMixin
 * @appliesMixin EndpointsMixin
 */
function UserDataMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class UserDataClass extends EndpointsMixin(EtoolsPageRefreshMixin(baseClass)) {
    @property({type: String})
    endpointName = 'myProfile';

    @property({type: Object, readOnly: true, notify: true})
    user!: User;

    @property({type: Object, readOnly: true})
    userGroups!: UserGroup[];

    @property({type: Object, readOnly: true, notify: true})
    permissions!: UserPermissions;

    public requestUserData() {
      sendRequest({
        endpoint: this.getEndpoint(this.endpointName)
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
      this._setUser(undefined);
      // @ts-ignore
      this._setPermissions(undefined);
    }

    protected _setUserData(data: any) {
      const _user = data;
      const _permissions = {};
      // @ts-ignore
      this._setUser(_user);
      const permissionsList = getAllPermissions();
      if (!isEmptyObject(data)) {
        // @ts-ignore
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
      // @ts-ignore
      this._setPermissions(_permissions);
    }
  }
  return UserDataClass;
}

export default UserDataMixin;
