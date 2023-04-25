import {store} from '../../../redux/store';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {updateUserData} from '../../../redux/actions/user';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {getAllPermissions} from './user-permissions';
import {UserPermissions, UserGroup, User, Constructor, EtoolsUser} from '@unicef-polymer/etools-types';
import {setActiveLanguage} from '../../../redux/actions/active-language';
import {property} from 'lit-element';
import pmpEdpoints from '../../endpoints/endpoints';
import {languageIsAvailableInApp} from '../../utils/language';
import {DexieRefresh} from '@unicef-polymer/etools-utils/dist/singleton/dexie-refresh';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsPageRefreshMixinLit
 * @appliesMixin EndpointsMixin
 */
function UserDataMixin<T extends Constructor<any>>(baseClass: T) {
  class UserDataClass extends baseClass {
    @property({type: Object})
    user!: User;

    @property({type: Object})
    userGroups!: UserGroup[];

    @property({type: Object})
    permissions!: UserPermissions;

    public requestUserData() {
      sendRequest({
        endpoint: pmpEdpoints.myProfile
      })
        .then((res: any) => {
          if (this.redirectToEPDIfNeccessary(res)) {
            return;
          }
          // TODO: check response to make sure it contains a valid user
          this._setUserData(res);

          // TODO - storing in state.user also to match with intervention-tab-pages expectations
          store.dispatch(updateUserData(res));

          this.setCurrentLanguage(res.preferences?.language);

          this.checkDexieCountryIsUserCountry(res);
        })
        .catch((error: any) => {
          this._resetUserAndPermissions();
          EtoolsLogger.error('Error occurred on logged user data request', 'user request', error);
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

    setCurrentLanguage(lngCode: string) {
      let currentLanguage = '';
      if (lngCode) {
        lngCode = lngCode.substring(0, 2);
        if (languageIsAvailableInApp(lngCode)) {
          currentLanguage = lngCode;
        } else {
          console.log(`User profile language ${lngCode} missing`);
        }
      }
      if (!currentLanguage) {
        const storageLang = localStorage.getItem('defaultLanguage');
        if (storageLang && languageIsAvailableInApp(storageLang)) {
          currentLanguage = storageLang;
        }
      }
      if (!currentLanguage) {
        currentLanguage = 'en';
      }
      store.dispatch(setActiveLanguage(currentLanguage));
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
              DexieRefresh.refresh();
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
