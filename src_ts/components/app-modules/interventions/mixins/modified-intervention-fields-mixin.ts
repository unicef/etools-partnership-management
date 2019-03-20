// @ts-ignore
import difference from 'lodash-es/difference';
import { GenericObject } from '../../../../typings/globals.types';
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
import { isEmptyObject } from '../../../utils/utils';

/**
 * PD/SSFA fields prepare for save functionality
 * @polymer
 * @mixinFunction
 */
const ModifiedInterventionFieldsMixin = dedupingMixin((superClass: any) => class extends superClass {
  /* eslint-enable arrow-parens */
  _objectFieldIsModified(fieldName: string) {
    let isModified = JSON.stringify(this.originalIntervention[fieldName], this.numbersToString) !==
        JSON.stringify(this.intervention[fieldName], this.numbersToString);

    let dropdownArrayFields = ['partner_focal_points', 'unicef_focal_points', 'offices'];
    if (isModified && dropdownArrayFields.indexOf(fieldName) > -1) {
      // Covers dropdown arrays which can have same content but with changed order
      if (this._arraysAreEqual(this.originalIntervention[fieldName], this.intervention[fieldName])) {
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
  _arraysAreEqual(array1: [], array2: []) {
    let differencesArray = [];
    if ((!array1 && (array2 && array2.length)) || (!array2 && (array1 && array1.length))) {
      return false;
    }
    if (array1.length > array2.length) {
      differencesArray = difference(array1, array2);
    } else {
      differencesArray = difference(array2, array1);
    }
    return isEmptyObject(differencesArray);
  }

  _primitiveFieldIsModified(fieldName: string) {
    return this.originalIntervention[fieldName] !== this.intervention[fieldName];
  }

  _getModifiedReviewAndSign() {
    let updatableFields = ['submission_date', 'submission_date_prc', 'review_date_prc',
      'prc_review_attachment', 'partner_authorized_officer_signatory',
      'signed_by_partner_date', 'unicef_signatory', 'signed_by_unicef_date', 'signed_pd_attachment',
      'in_amendment'];

    return this._buildModifiedInterventionObject(updatableFields, []);
  }

  _getModifiedInterventionDetails(docType: string) {
    let updatableFields = ['agreement', 'document_type', 'title', 'country_programme',
      'start', 'end', 'activation_letter_attachment'];
    if (docType !== 'SSFA') {
      updatableFields.push('reference_number_year');
      updatableFields.push('contingency_pd');
    }
    let updatableObjectFields = ['offices', 'unicef_focal_points', 'partner_focal_points',
      'sections', 'flat_locations', 'planned_budget', 'planned_visits'];
    let modifiedDetails = this._buildModifiedInterventionObject(updatableFields, updatableObjectFields);

    return Object.assign({}, modifiedDetails);
  }

  _buildModifiedInterventionObject(updatableFields: string[], updatableObjectFields: string[]) {
    let modifiedObject: GenericObject = {};

    updatableFields.forEach((fieldName) => {
      if (this._primitiveFieldIsModified(fieldName)) {
        modifiedObject[fieldName] = this.intervention[fieldName];
      }
    });

    updatableObjectFields.forEach((fieldName: string) => {
      if (this._objectFieldIsModified(fieldName)) {
        modifiedObject[fieldName] = this.intervention[fieldName];
      }
    });

    return modifiedObject;
  }

});

export default ModifiedInterventionFieldsMixin;
