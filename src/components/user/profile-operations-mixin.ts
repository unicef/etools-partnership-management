import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
// @ts-ignore
import UserDataMixin from "./user-data-mixin.js";
// @ts-ignore
import EtoolsMixinFactory from "etools-behaviors/etools-mixin-factory.js";
import AjaxErrorsParserMixin from "../mixins/ajax-errors-parser-mixin.js";
import {isEmptyObject} from "../utils/utils";
import {store} from "../../store";
import {setCurrentUser} from "../../actions/common-data.js";



/**
 * @polymer
 * @mixinFunction
 * @appliesMixin UserDataMixin
 * @appliesMixin AjaxErrorsParserMixin
 */
const ProfileOperations = dedupingMixin((baseClass: any) =>
    class extends (EtoolsMixinFactory.combineMixins([
        UserDataMixin, AjaxErrorsParserMixin], baseClass) as typeof baseClass) {

      static get properties() {
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

        this.sendRequest(config).then(function(resp: any) {
          self._handleResponse(resp);
        }).catch(function(error: any) {
          self.parseRequestErrorsAndShowAsToastMsgs(error);
          self._hideProfileSaveLoadingMsg();
        });
      }

      public saveProfile(profile: any) {
        if (isEmptyObject(profile)) {
          // empty profile means no changes found
          this.fireEvent('toast', {
            text: 'There is nothing to save. No change detected on your profile.',
            showCloseBtn: true
          });
          return;
        }

        this.fireEvent('global-loading', {
          message: 'Saving...',
          active: true,
          loadingSource: this.profileSaveLoadingMsgSource
        });
        this.set('_saveActionInProgress', true);
        this._dispatchSaveProfileRequest(profile);
      }

      protected _handleResponse(response: any) {
        this.dispatch('setCurrentUser', response);
        // store.dispatch(setCurrentUser(response));
        this._hideProfileSaveLoadingMsg();
      }

      protected _hideProfileSaveLoadingMsg() {
        if (this._saveActionInProgress) {
          this.fireEvent('global-loading', {
            active: false,
            loadingSource: this.profileSaveLoadingMsgSource
          });
          this.set('_saveActionInProgress', false);
        }
      }

    });

export default ProfileOperations;
