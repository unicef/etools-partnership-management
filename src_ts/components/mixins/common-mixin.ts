import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin';
import {prettyDate} from '../utils/date-utils';

/**
 * @polymer
 * @mixinFunction
 */
const CommonMixin = dedupingMixin((baseClass: any) =>
    class extends (baseClass) {

      /**
       * Prepare and return the string value we have to display on the interface.
       * Ex: partners and agreements lists data values.
       */
      // TODO - apply single responsability
      getDisplayValue(value: any, separator: string, skipSpaces: boolean) {
        if (typeof value === 'string' && value !== '') {
          return value;
        } else if (Array.isArray(value) && value.length > 0) {
          if (!separator) {
            separator = ', ';
          }
          if (skipSpaces) {
            return value.filter(v => v !== undefined && v !== '' && v !== null).join(separator);
          }
          return value.join(separator);
        } else if (typeof value === 'number') {
          return value;
        }
        return '-';
      }
      /**
       * Prepare date string and return it in a user readable format
       */
      getDateDisplayValue(dateString: string) {
        let formatedDate = prettyDate(dateString);
        return formatedDate ? formatedDate : '-';
      }

      prepareEtoolsFileDataFromUrl(fileUrl: string) {
        let files: object[] = [];
        if (typeof fileUrl === 'string' && fileUrl !== '') {
          let fileName = this.getFileNameFromURL(fileUrl);
          files = [{
            id: null,
            file_name: fileName,
            path: fileUrl
          }];
        }
        return files;
      }

      getFileNameFromURL(url: string) {
        if (!url) {
          return '';
        }
        // @ts-ignore
        return url.split('?').shift().split('/').pop();
      }

      /**
       * TODO: move this method in another mixin
       * Reset field validation
       */
      fieldValidationReset(selector: string, useValidate: boolean) {
        if (!useValidate) {
          useValidate = false;
        }
        let field = this.shadowRoot.querySelector(selector);
        if (field) {
          if (useValidate) {
            field.validate();
          } else {
            field.set('invalid', false);
          }
        }
        return field;
      }

    });

export default CommonMixin;
