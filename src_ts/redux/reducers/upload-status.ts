import * as a from '../actions/upload-status.js';
import {Reducer, Action} from 'redux';

export class UploadStatusState {
  uploadsInProgress = 0;
  unsavedUploads = 0;
}

const INITIAL_STATE = new UploadStatusState();

const uploadStatus: Reducer<UploadStatusState, Action<string>> = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case a.RESET_UNSAVED_UPLOADS:
      return {
        ...state,
        unsavedUploads: 0
      };
    case a.RESET_UPLOADS_IN_PROGRESS:
      return {
        ...state,
        uploadsInProgress: 0
      };
    case a.INCREASE_UNSAVED_UPLOADS:
      return {
        ...state,
        unsavedUploads: state.unsavedUploads + 1
      };
    case a.INCREASE_UPLOADS_IN_PROGRESS:
      return {
        ...state,
        uploadsInProgress: state.uploadsInProgress + 1
      };
    case a.DECREASE_UNSAVED_UPLOADS: {
      const unsavedUploads = state.unsavedUploads > 0 ? state.unsavedUploads - 1 : 0;
      return {
        ...state,
        unsavedUploads
      };
    }
    case a.DECREASE_UPLOADS_IN_PROGRESS: {
      const uploadsInProgress = state.uploadsInProgress > 0 ? state.uploadsInProgress - 1 : 0;
      return {
        ...state,
        uploadsInProgress
      };
    }
    default:
      return state;
  }
};

export default uploadStatus;
