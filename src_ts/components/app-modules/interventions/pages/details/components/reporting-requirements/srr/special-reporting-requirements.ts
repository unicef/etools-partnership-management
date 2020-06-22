import { PolymerElement, html } from "@polymer/polymer";
import "@polymer/paper-button/paper-button.js";
import "@unicef-polymer/etools-data-table/etools-data-table.js";

import { createDynamicDialog } from "@unicef-polymer/etools-dialog/dynamic-dialog";
import "../../../../../../../layout/icons-actions.js";
import "./add-edit-special-rep-req.js";
import CommonMixin from "../../../../../../../mixins/common-mixin.js";
import ReportingRequirementsCommonMixin from "../mixins/reporting-requirements-common-mixin.js";
import { buttonsStyles } from "../../../../../../../styles/buttons-styles.js";
import { gridLayoutStyles } from "../../../../../../../styles/grid-layout-styles.js";
import { reportingRequirementsListStyles } from "../styles/reporting-requirements-lists-styles.js";
import CONSTANTS from "../../../../../../../../config/app-constants.js";
import { logError } from "@unicef-polymer/etools-behaviors/etools-logging";
import { sendRequest } from "@unicef-polymer/etools-ajax/etools-ajax-request";
import { parseRequestErrorsAndShowAsToastMsgs } from "@unicef-polymer/etools-ajax/ajax-error-parser.js";
import { property } from "@polymer/decorators";
import { AddEditSpecialRepReqEl } from "./add-edit-special-rep-req.js";
import EtoolsDialog from "@unicef-polymer/etools-dialog";

/**
 * @customElement
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin CommonMixin
 * @appliesMixin ReportingRequirementsCommonMixin
 */
