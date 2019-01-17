import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
// @ts-ignore
import EventHelperMixin from 'event-helper-mixin.js';
// @ts-ignore
import EtoolsMixinFactory from "etools-behaviors/etools-mixin-factory";



/**
 * @polymer
 * @mixinFunction
 */
const AjaxErrorsParserMixin = dedupingMixin((baseClass: any) =>
    class extends (EtoolsMixinFactory.combineMixins([EventHelperMixin], baseClass) as typeof baseClass) {
      static get properties() {
        return {
          globalMessage: String,
          httpStatus413Msg: String,
        };
      }

      public globalMessage: string = 'An error occurred. Please try again later.';
      public httpStatus413Msg: string = 'The uploaded file is too large!';

      public tryGetResponseError(response) {
        if (response.status === 413) {
          return this.httpStatus413Msg;
        }
        if (response.status >= 401) {
          return this.globalMessage;
        }
        return response.response || this.globalMessage;
      }

      protected _getErrorsArray(errors, prepareForToastMsg) {
        let errorsArray = [];
        if (!errors) {
          return errorsArray;
        }

        if (prepareForToastMsg) {
          errorsArray.push('Errors occurred:');
        }

        if (typeof errors === 'string') {
          errorsArray.push(errors);
          return errorsArray;
        }
        if (typeof errors === 'object' && errors.error && typeof errors.error === 'string') {
          errorsArray.push(errors.error);
          return errorsArray;
        }

        if (typeof errors === 'object' && errors.errors && Array.isArray(errors.errors)) {
          errors.errors.forEach(function(err) {
            if (typeof err === 'object') {
              let errKeys = Object.keys(err);
              if (errKeys.length > 0) {
                errKeys.forEach(function(k) {
                  errorsArray.push(err[k]); // will work only for strings
                });
              }
            } else {
              errorsArray.push(err);
            }
          });
          return errorsArray;
        }

        if (typeof errors === 'object' && errors.non_field_errors && Array.isArray(errors.non_field_errors)) {
          [].push.apply(errorsArray, errors.non_field_errors);
          return errorsArray;
        }

        if (Array.isArray(errors) && errors.length > 0 && this._isArrayOfStrings(errors)) {
          Array.prototype.push.apply(errorsArray, errors);
          return errorsArray;
        }

        if (typeof errors === 'object' && Object.keys(errors).length > 0) {
          let errField;
          for (errField in errors) { // eslint-disable-line

            if (typeof errors[errField] === 'string') {
              errorsArray.push('Field ' + errField + ' - ' + errors[errField]);
              continue;
            }
            if (Array.isArray(errors[errField]) && errors[errField].length > 0) {
              let parentErr = 'Field ' + errField + ': ';
              let nestedErrs = this._getErrorsArray(errors[errField]);
              if (nestedErrs.length === 1) {
                parentErr += nestedErrs[0];
                errorsArray.push(parentErr);
              } else {
                errorsArray.push(parentErr);
                // * The marking is used for display in etools-error-messages-box
                // * and adds a welcomed identations when displayed as a toast message
                nestedErrs = this._markNestedErrors(nestedErrs);
                Array.prototype.push.apply(errorsArray, nestedErrs);
              }
              continue;
            }
            if (typeof errors[errField] === 'object' && Object.keys(errors[errField]).length > 0) {
              let errF;
              for (errF in errors[errField]) {
                if (errors[errField][errF]) {
                  errorsArray.push('Field ' + errField + '(' + errF + ') - ' + errors[errField][errF]);
                }
              }
            }

          }
        }

        return errorsArray;
      }

      protected _markNestedErrors(errs) {
        return errs.map(er => ' ' + er);
      }

      protected _isArrayOfStrings(arr) {
        let allStrings = true;
        let i;
        for (i = 0; i < arr.length; i++) {
          if (typeof arr[i] !== 'string') {
            allStrings = false;
            break;
          }
        }
        return allStrings;
      }

      public formatServerErrorAsText(errors) {
        let errorsArray = this._getErrorsArray(errors, false);
        if (errorsArray && errorsArray.length) {
          return errorsArray.join('\n');
        }
        return errors;
      }

      public parseRequestErrorsAndShowAsToastMsgs(error, source, redirectOn404) {
        if (redirectOn404 && error.status === 404) {
          if (!source) {
            source = this;
          }
          source.fireEvent('404');
          return;
        }

        let errorResponse = this.tryGetResponseError(error);
        let errorsString = this.formatServerErrorAsText(errorResponse);

        this.showErrorAsToastMsg(errorsString, source);
      }

      public showErrorAsToastMsg(errorsString, source) {
        if (errorsString) {
          if (!source) {
            source = this;
          }
          source.fireEvent('toast', {text: errorsString, showCloseBtn: true});
        }
      }

    });


export default AjaxErrorsParserMixin;
