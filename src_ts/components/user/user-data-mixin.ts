// import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import { store } from "../../store";
import { sendRequest } from "@unicef-polymer/etools-ajax/etools-ajax-request";
import EtoolsPageRefreshMixin from "@unicef-polymer/etools-behaviors/etools-page-refresh-mixin.js";
import EndpointsMixin from "../endpoints/endpoints-mixin.js";
import { updateCurrentUser } from "../../actions/common-data";
import { isEmptyObject } from "../utils/utils";
import { fireEvent } from "../utils/fire-custom-event";
import { logError } from "@unicef-polymer/etools-behaviors/etools-logging";
import {
  Constructor,
  User,
  UserGroup,
  UserPermissions,
} from "../../typings/globals.types";
import { PolymerElement } from "@polymer/polymer";
import { property } from "@polymer/decorators";
import { getAllPermissions } from "./user-permissions";

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsPageRefreshMixin
 * @appliesMixin EndpointsMixin
 */
function UserDataMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class UserDataClass extends EndpointsMixin(
    EtoolsPageRefreshMixin(baseClass)
  ) {
    @property({ type: String })
    endpointName: string = "myProfile";

    @property({ type: Object, readOnly: true, notify: true })
    user!: User;

    @property({ type: Object, readOnly: true })
    userGroups!: UserGroup[];

    @property({ type: Object, readOnly: true, notify: true })
    permissions!: UserPermissions;

    public requestUserData() {
      sendRequest({
        endpoint: this.getEndpoint(this.endpointName),
      })
        .then((res: any) => {
          // TODO: check response to make sure it contains a valid user
          this._setUserData(res);
          store.dispatch(updateCurrentUser(res));
          this.checkDexieCountryIsUserCountry(res);
        })
        .catch((error: any) => {
          this._resetUserAndPermissions();
          logError(
            "Error occurred on logged user data request",
            "user request",
            error
          );
          if (error.status === 403) {
            fireEvent(this, "forbidden", { bubbles: true, composed: true });
          }
        });
    }

    public checkDexieCountryIsUserCountry(user: any) {
      const country = {
        id: user.country.id,
        name: user.country.name,
      };
      window.EtoolsPmpApp.DexieDb.ajaxDefaultDataTable
        .where("cacheKey")
        .equals("currentCountry")
        .toArray()
        .then((response: any) => {
          if (response.length > 0) {
            if (parseInt(response[0].data.id) !== parseInt(user.country.id)) {
              const eventPayload = {
                message: "Please wait while data is refreshed...",
                active: true,
                loadingSource: "country-update",
              };
              fireEvent(this, "global-loading", eventPayload);
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
        cacheKey: "currentCountry",
        data: country,
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
        if (this._findGroup("UNICEF User")) {
          permissionsList.unicefUserPermissions.forEach(function (perm: any) {
            // @ts-ignore
            _permissions[perm] = true;
          });
        }
        if (this._findGroup("Partnership Manager")) {
          permissionsList.partnershipManagerPermissions.forEach(function (
            perm: any
          ) {
            // @ts-ignore
            _permissions[perm] = true;
          });
        }
        if (this._findGroup("PME")) {
          permissionsList.PMEPermissions.forEach(function (perm: any) {
            // @ts-ignore
            _permissions[perm] = true;
          });
        }
        if (this._findGroup("ICT")) {
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
