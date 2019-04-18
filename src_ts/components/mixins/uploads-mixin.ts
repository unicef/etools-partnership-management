import pmpEdpoints from '../endpoints/endpoints.js';
import {store, RootState} from '../../store';
import { DECREASE_UNSAVED_UPLOADS, INCREASE_UPLOADS_IN_PROGRESS } from '../../actions/upload-status.js';
import { Constructor } from '../../typings/globals.types.js';
import { PolymerElement } from '@polymer/polymer';
/**
 * @polymer
 * @mixinFunction
 */
function UploadsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class uploadsClass extends baseClass {
    [x: string]: any;
    public static get properties() {
      return {
        uploadEndpoint: {
          type: String,
          value: function() {
            return pmpEdpoints.attachmentsUpload.url;
          }
        },
        uploadsInProgress: {
          type: Number
        },
        unsavedUploads: {
          type: Boolean
        }
      };
    }

    uploadsStateChanged(state: RootState) {
      if (state.uploadStatus!.unsavedUploads !== this.unsavedUploads) {
        this.unsavedUploads = state.uploadStatus!.unsavedUploads;
      }

      if (state.uploadStatus!.uploadsInProgress !== this.uploadsInProgress) {
        this.uploadsInProgress = state.uploadStatus!.uploadsInProgress;
      }
    }

    public _onUploadStarted(e: any) {
      e.stopImmediatePropagation();
      store.dispatch({type: INCREASE_UPLOADS_IN_PROGRESS});
    }

    public _onChangeUnsavedFile(e: any) {
      e.stopImmediatePropagation();
      store.dispatch({type: DECREASE_UNSAVED_UPLOADS});
    }
  };
  return uploadsClass;
}

export default UploadsMixin;