class SpecialReportingRequirements extends CommonMixin(
  ReportingRequirementsCommonMixin(PolymerElement)
) {
  static get template() {
    return html`
      ${buttonsStyles} ${gridLayoutStyles} ${reportingRequirementsListStyles}
      <style include="data-table-styles"></style>

      <div
        class="row-h"
        hidden$="[[!_empty(reportingRequirements, reportingRequirements.length)]]"
      >
        There are no special reporting requirements set.
      </div>

      <div class="row-h">
        <paper-button class="secondary-btn" on-click="_openAddDialog">
          ADD REQUIREMENTS
        </paper-button>
      </div>

      <div
        class="flex-c"
        hidden$="[[_empty(reportingRequirements, reportingRequirements.length)]]"
      >
        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column class="col-1 right-align index-col"
            >ID</etools-data-table-column
          >
          <etools-data-table-column class="col-3"
            >Due Date</etools-data-table-column
          >
          <etools-data-table-column class="flex-6"
            >Reporting Requirements</etools-data-table-column
          >
          <etools-data-table-column class="flex-c"></etools-data-table-column>
        </etools-data-table-header>
        <template is="dom-repeat" items="[[reportingRequirements]]">
          <etools-data-table-row no-collapse secondary-bg-on-hover>
            <div slot="row-data">
              <span class="col-data col-1 right-align index-col"
                >[[_getIndex(index, reportingRequirements)]]</span
              >
              <span class="col-data col-3"
                >[[getDateDisplayValue(item.due_date)]]</span
              >
              <span class="col-data col-6">[[item.description]]</span>
              <span class="col-data flex-c actions">
                <icons-actions
                  item$="[[item]]"
                  on-edit="_onEdit"
                  on-delete="_onDelete"
                >
                </icons-actions>
              </span>
            </div>
          </etools-data-table-row>
        </template>
      </div>
    `;
  }

  @property({ type: Object })
  addEditDialog!: AddEditSpecialRepReqEl;

  @property({ type: Object })
  _deleteConfirmationDialog!: EtoolsDialog;

  @property({ type: Number })
  _itemToDeleteIndex: number = -1;

  ready() {
    super.ready();
    this._createAddEditDialog();
    this._createDeleteConfirmationsDialog();
    this._addEventListeners();
  }

  _addEventListeners() {
    this._onEdit = this._onEdit.bind(this);
    this._onDelete = this._onDelete.bind(this);

    this.addEventListener("edit", this._onEdit as any);
    this.addEventListener("delete", this._onDelete as any);
  }

  _removeEventListeners() {
    this.removeEventListener("edit", this._onEdit as any);
    this.removeEventListener("delete", this._onDelete as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
    this._removeAddEditDialog();
    this._removeDeleteConfirmationsDialog();
  }

  _onEdit(e: CustomEvent) {
    e.stopPropagation();
    this._setDialogData(e);
    this.addEditDialog.opened = true;
  }

  _setDialogData(e: CustomEvent) {
    this.addEditDialog.interventionId = this.interventionId;
    if (e.target !== null) {
      // @ts-ignore
      this.addEditDialog.item = JSON.parse(e.target.getAttribute("item"));
    }
  }

  _onDelete(e: CustomEvent) {
    e.stopPropagation();
    if (this._deleteConfirmationDialog) {
      if (e.target !== null) {
        // @ts-ignore
        const itemToDelete = JSON.parse(e.target.getAttribute("item"));
        const index = this._getIndexById(itemToDelete.id);
        this.set("_itemToDeleteIndex", index);
      }
      this._deleteConfirmationDialog.opened = true;
    }
  }

  _onDeleteConfirmation(e: CustomEvent) {
    if (!e.detail.confirmed) {
      this.set("_itemToDeleteIndex", -1);
      return;
    }

    if (this._itemToDeleteIndex > -1) {
      const itemToDelete = this.reportingRequirements[
        this._itemToDeleteIndex
      ] as any;
      const endpoint = this.getEndpoint("specialReportingRequirementsUpdate", {
        reportId: itemToDelete.id,
      });
      sendRequest({
        method: "DELETE",
        endpoint: endpoint,
      })
        .then(() => {
          this.splice("reportingRequirements", this._itemToDeleteIndex, 1);
        })
        .catch((error: any) => {
          logError(
            "Failed to delete special report requirement!",
            "special-reporting-requirements",
            error
          );
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        })
        .then(() => {
          // delete complete, reset _itemToDeleteIndex
          this.set("_itemToDeleteIndex", -1);
        });
    }
  }

  _createAddEditDialog() {
    this.addEditDialog = document.createElement(
      "add-edit-special-rep-req"
    ) as AddEditSpecialRepReqEl;
    this.addEditDialog.set("toastMsgLoadingSource", this);
    this._onSpecialReportingRequirementsSaved = this._onSpecialReportingRequirementsSaved.bind(
      this
    );
    this.addEditDialog.addEventListener(
      "reporting-requirements-saved",
      this._onSpecialReportingRequirementsSaved as any
    );

    document.querySelector("body")!.appendChild(this.addEditDialog);
  }

  _removeAddEditDialog() {
    if (this.addEditDialog) {
      this.addEditDialog.removeEventListener(
        "reporting-requirements-saved",
        this._onSpecialReportingRequirementsSaved as any
      );
      document.querySelector("body")!.removeChild(this.addEditDialog);
    }
  }

  _createDeleteConfirmationsDialog() {
    this._onDeleteConfirmation = this._onDeleteConfirmation.bind(this);
    const confirmationMSg = document.createElement("span");
    confirmationMSg.innerText =
      "Are you sure you want to delete this Special Reporting Requirement?";
    const confirmationDialogConf = {
      title: "Delete Special Reporting Requirement",
      size: "md",
      okBtnText: "Yes",
      cancelBtnText: "No",
      closeCallback: this._onDeleteConfirmation,
      content: confirmationMSg,
    };
    this._deleteConfirmationDialog = createDynamicDialog(
      confirmationDialogConf
    );
  }

  _removeDeleteConfirmationsDialog() {
    if (this._deleteConfirmationDialog) {
      this._deleteConfirmationDialog.removeEventListener(
        "close",
        this._onDeleteConfirmation as any
      );
      document
        .querySelector("body")!
        .removeChild(this._deleteConfirmationDialog);
    }
  }

  _openAddDialog() {
    this.addEditDialog.item = {};
    this.addEditDialog.interventionId = this.interventionId;
    this.addEditDialog.opened = true;
  }

  _sortRequirementsAsc() {
    this.reportingRequirements.sort((a: string, b: string) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }

  _getReportType() {
    return CONSTANTS.REQUIREMENTS_REPORT_TYPE.SPECIAL;
  }

  _getIndexById(id: number) {
    return this.reportingRequirements.findIndex((r: any) => r.id === id);
  }

  _onSpecialReportingRequirementsSaved(e: CustomEvent) {
    const savedReqItem = e.detail;
    const index = this._getIndexById(savedReqItem.id);
    if (index > -1) {
      // edit
      this.splice("reportingRequirements", index, 1, savedReqItem);
    } else {
      this.push("reportingRequirements", savedReqItem);
    }
  }
}

window.customElements.define(
  "special-reporting-requirements",
  SpecialReportingRequirements
);
