import pmpEdpoints from '../../endpoints/endpoints.js';
import {store, RootState} from '../../../redux/store';
import {
  DECREASE_UNSAVED_UPLOADS,
  INCREASE_UPLOADS_IN_PROGRESS,
  RESET_UNSAVED_UPLOADS,
  RESET_UPLOADS_IN_PROGRESS
} from '../../../redux/actions/upload-status';
import {Constructor} from '@unicef-polymer/etools-types';
import {LitElement, property} from 'lit-element';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {translate} from 'lit-translate';

/**
 * @polymer
 * @mixinFunction
 */
function UploadsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class UploadsClass extends baseClass {
    @property({type: String})
    uploadEndpoint: string = pmpEdpoints.attachmentsUpload.url;

    @property({type: Number})
    uploadsInProgress!: number;

    @property({type: Number})
    unsavedUploads!: number;

    uploadsStateChanged(state: RootState) {
      if (state.uploadStatus!.unsavedUploads !== this.unsavedUploads) {
        this.unsavedUploads = state.uploadStatus!.unsavedUploads;
      }

      if (state.uploadStatus!.uploadsInProgress !== this.uploadsInProgress) {
        this.uploadsInProgress = state.uploadStatus!.uploadsInProgress;
      }
    }

    public existsUploadsUnsavedOrInProgress(): boolean {
      return Number(this.uploadsInProgress) > 0 || Number(this.unsavedUploads) > 0;
    }

    public async confirmLeaveUploadInProgress(): Promise<boolean> {
      const confirmed = await openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: translate('LEAVE_UPLOAD_IN_PROGRESS'),
          confirmBtnText: translate('LEAVE'),
          cancelBtnText: translate('STAY')
        }
      }).then(({confirmed}) => {
        return confirmed;
      });

      if (confirmed) {
        store.dispatch({type: RESET_UNSAVED_UPLOADS});
        store.dispatch({type: RESET_UPLOADS_IN_PROGRESS});
      }
      return confirmed;
    }

    public _onUploadStarted(e: any) {
      e.stopImmediatePropagation();
      store.dispatch({type: INCREASE_UPLOADS_IN_PROGRESS});
    }

    public _onChangeUnsavedFile(e: any) {
      e.stopImmediatePropagation();
      store.dispatch({type: DECREASE_UNSAVED_UPLOADS});
    }
  }
  return UploadsClass;
}

export default UploadsMixin;
