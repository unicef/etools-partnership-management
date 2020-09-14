import {GenericObject, Constructor} from '../../../../typings/globals.types';
import {PolymerElement} from '@polymer/polymer';
import {arraysAreEqual} from '../../../utils/utils';

/**
 * PD/SSFA fields prepare for save functionality
 * @polymer
 * @mixinFunction
 */
function ModifiedInterventionFieldsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class ModifiedInterventionFieldsClass extends baseClass {
    /* eslint-enable arrow-parens */
    _objectFieldIsModified(fieldName: string) {
      let isModified =
        // @ts-ignore
        JSON.stringify(this.originalIntervention[fieldName], this.numbersToString) !==
        // @ts-ignore
        JSON.stringify(this.intervention[fieldName], this.numbersToString);

      const dropdownArrayFields = ['partner_focal_points', 'unicef_focal_points', 'offices'];
      if (isModified && dropdownArrayFields.indexOf(fieldName) > -1) {
        // Covers dropdown arrays which can have same content but with changed order
        // @ts-ignore
        if (arraysAreEqual(this.originalIntervention[fieldName], this.intervention[fieldName])) {
          isModified = false;
        }
      }
      return isModified;
    }
    /**
     * Covers the case when the object from bk (this.originalIntervention)
     * has numbers but this.interventions has strings,
     * so we convert numbers to string before comparing
     */
    numbersToString(_key: any, value: any) {
      if (value === '0.00') {
        // cover the case where API received values (ex: planned budget) can be strings like this `0.00`
        return '0';
      }
      if (typeof value === 'number') {
        return value.toString();
      }
      return value;
    }

    _primitiveFieldIsModified(fieldName: string) {
      // @ts-ignore
      return this.originalIntervention[fieldName] !== this.intervention[fieldName];
    }

    _getModifiedReviewAndSign() {
      const updatableFields = [
        'submission_date',
        'submission_date_prc',
        'review_date_prc',
        'prc_review_attachment',
        'partner_authorized_officer_signatory',
        'signed_by_partner_date',
        'unicef_signatory',
        'signed_by_unicef_date',
        'signed_pd_attachment',
        'in_amendment'
      ];

      return this._buildModifiedInterventionObject(updatableFields, []);
    }

    _getModifiedInterventionDetails(docType?: string) {
      const updatableFields = [
        'agreement',
        'document_type',
        'title',
        'country_programme',
        'start',
        'end',
        'activation_letter_attachment',
        'cfei_number'
      ];
      // @ts-ignore
      if ((docType ? docType : this.intervention.docType) !== 'SSFA') {
        updatableFields.push('reference_number_year');
        updatableFields.push('contingency_pd');
      }
      const updatableObjectFields = [
        'offices',
        'unicef_focal_points',
        'partner_focal_points',
        'sections',
        'flat_locations',
        'planned_budget',
        'planned_visits'
      ];
      const modifiedDetails = this._buildModifiedInterventionObject(updatableFields, updatableObjectFields);

      return Object.assign({}, modifiedDetails);
    }

    _buildModifiedInterventionObject(updatableFields: string[], updatableObjectFields: string[]) {
      const modifiedObject: GenericObject = {};

      updatableFields.forEach((fieldName) => {
        if (this._primitiveFieldIsModified(fieldName)) {
          // @ts-ignore
          modifiedObject[fieldName] = this.intervention[fieldName];
        }
      });

      updatableObjectFields.forEach((fieldName: string) => {
        if (this._objectFieldIsModified(fieldName)) {
          // @ts-ignore
          modifiedObject[fieldName] = this.intervention[fieldName];
        }
      });

      return modifiedObject;
    }
  }
  return ModifiedInterventionFieldsClass;
}

export default ModifiedInterventionFieldsMixin;
