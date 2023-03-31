import {LitElement, property} from 'lit-element';
import {store} from '../../../redux/store';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/general.util';

import EndpointsMixin from '../../endpoints/endpoints-mixin.js';
import UserDataMixin from './user-data-mixin.js';
import {updateUserData} from '../../../redux/actions/user';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {Constructor} from '@unicef-polymer/etools-types';
import {get as getTranslation} from 'lit-translate';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin UserDataMixin
 */
function ProfileOperationsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ProfileOperationsClass extends EndpointsMixin(UserDataMixin(baseClass)) {
    @property({type: Boolean})
    _saveActionInProgress = false;

    @property({type: String})
    profileSaveLoadingMsgSource = 'profile-modal';

    protected _dispatchSaveProfileRequest(profile: any) {
      const config = {
        // @ts-ignore *defined in component
        endpoint: this.getEndpoint(this.endpointName),
        method: 'PATCH',
        body: profile
      };

      sendRequest(config)
        .then((resp: any) => {
          this._handleResponse(resp);
        })
        .catch((error: any) => {
          parseRequestErrorsAndShowAsToastMsgs(error, this);
          this._hideProfileSaveLoadingMsg();
        });
    }

    public saveProfile(profile: any) {
      if (isEmptyObject(profile)) {
        // empty profile means no changes found
        fireEvent(this, 'toast', {
          text: getTranslation('CHANGES_ARE_SAVED')
        });
        return;
      }

      fireEvent(this, 'global-loading', {
        message: getTranslation('GENERAL.SAVING_DATA'),
        active: true,
        loadingSource: this.profileSaveLoadingMsgSource
      });
      this._saveActionInProgress = true;
      this._dispatchSaveProfileRequest(profile);
    }

    protected _handleResponse(response: any) {
      store.dispatch(updateUserData(response));
      this._hideProfileSaveLoadingMsg();
    }

    protected _hideProfileSaveLoadingMsg() {
      if (this._saveActionInProgress) {
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: this.profileSaveLoadingMsgSource
        });
        this._saveActionInProgress = false;
      }
    }
  }

  return ProfileOperationsClass;
}

export default ProfileOperationsMixin;
