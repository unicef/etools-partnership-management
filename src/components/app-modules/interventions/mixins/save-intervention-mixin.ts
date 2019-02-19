import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import AjaxErrorsParserMixin from '../../../mixins/ajax-errors-parser-mixin';
import EventHelperMixin from '../../../mixins/event-helper-mixin';
import ArrayHelperMixin from '../../../mixins/array-helper-mixin';
import { store } from '../../../../store.js';
import { RESET_UNSAVED_UPLOADS } from '../../../../actions/upload-status';
import CONSTANTS from '../../../../config/app-constants';
import { Intervention, Fr } from '../../../../typings/intervention.types';
import { isEmptyObject } from '../../../utils/utils';
import ModifiedInterventionFieldsMixin from './modified-intervention-fields-mixin';


/**
 * PD/SSFA save functionality
 * @polymer
 * @mixinFunction
 * @mixinFunction
 * @appliesMixin ArrayHelperMixin
 * @appliesMixin ModifiedInterventionFields
 * @appliesMixin EventHelper
 * @appliesMixin AjaxErrorsParser
 */
const SaveInterventionMixin = dedupingMixin(
(superClass: any) => class extends EtoolsMixinFactory.combineMixins([
  EventHelperMixin,
  ArrayHelperMixin,
  ModifiedInterventionFieldsMixin,
  AjaxErrorsParserMixin
], superClass) {
  [x: string]: any;

  static get actions() {
    return {

      resetUnsavedUploads: function() {
        return {
          type: 'RESET_UNSAVED_UPLOADS'
        };
      }
    };
  }

  _validateAndSaveIntervention(event: CustomEvent) {
    if (event) {
      event.stopImmediatePropagation();
    }
    this.saved.justSaved = true;
    this.fireEvent('clear-server-errors');
    this.set('errorMsgBox_Title', 'Errors Saving PD/SSFA');
    if (!this._hasEditPermissions(this.permissions, this.intervention)) {
      return Promise.resolve(false);
    }

    let interventionDetailsAreValid = this._validateInterventionDetails();

    let reviewAndSignIsValid = this._validateReviewAndSign();

    if (!interventionDetailsAreValid || !reviewAndSignIsValid) {
      this._showErrorsWarning(interventionDetailsAreValid, reviewAndSignIsValid);
      return Promise.resolve(false);
    }

    let interventionData = this._getModifiedFields();
    interventionData = this._prepareDataForSave(interventionData);
    return this.$.interventionData.saveIntervention(interventionData, this._newInterventionSaved.bind(this))
                .then((successfull: boolean) => {
                  if (successfull) {
                    store.dispatch({type: RESET_UNSAVED_UPLOADS});
                    return true;
                  } else {
                    return false;
                  }
              });
  }

  _getModifiedFields() {
    let interventionData;
    let modifiedDetails = this._getModifiedInterventionDetails();
    let modifiedReviewAndSign = this._getModifiedReviewAndSign();
    if (this._isNewIntervention()) {
      interventionData = Object.assign({}, modifiedDetails, modifiedReviewAndSign);
      interventionData.status = CONSTANTS.STATUSES.Draft.toLowerCase();
    } else {
      interventionData = Object.assign({id: this.intervention.id}, modifiedDetails, modifiedReviewAndSign);
    }
    return interventionData;
  }

  _validateInterventionDetails() {
    let valid = false;
    let intervDetailsEl = this.shadowRoot.querySelector('#interventionDetails');

    if (intervDetailsEl && typeof intervDetailsEl.validate === 'function') {
      valid = intervDetailsEl.validate();
    } else {
      // details element not stamped...
      // validate current data that belongs to details tab against permissions
      let detailsPrimitiveFields = ['agreement', 'document_type', 'title', 'country_programme'];
      let detailsObjFields = ['unicef_focal_points', 'partner_focal_points',
        'sections', 'flat_locations', 'offices'];
      if (!this.intervention.contingency_pd || this.intervention.status === 'active') {
        detailsPrimitiveFields.push('start', 'end');
      }
      if (this.intervention.document_type !== 'SSFA' && ['', 'draft'].indexOf(this.intervention.status) > -1) {
        detailsPrimitiveFields.push('reference_number_year');
      }

      valid = this._validateInterventionPrimitiveFields(detailsPrimitiveFields) &&
          this._validateInterventionObjectFields(detailsObjFields);

      this.set('_forceDetUiValidationOnAttach', true);
    }

    return valid;
  }

  _validateReviewAndSign() {
    let valid = false;
    let reviewAndSignEl = this.shadowRoot.querySelector('#interventionReviewAndSign');

    if (reviewAndSignEl && typeof reviewAndSignEl.validate === 'function') {
      valid = reviewAndSignEl.validate();
    } else {
      // review and signed element not stamped...
      // validate current data that belongs to this tab against permissions
      let reviewAndSignPrimitiveFields = ['partner_authorized_officer_signatory', 'signed_by_partner_date',
        'unicef_signatory', 'signed_by_unicef_date', 'signed_pd_attachment'];
      valid = this._validateInterventionPrimitiveFields(reviewAndSignPrimitiveFields);
      this.set('_forceReviewUiValidationOnAttach', true);
    }
    return valid;
  }

  _validateInterventionObjectFields(interventionFields: string[]) {
    return this._validateInterventionFields(interventionFields, isEmptyObject);
  }

  _validateInterventionPrimitiveFields(interventionFields: string[]) {
    return this._validateInterventionFields(interventionFields, this._primitiveFieldIsEmpty);
  }

  _validateInterventionFields(interventionFields: string[], isEmptyPredicate: (v: any) => boolean) {
    let valid = true;
    let i;
    let fieldRequired;
    let fieldVal;
    for (i = 0; i < interventionFields.length; i++) {
      fieldRequired = this.intervention.permissions.required[interventionFields[i]];
      fieldVal = this.intervention[interventionFields[i]];
      if (fieldRequired && isEmptyPredicate(fieldVal)) {
        valid = false;
        break;
      }
    }
    return valid;
  }

  _primitiveFieldIsEmpty(fieldVal: string | number) {
    return fieldVal === null || fieldVal === undefined || fieldVal === '';
  }

  _prepareDataForSave(interventionData: Intervention) {
    // prepare fr numbers
    if (Array.isArray(this.intervention.frs) && this._needFrsUpdate(this.intervention.frs)) {
      interventionData.frs = this.intervention.frs;
    }
    // frs_details are readonly, we do not have to send them to backend
    delete interventionData.frs_details;

    // no need to send planned_budget.total to backend
    if (interventionData.planned_budget) {
      delete interventionData.planned_budget.total;
    }

    // attachments are saved in modal dialog, so no need to resend them to bk
    delete interventionData.attachments;

    return interventionData;
  }

  _showErrorsWarning(validDetails: boolean, validReviewAndSign: boolean) {
    let msg = '';
    if ((this.intervention.status === CONSTANTS.STATUSES.Draft.toLowerCase() ||
        this.intervention.status === '') &&
        this.intervention.signed_pd_attachment) {
      msg = 'Status of the PD/SSFA will change to signed once all required fields are completed ' +
          '(check DETAILS and REVIEW & SIGN tabs).';
    } else {
      msg = 'Document can not be saved because of missing data';
      let tabs = [];
      if (validDetails === false) {
        tabs.push('DETAILS');
      }
      if (validReviewAndSign === false) {
        tabs.push('REVIEW & SIGN');
      }
      msg += ' from ' + ((tabs.length > 1) ? (tabs.join(', ') + ' tabs') : (tabs[0] + ' tab')) + '.';
    }

    this.fireEvent('toast', {text: msg, showCloseBtn: true});
  }

  _needFrsUpdate(frs: Fr[]) {
    let diff = this.getArraysDiff(this.originalIntervention.frs, frs);
    return diff.length > 0;
  }

  _terminatePd(e: CustomEvent) {
    let terminationData = {
      id: e.detail.interventionId,
      end: e.detail.terminationData.date,
      termination_doc_attachment: e.detail.terminationData.fileId
    };
    this.$.interventionData.saveIntervention(terminationData);
  }
});

export default SaveInterventionMixin;
