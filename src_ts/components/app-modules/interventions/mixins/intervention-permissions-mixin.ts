// import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
import {Intervention, InterventionPermissionsFields} from '../../../../typings/intervention.types';
import CONSTANTS from '../../../../config/app-constants';
import {store} from '../../../../store.js';
import {setPageDataPermissions} from '../../../../actions/page-data';
import {isEmptyObject} from '../../../utils/utils';
import {fireEvent} from '../../../utils/fire-custom-event';
import {Constructor, Permission} from '../../../../typings/globals.types';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';

/**
 * PD/SSFA permissions mixin
 * @polymer
 * @mixinFunction
 * @appliesMixin ReduxPermissionsUpdaterMixin
 */
function InterventionPermissionsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class interventionPermissionsClass extends baseClass {

    /* eslint-enable arrow-parens */
    @property({type: Object})
    _intervNoEditPerm: Permission<InterventionPermissionsFields> = {
      edit: new InterventionPermissionsFields(),
      required: new InterventionPermissionsFields()
    };


    // ---*Defined in the component
    intervention!: Intervention;
    originalIntervention!: Intervention;
    // ---


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

      this.addEventListener('signed-doc-change-for-draft', this._signedDocChangedForDraft as EventListenerOrEventListenerObject);
      this.addEventListener('restore-original-permissions',
        this._restoreInterventionOriginalDataAndPermissions as EventListenerOrEventListenerObject);
    }

    _removePermissionsListeners() {
      this.removeEventListener('signed-doc-change-for-draft', this._signedDocChangedForDraft as EventListenerOrEventListenerObject);
      this.removeEventListener('restore-original-permissions',
        this._restoreInterventionOriginalDataAndPermissions as EventListenerOrEventListenerObject);
    }

    _getNewIntervRequiredFields() {
      return ['partner', 'agreement', 'document_type', 'title'];
    }

    _getDraftToSignedRequiredFields(intervention: Intervention) {
      const fields = ['offices', 'unicef_focal_points', 'partner_focal_points', 'sections',
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
      const newIntervPerm = this._getNoEditPermissionsClone();
      let fieldName;
      // set required fields
      const reqFields = this._getNewIntervRequiredFields();
      for (fieldName in newIntervPerm.required) {
        if (reqFields.indexOf(fieldName) > -1) {
          newIntervPerm.required[fieldName] = true;
        }
      }
      const notEditableFieldsForDraft = ['amendments', 'frs'];
      // set editable fields
      for (fieldName in newIntervPerm.edit) {
        if (notEditableFieldsForDraft.indexOf(fieldName) === -1) {
          newIntervPerm.edit[fieldName] = true;
        }
      }
      return newIntervPerm;
    }

    _setPermissions(perm: Permission<InterventionPermissionsFields>) {
      this.set('intervention.permissions', perm);
      store.dispatch(setPageDataPermissions(perm));
      this._updateRelatedPermStyles();
    }

    // TODO: this method should be moved elsewhere
    _updateRelatedPermStyles(onlyDetails?: boolean, forceDetUiValidationOnAttach?: boolean,
      forceReviewUiValidationOnAttach?: boolean) {
      setTimeout(() => {
        const details = this.shadowRoot!.querySelector('#interventionDetails') as PolymerElement & {validate(): boolean};
        const reviewAndSign = this.shadowRoot!.querySelector('#interventionReviewAndSign') as PolymerElement & {validate(): boolean};
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

    setInterventionPermissions(newIntervention: boolean, perm?: Permission<InterventionPermissionsFields>) {
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
      const currentPerm = intervention.permissions;
      const reqFieldsForSignedStatus = this._getDraftToSignedRequiredFields(intervention);
      const perm = JSON.parse(JSON.stringify(currentPerm));
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
      store.dispatch(setPageDataPermissions(this.intervention.permissions));
      this._updateRelatedPermStyles(true);
    }

    /**
     * All field that are unlocked when an amendment is added must be restored to the original value if the
     * new/unsaved amendments are deleted
     */
    restoreDetailsTabOriginalValuesRelatedToAmendments() {
      const status = this.get('intervention.status');

      if ([CONSTANTS.STATUSES.Signed.toLowerCase(),
        CONSTANTS.STATUSES.Active.toLowerCase()].indexOf(status) === -1) {
        return;
      }
      let fieldsToRestore = ['agreement', 'document_type', 'title', 'country_programme', 'sections',
        'planned_budget', 'result_links', 'planned_visits'];
      if (status === 'active') {
        fieldsToRestore = fieldsToRestore.concat(['start', 'end']);
      }

      const unicefCashCopy = this.get('intervention.planned_budget.unicef_cash_local');

      fieldsToRestore.forEach((field: string) => {
        const dataPath = 'intervention.' + field;
        const originalDataPath = 'originalIntervention.' + field;
        this.set(dataPath, JSON.parse(JSON.stringify(this.get(originalDataPath))));
        if (field === 'planned_budget' && status === CONSTANTS.STATUSES.Signed.toLowerCase()) {
          // if planned_budget we need to make sure in signed status unicef_cash remains the same
          this.set('intervention.planned_budget.unicef_cash_local', unicefCashCopy);
        }
      });
      fireEvent(this, 'toast', {text: 'There are no new/unsaved amendments.\n' +
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
      if (!isEmptyObject(this.originalIntervention) && !isEmptyObject(this.intervention)) {
        // avoid restoring previous intervention permissions
        return this.originalIntervention.id === this.intervention.id;
      }
      return false;
    }

    _signedDocChangedForDraft(e: CustomEvent) {
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
        const details = this.shadowRoot!.querySelector('#interventionDetails') as PolymerElement & {validate(): boolean};
        if (details && typeof details.validate === 'function') {
          details.validate();
        }
        const reviewAndSign = this.shadowRoot!.querySelector('#interventionReviewAndSign') as PolymerElement & {validate(): boolean};
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

  }
  return interventionPermissionsClass;
}


export default InterventionPermissionsMixin;
