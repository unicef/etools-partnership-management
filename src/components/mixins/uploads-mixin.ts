import pmpEdpoints from '../endpoints/endpoints.js';
import {connect} from "pwa-helpers/connect-mixin";
import {store, RootState} from "../../store";
import { DECREASE_UNSAVED_UPLOADS, INCREASE_UPLOADS_IN_PROGRESS } from '../../actions/upload-status.js';
/**
 * @polymer
 * @mixinFunction
 */
const UploadMixin = (baseClass: any) => class extends connect(store)(baseClass) {
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

  stateChanged(state: RootState) {
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

export default UploadMixin;
