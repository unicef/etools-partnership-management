import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {store} from '../../../redux/store';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

import EndpointsMixin from '../../endpoints/endpoints-mixin.js';
import UserDataMixin from './user-data-mixin.js';
import {updateUserData} from '../../../redux/actions/user';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {Constructor} from '@unicef-polymer/etools-types';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';

/**
 * @LitElement
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
