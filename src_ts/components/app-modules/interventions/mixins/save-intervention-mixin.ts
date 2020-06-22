import { store } from "../../../../store.js";
import { RESET_UNSAVED_UPLOADS } from "../../../../actions/upload-status";
import CONSTANTS from "../../../../config/app-constants";
import { Intervention } from "../../../../typings/intervention.types";
import { isEmptyObject } from "../../../utils/utils";
import ModifiedInterventionFieldsMixin from "./modified-intervention-fields-mixin";
import { fireEvent } from "../../../utils/fire-custom-event";
import { getArraysDiff } from "../../../utils/array-helper.js";
import {
  Constructor,
  GenericObject,
  UserPermissions,
} from "../../../../typings/globals.types.js";
import { PolymerElement } from "@polymer/polymer";
import InterventionItemData from "../data/intervention-item-data.js";
import InterventionDetails from "../pages/details/intervention-details.js";
import InterventionReviewAndSign from "../pages/review-and-sign/intervention-review-and-sign";

/**
 * PD/SSFA save functionality
 * @polymer
 * @mixinFunction
 * @appliesMixin ModifiedInterventionFieldsMixin
 */
function SaveInterventionMixin<T extends Constructor<PolymerElement>>(
  baseClass: T
) {
  class SaveInterventionClass extends ModifiedInterventionFieldsMixin(
    baseClass as Constructor<PolymerElement>
  ) {
    // --- *Defined in the component
    intervention!: Intervention;
    originalIntervention!: Intervention;
    saved!: {
      interventionId: any;
      justSaved: boolean;
    }; // TODO - remove if functionality not used anymore
    permissions!: UserPermissions;
    // ---

    _validateAndSaveIntervention(event: CustomEvent) {
      if (event) {
        event.stopImmediatePropagation();
      }

      this.saved.justSaved = true;
      fireEvent(this, "clear-server-errors");
      this.set("errorMsgBox_Title", "Errors Saving PD/SSFA");
      // @ts-ignore Defined in component
      if (!this._hasEditPermissions(this.permissions, this.intervention)) {
        return Promise.resolve(false);
      }

      const interventionDetailsAreValid = this._validateInterventionDetails();

      const reviewAndSignIsValid = this._validateReviewAndSign();

      if (!interventionDetailsAreValid || !reviewAndSignIsValid) {
        this._showErrorsWarning(
          interventionDetailsAreValid,
          reviewAndSignIsValid
        );
        return Promise.resolve(false);
      }

      let interventionData = this._getModifiedFields();
      interventionData = this._prepareDataForSave(interventionData);
      // @ts-ignore
      return (this.$.interventionData as InterventionItemData)
        .saveIntervention(
          interventionData,
          this._newInterventionSaved.bind(this)
        )
        .then((successfull: boolean) => {
          if (successfull) {
            store.dispatch({ type: RESET_UNSAVED_UPLOADS });
            return true;
          } else {
            return false;
          }
        });
    }

    _getModifiedFields() {
      let interventionData;
      const modifiedDetails = this._getModifiedInterventionDetails();
      const modifiedReviewAndSign = this._getModifiedReviewAndSign();
      // @ts-ignore *Defined in component
      if (this._isNewIntervention()) {
        interventionData = Object.assign(
          {},
          modifiedDetails,
          modifiedReviewAndSign
        );
        interventionData.status = CONSTANTS.STATUSES.Draft.toLowerCase();
      } else {
        interventionData = Object.assign(
          { id: this.intervention.id },
          modifiedDetails,
          modifiedReviewAndSign
        );
      }
      return interventionData;
    }

    _validateInterventionDetails() {
      let valid = false;
      const intervDetailsEl = (this.shadowRoot!.querySelector(
        "#interventionDetails"
      )! as unknown) as InterventionDetails;

      if (intervDetailsEl && typeof intervDetailsEl.validate === "function") {
        valid = intervDetailsEl.validate();
      } else {
        // details element not stamped...
        // validate current data that belongs to details tab against permissions
        const detailsPrimitiveFields = [
          "agreement",
          "document_type",
          "title",
          "country_programme",
        ];
        const detailsObjFields = [
          "unicef_focal_points",
          "partner_focal_points",
          "sections",
          "flat_locations",
          "offices",
        ];
        if (
          !this.intervention.contingency_pd ||
          this.intervention.status === "active"
        ) {
          detailsPrimitiveFields.push("start", "end");
        }
        if (
          this.intervention.document_type !== "SSFA" &&
          ["", "draft"].indexOf(this.intervention.status) > -1
        ) {
          detailsPrimitiveFields.push("reference_number_year");
        }

        valid =
          this._validateInterventionPrimitiveFields(detailsPrimitiveFields) &&
          this._validateInterventionObjectFields(detailsObjFields);

        this.set("_forceDetUiValidationOnAttach", true);
      }

      return valid;
    }

    _validateReviewAndSign() {
      let valid = false;
      const reviewAndSignEl = (this.shadowRoot!.querySelector(
        "#interventionReviewAndSign"
      )! as unknown) as InterventionReviewAndSign;
      if (reviewAndSignEl && typeof reviewAndSignEl.validate === "function") {
        valid = reviewAndSignEl.validate();
      } else {
        // review and signed element not stamped...
        // validate current data that belongs to this tab against permissions
        const reviewAndSignPrimitiveFields = [
          "partner_authorized_officer_signatory",
          "signed_by_partner_date",
          "unicef_signatory",
          "signed_by_unicef_date",
          "signed_pd_attachment",
          "submission_date",
        ];
        valid = this._validateInterventionPrimitiveFields(
          reviewAndSignPrimitiveFields
        );
        this.set("_forceReviewUiValidationOnAttach", true);
      }
      return valid;
    }

    _validateInterventionObjectFields(interventionFields: string[]) {
      return this._validateInterventionFields(
        interventionFields,
        isEmptyObject
      );
    }

    _validateInterventionPrimitiveFields(interventionFields: string[]) {
      return this._validateInterventionFields(
        interventionFields,
        this._primitiveFieldIsEmpty
      );
    }

    _validateInterventionFields(
      interventionFields: string[],
      isEmptyPredicate: (v: any) => boolean
    ) {
      let valid = true;
      let i;
      let fieldRequired;
      let fieldVal;
      for (i = 0; i < interventionFields.length; i++) {
        fieldRequired = this.intervention!.permissions!.required[
          interventionFields[i]
        ];
        fieldVal = this.intervention[interventionFields[i]];
        if (fieldRequired && isEmptyPredicate(fieldVal)) {
          valid = false;
          break;
        }
      }
      return valid;
    }

    _primitiveFieldIsEmpty(fieldVal: string | number) {
      return fieldVal === null || fieldVal === undefined || fieldVal === "";
    }

    _prepareDataForSave(interventionData: GenericObject) {
      // prepare fr numbers
      if (
        Array.isArray(this.intervention.frs) &&
        this._needFrsUpdate(this.intervention.frs)
      ) {
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
      let msg = "";
      if (
        (this.intervention.status === CONSTANTS.STATUSES.Draft.toLowerCase() ||
          this.intervention.status === "") &&
        this.intervention.signed_pd_attachment
      ) {
        msg =
          "Status of the PD/SSFA will change to signed once all required fields are completed " +
          "(check DETAILS and REVIEW & SIGN tabs).";
      } else {
        msg = "Document can not be saved because of missing data";
        const tabs = [];
        if (validDetails === false) {
          tabs.push("DETAILS");
        }
        if (validReviewAndSign === false) {
          tabs.push("REVIEW & SIGN");
        }
        msg +=
          " from " +
          (tabs.length > 1 ? tabs.join(", ") + " tabs" : tabs[0] + " tab") +
          ".";
      }

      fireEvent(this, "toast", { text: msg, showCloseBtn: true });
    }

    _needFrsUpdate(frs: number[]) {
      const diff = getArraysDiff(this.originalIntervention.frs, frs);
      return diff.length > 0;
    }

    _terminatePd(e: CustomEvent) {
      const terminationData = {
        id: e.detail.interventionId,
        end: e.detail.terminationData.date,
        termination_doc_attachment: e.detail.terminationData.fileId,
      };
      (this.$.interventionData as InterventionItemData).saveIntervention(
        terminationData
      );
    }
  }
  return SaveInterventionClass;
}

export default SaveInterventionMixin;
