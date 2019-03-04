import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import {connect} from "pwa-helpers/connect-mixin";
import {store} from "../../store";
import {isEmptyObject} from "../utils/utils";
import EtoolsMixinFactory from "etools-behaviors/etools-mixin-factory.js";

import AjaxErrorsParserMixin from "../mixins/ajax-errors-parser-mixin.js";
import EndpointsMixin from "../endpoints/endpoints-mixin.js";
import UserDataMixin from "./user-data-mixin.js";
import {updateCurrentUser} from "../../actions/common-data.js";

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin UserDataMixin
 * @appliesMixin AjaxErrorsParserMixin
 */
const ProfileOperations = dedupingMixin((baseClass: any) =>
    class extends connect(store)(EtoolsMixinFactory.combineMixins([
      EndpointsMixin, UserDataMixin, AjaxErrorsParserMixin], baseClass) as typeof baseClass) {

      public static get properties() {
        return {
          _saveActionInProgress: Boolean,
          profileSaveLoadingMsgSource: String,
        };
      }

      protected _saveActionInProgress: boolean = false;
      public profileSaveLoadingMsgSource: string = 'profile-modal';


      protected _dispatchSaveProfileRequest(profile: any) {
        let self = this;
        let config = {
          endpoint: this.getEndpoint(this.endpointName),
          method: 'PATCH',
          body: profile
        };

        this.sendRequest(config).then(function (resp: any) {
          self._handleResponse(resp);
        }).catch(function (error: any) {
          self.parseRequestErrorsAndShowAsToastMsgs(error);
          self._hideProfileSaveLoadingMsg();
        });
      }

      public saveProfile(profile: any) {
        if (isEmptyObject(profile)) {
          // empty profile means no changes found
          fireEvent(this, 'toast', {
            text: 'All changes are saved.',
            showCloseBtn: false
          });
          return;
        }

        fireEvent(this, 'global-loading', {
          message: 'Saving...',
          active: true,
          loadingSource: this.profileSaveLoadingMsgSource
        });
        this.set('_saveActionInProgress', true);
        this._dispatchSaveProfileRequest(profile);
      }

      protected _handleResponse(response: any) {
        store.dispatch(updateCurrentUser(response));
        this._hideProfileSaveLoadingMsg();
      }

      protected _hideProfileSaveLoadingMsg() {
        if (this._saveActionInProgress) {
          fireEvent(this, 'global-loading', {
            active: false,
            loadingSource: this.profileSaveLoadingMsgSource
          });
          this.set('_saveActionInProgress', false);
        }
      }

    });

export default ProfileOperations;
