import { PolymerElement, html } from "@polymer/polymer";
import { gridLayoutStyles } from "../../../../../../../styles/grid-layout-styles";
import EndpointsMixin from "../../../../../../../endpoints/endpoints-mixin";
import { prepareDatepickerDate } from "../../../../../../../utils/date-utils";

import "@polymer/iron-label/iron-label.js";
import "@polymer/paper-input/paper-input.js";
import "@unicef-polymer/etools-dialog/etools-dialog.js";

import "@unicef-polymer/etools-date-time/calendar-lite.js";
import { fireEvent } from "../../../../../../../utils/fire-custom-event";
import { logError } from "@unicef-polymer/etools-behaviors/etools-logging";
import { sendRequest } from "@unicef-polymer/etools-ajax/etools-ajax-request";
import { parseRequestErrorsAndShowAsToastMsgs } from "@unicef-polymer/etools-ajax/ajax-error-parser.js";
import { property } from "@polymer/decorators";
import { GenericObject } from "../../../../../../../../typings/globals.types";
import EtoolsDialog from "@unicef-polymer/etools-dialog/etools-dialog.js";

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
class AddEditSpecialRepReq extends EndpointsMixin(PolymerElement) {
  static get template() {
    // language=HTML
    return html`
      ${gridLayoutStyles}
      <style>
        :host {
          display: block;
        }

        paper-input {
          width: 100%;
        }

        iron-label {
          margin-bottom: 24px;
        }

        calendar-lite {
          position: relative;
        }
      </style>

      <etools-dialog
        id="addEditDialog"
        size="lg"
        opened="{{opened}}"
        dialog-title="Add/Edit Special Reporting Requirements"
        on-confirm-btn-clicked="_save"
        ok-btn-text="Save"
        keep-dialog-open
      >
        <div class="row-h">
          <div class="col layout-vertical col-5">
            <iron-label for="startDate">
              Report Due Date
            </iron-label>
            <calendar-lite
              id="startDate"
              date="[[prepareDatepickerDate(item.due_date)]]"
              pretty-date="{{item.due_date}}"
              format="YYYY-MM-DD"
              hide-header
            ></calendar-lite>
          </div>
        </div>
        <div class="row-h">
          <paper-input
            label="Reporting Requirement"
            placeholder="&#8212;"
            value="{{item.description}}"
          >
          </paper-input>
        </div>
      </etools-dialog>
    `;
  }

  @property({ type: Boolean })
  opened!: boolean;

  @property({ type: Number })
  interventionId!: number;

  @property({ type: Object })
  item!: GenericObject;

  @property({ type: Object })
  toastMsgLoadingSource!: PolymerElement;

  _isNew() {
    return !this.item.id;
  }

  _getEndpoint() {
    if (this._isNew()) {
      // new/create
      return this.getEndpoint("specialReportingRequirements", {
        intervId: this.interventionId,
      });
    } else {
      // already saved... update/delete
      return this.getEndpoint("specialReportingRequirementsUpdate", {
        reportId: this.item.id,
      });
    }
  }

  _save() {
    const dialog = this.$.addEditDialog as EtoolsDialog;
    dialog.startSpinner();

    const endpoint = this._getEndpoint();
    const method = this._isNew() ? "POST" : "PATCH";
    sendRequest({
      method: method,
      endpoint: endpoint,
      body: this._getBody(),
    })
      .then((response: any) => {
        fireEvent(this, "reporting-requirements-saved", response);
        dialog.stopSpinner();
        this.opened = false;
      })
      .catch((error: any) => {
        dialog.stopSpinner();
        logError(
          "Failed to save/update special report requirement!",
          "add-edit-special-rep-req",
          error
        );
        parseRequestErrorsAndShowAsToastMsgs(error, this.toastMsgLoadingSource);
      });
  }

  _getBody() {
    return {
      due_date: this.item.due_date,
      description: this.item.description,
    };
  }

  prepareDatepickerDate(dateStr: string) {
    return prepareDatepickerDate(dateStr);
  }
}

window.customElements.define("add-edit-special-rep-req", AddEditSpecialRepReq);
export { AddEditSpecialRepReq as AddEditSpecialRepReqEl };
