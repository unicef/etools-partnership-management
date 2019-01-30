import pmpEdpoints from '../endpoints/endpoints.js';
import {connect} from "pwa-helpers/connect-mixin";
import {store} from "../../store";

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsPmpApp.Mixins.EtoolsDataReduxStore
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
        type: Number,
        statePath: 'uploadsInProgress'
      },
      unsavedUploads: {
        type: Boolean,
        statePath: 'unsavedUploads'
      }
    };
  }

  public static get actions() {
    return {
      increaseUploadsInProgress: function() {
        return {
          type: 'INCREASE_UPLOADS_IN_PROGRESS'
        };
      },
      decreaseUploadsInProgress: function() {
        return {
          type: 'DECREASE_UPLOADS_IN_PROGRESS'
        };
      },
      increaseUnsavedUploads: function() {
        return {
          type: 'INCREASE_UNSAVED_UPLOADS'
        };
      },
      decreaseUnsavedUploads: function() {
        return {
          type: 'DECREASE_UNSAVED_UPLOADS'
        };
      },
      resetUploadsInProgress: function() {
        return {
          type: 'RESET_UPLOADS_IN_PROGRESS'
        };
      },
      resetUnsavedUploads: function() {
        return {
          type: 'RESET_UNSAVED_UPLOADS'
        };
      }
    };
  }

  public _onUploadStarted(e: any) {
    e.stopImmediatePropagation();
    this.dispatch('increaseUploadsInProgress');
  }

  public _onChangeUnsavedFile(e: any) {
    e.stopImmediatePropagation();
    this.dispatch('decreaseUnsavedUploads');
  }
};

export default UploadMixin;
