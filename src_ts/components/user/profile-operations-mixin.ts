import {store} from '../../store';
import {isEmptyObject} from '../utils/utils';

import EndpointsMixin from '../endpoints/endpoints-mixin.js';
import UserDataMixin from './user-data-mixin.js';
import {updateCurrentUser} from '../../actions/common-data.js';
import {fireEvent} from '../utils/fire-custom-event';
import {parseRequestErrorsAndShowAsToastMsgs} from '../utils/ajax-errors-parser.js';
import {Constructor} from '../../typings/globals.types';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin UserDataMixin
 */
function ProfileOperationsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class ProfileOperationsClass extends EndpointsMixin(UserDataMixin(baseClass)) {

    @property({type: Boolean})
    _saveActionInProgress: boolean = false;

    @property({type: String})
    profileSaveLoadingMsgSource: string = 'profile-modal';

    protected _dispatchSaveProfileRequest(profile: any) {
      const self = this;
      const config = {
        // @ts-ignore *defined in component
        endpoint: this.getEndpoint(this.endpointName),
        method: 'PATCH',
        body: profile
      };

      this.sendRequest(config).then(function(resp: any) {
        self._handleResponse(resp);
      }).catch(function(error: any) {
        parseRequestErrorsAndShowAsToastMsgs(error, self);
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

  }

  return ProfileOperationsClass;
}

export default ProfileOperationsMixin;
