import EventHelperMixin from '../../../mixins/event-helper-mixin';
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import { Intervention, InterventionPermissionsFields } from '../../../../typings/intervention.types';
import CONSTANTS from '../../../../config/app-constants';
import {store} from '../../../../store.js';
import { setPageDataPermissions } from '../../../../actions/page-data';

/**
 * PD/SSFA permissions mixin
 * @polymer
 * @mixinFunction
 * @appliesMixin EventHelperMixin
 * @appliesMixin ReduxPermissionsUpdaterMixin
 */
const InterventionPermissionsMixin = dedupingMixin(
(superClass: any) => class extends EtoolsMixinFactory.combineMixins([
  EventHelperMixin
], superClass) {
  /* eslint-enable arrow-parens */
  static get properties() {
    return {
      _intervNoEditPerm: {
        type: Object,
        value: {
          edit: new InterventionPermissionsFields(),
          required: new InterventionPermissionsFields()
        }
      }
    };
  }

  ready() {
    super.ready();
    this._initPermissionsListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removePermissionsListeners();
  }

  _initPermissionsListeners() {
    this._signedDocChangedForDraft = this._signedDocChangedForDraft.bind(this);
    this._restoreInterventionOriginalDataAndPermissions =
        this._restoreInterventionOriginalDataAndPermissions.bind(this);

    this.addEventListener('signed-doc-change-for-draft', this._signedDocChangedForDraft);
    this.addEventListener('restore-original-permissions', this._restoreInterventionOriginalDataAndPermissions);
  }

  _removePermissionsListeners() {
    this.removeEventListener('signed-doc-change-for-draft', this._signedDocChangedForDraft);
    this.removeEventListener('restore-original-permissions', this._restoreInterventionOriginalDataAndPermissions);
  }

  _getNewIntervRequiredFields() {
    return ['partner', 'agreement', 'document_type', 'title'];
  }

  _getDraftToSignedRequiredFields(intervention: Intervention) {
    let fields = ['offices', 'unicef_focal_points', 'partner_focal_points', 'sections',
      'partner_authorized_officer_signatory', 'signed_by_partner_date',
      'signed_by_unicef_date', 'signed_pd_attachment'];
    if (!intervention.contingency_pd) {
      fields.push('start', 'end');
    }
    return fields;
  }

  _getNoEditPermissionsClone() {
    return JSON.parse(JSON.stringify(this._intervNoEditPerm));
  }

  _getNewInterventionPermissions() {
    // get a fresh reseted permissions list
    let newIntervPerm = this._getNoEditPermissionsClone();
    let fieldName;
    // set required fields
    let reqFields = this._getNewIntervRequiredFields();
    for (fieldName in newIntervPerm.required) {
      if (reqFields.indexOf(fieldName) > -1) {
        newIntervPerm.required[fieldName] = true;
      }
    }
    let notEditableFieldsForDraft = ['amendments', 'frs'];
    // set editable fields
    for (fieldName in newIntervPerm.edit) {
      if (notEditableFieldsForDraft.indexOf(fieldName) === -1) {
        newIntervPerm.edit[fieldName] = true;
      }
    }
    return newIntervPerm;
  }

  _setPermissions(perm: InterventionPermissionsFields) {
    this.set('intervention.permissions', perm);
    store.dispatch(setPageDataPermissions(perm));
    this._updateRelatedPermStyles();
  }

  // TODO: this method should be moved elsewhere
  _updateRelatedPermStyles(onlyDetails: boolean, forceDetUiValidationOnAttach: boolean, forceReviewUiValidationOnAttach: boolean) {
    setTimeout(() => {
      let details = this.shadowRoot.querySelector('#interventionDetails');
      let reviewAndSign = this.shadowRoot.querySelector('#interventionReviewAndSign');
      if (details && typeof details.updateStyles === 'function') {
        details.updateStyles();

        if (forceDetUiValidationOnAttach) {
          // trigger validations (in case a save attempt failed and the tab fields validation messages should show)
          details.validate();
          this.set('_forceDetUiValidationOnAttach', false);
        }
      }

      if (onlyDetails) {
        return;
      }
      if (reviewAndSign && typeof reviewAndSign.updateStyles === 'function') {
        reviewAndSign.updateStyles();

        if (forceReviewUiValidationOnAttach) {
          // trigger validations (in case a save attempt failed and the tab fields validation messages should show)
          reviewAndSign.validate();
          this.set('_forceReviewUiValidationOnAttach', false);
        }
      }
    }, 50);
  }

  cancelEditPermissions() {
    this._setPermissions(this._getNoEditPermissionsClone());
  }

  setInterventionPermissions(newIntervention: boolean, perm: InterventionPermissionsFields) {
    if (newIntervention) {
      this._setPermissions(this._getNewInterventionPermissions());
    } else {
      if (perm) {
        this._setPermissions(perm);
      }
    }
    this._updateRelatedPermStyles();
  }

  getDraftToSignedTransitionPermissions(intervention: Intervention) {
    let currentPerm = intervention.permissions;
    let reqFieldsForSignedStatus = this._getDraftToSignedRequiredFields(intervention);
    let perm = JSON.parse(JSON.stringify(currentPerm));
    reqFieldsForSignedStatus.forEach(function(field) {
      perm.required[field] = true;
      perm.edit[field] = true;
    });
    return perm;
  }

  checkAndUpdatePlannedBudgetPermissions(status?: string) {
    if (status === CONSTANTS.STATUSES.Signed.toLowerCase()
        && this.get('intervention.permissions.edit.planned_budget') && !this.get('intervention.in_amendment')) {
      // there is a special requirement that in signed status only unicef_cash should be editable
      // but in amendment mode all of planned budget should be editable
      this.set('intervention.permissions.edit.planned_budget', false);
      this.set('intervention.permissions.edit.planned_budget_unicef_cash', true);
    } else {
      this.set('intervention.permissions.edit.planned_budget_unicef_cash',
          this.get('intervention.permissions.edit.planned_budget'));
    }
    store.dispatch(setPageDataPermissions(this.intervention.permissions);
    this._updateRelatedPermStyles(true);
  }

  /**
   * All field that are unlocked when an amendment is added must be restored to the original value if the
   * new/unsaved amendments are deleted
   */
  restoreDetailsTabOriginalValuesRelatedToAmendments() {
    let status = this.get('intervention.status');

    if ([CONSTANTS.STATUSES.Signed.toLowerCase(),
          CONSTANTS.STATUSES.Active.toLowerCase()].indexOf(status) === -1) {
      return;
    }
    let fieldsToRestore = ['agreement', 'document_type', 'title', 'country_programme', 'sections',
      'planned_budget', 'result_links', 'planned_visits'];
    if (status === 'active') {
      fieldsToRestore = fieldsToRestore.concat(['start', 'end']);
    }

    let unicefCashCopy = this.get('intervention.planned_budget.unicef_cash_local');

    fieldsToRestore.forEach(function(field) {
      let dataPath = 'intervention.' + field;
      let originalDataPath = 'originalIntervention.' + field;
      this.set(dataPath, JSON.parse(JSON.stringify(this.get(originalDataPath))));
      if (field === 'planned_budget' && status === CONSTANTS.STATUSES.Signed.toLowerCase()) {
        // if planned_budget we need to make sure in signed status unicef_cash remains the same
        this.set('intervention.planned_budget.unicef_cash_local', unicefCashCopy);
      }
    }.bind(this));
    this.fireEvent('toast', {text: 'There are no new/unsaved amendments.\n' +
      'All fields unlocked by amendments are restored to the original values.', showCloseBtn: true});
  }

  checkAndUpdateInterventionPermissions(intervention: Intervention, userHasEditPermissions: boolean, isNewIntervention: boolean) {
    if (userHasEditPermissions) {
      if (isNewIntervention) {
        this.setInterventionPermissions(true);
      } else {
        this.checkAndUpdatePlannedBudgetPermissions(intervention.status);
      }
    } else {
      this.cancelEditPermissions();
    }
  }

  _canRestoreOriginalPermissions() {
    if (!_.isEmpty(this.originalIntervention) && !_.isEmpty(this.intervention)) {
      // avoid restoring previous intervention permissions
      return this.originalIntervention.id === this.intervention.id;
    }
    return false;
  }

  _signedDocChangedForDraft(e) {
    e.stopImmediatePropagation();
    if (e.detail.docSelected) {
      this.setInterventionPermissions(false,
          this.getDraftToSignedTransitionPermissions(this.intervention));
    } else {
      if (!this._canRestoreOriginalPermissions()) {
        return;
      }
      this.setInterventionPermissions(false, this.originalIntervention.permissions);
      this.checkAndUpdatePlannedBudgetPermissions(this.intervention.status);
      // update validation errors
      let details = this.shadowRoot.querySelector('#interventionDetails');
      if (details && typeof details.validate === 'function') {
        details.validate();
      }
      let reviewAndSign = this.shadowRoot.querySelector('#interventionReviewAndSign');
      if (reviewAndSign && typeof reviewAndSign.validate === 'function') {
        reviewAndSign.validate();
      }
    }
  }

  _restoreInterventionOriginalDataAndPermissions(e: CustomEvent) {
    e.stopImmediatePropagation();
    if (!this._canRestoreOriginalPermissions()) {
      return;
    }
    this.setInterventionPermissions(false, this.originalIntervention.permissions);
    this.checkAndUpdatePlannedBudgetPermissions();
    this.restoreDetailsTabOriginalValuesRelatedToAmendments();
  }

});

export default InterventionPermissionsMixin;
