import {PolymerElement, html} from '@polymer/polymer';
import {gridLayoutStyles} from '../../../../../../../styles/grid-layout-styles';
import EndpointsMixin from '../../../../../../../endpoints/endpoints-mixin';
import AjaxErrorsParserMixin from '../../../../../../../mixins/ajax-errors-parser-mixin';
import DateMixin from '../../../../../../../mixins/date-mixin';

import '@polymer/iron-label/iron-label.js';
import '@polymer/paper-input/paper-input.js';
import 'etools-dialog/etools-dialog.js';

import 'etools-date-time/calendar-lite.js';
import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory';
import {fireEvent} from '../../../../../../../utils/fire-custom-event';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin DateMixin
 * @appliesMixin AjaxErrorsParserMixin
 */
const AddEditSpecialRepReqMixins = EtoolsMixinFactory.combineMixins([
  EndpointsMixin,
  DateMixin,
  AjaxErrorsParserMixin
], PolymerElement);


/**
 * @polymer
 * @customElement
 * @appliesMixin AddEditSpecialRepReqMixins
 */
class AddEditSpecialRepReq extends AddEditSpecialRepReqMixins {

  [x: string]: any;

  static get template() {
    // language=HTML
    return html`
      ${gridLayoutStyles}
      <style>
        :host {
          display: block
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

      <etools-dialog id="addEditDialog"
                    size="lg"
                    opened="{{opened}}"
                    dialog-title="Add/Edit Special Reporting Requirements"
                    on-confirm-btn-clicked="_save"
                    ok-btn-text="Save"
                    keep-dialog-open>
        <div class="row-h">
          <div class="col layout-vertical col-5">
            <iron-label for="startDate">
              Report Due Date
            </iron-label>
            <calendar-lite id="startDate"
                                      date="[[prepareDatepickerDate(item.due_date)]]"
                                      pretty-date="{{item.due_date}}"
                                      format="YYYY-MM-DD"></calendar-lite>
          </div>
        </div>
        <div class="row-h">
          <paper-input label="Reporting Requirement"
                      placeholder="&#8212;"
                      value="{{item.description}}">
          </paper-input>
        </div>
      </etools-dialog>
    `;
  }

  static get properties() {
    return {
      opened: {
        type: Boolean
      },
      interventionId: {
        type: Number
      },
      item: {
        type: Object
      },
      toastMsgLoadingSource: Object
    };
  }

  _isNew() {
    return !this.item.id;
  }

  _getEndpoint() {
    if (this._isNew()) {
      // new/create
      return this.getEndpoint('specialReportingRequirements', {intervId: this.interventionId});
    } else {
      // already saved... update/delete
      return this.getEndpoint('specialReportingRequirementsUpdate', {reportId: this.item.id});
    }
  }

  _save() {
    let dialog = this.$.addEditDialog;
    dialog.startSpinner();

    let endpoint = this._getEndpoint();
    let method = this._isNew() ? 'POST' : 'PATCH';
    this.sendRequest(
        {
          method: method,
          endpoint: endpoint,
          body: this._getBody()
        })
        .then((response: any) => {
          fireEvent(this, 'reporting-requirements-saved', response);
          dialog.stopSpinner();
          this.opened = false;
        })
        .catch((error: any) => {
          dialog.stopSpinner();
          this.logError('Failed to save/update special report requirement!', 'add-edit-special-rep-req', error);
          this.parseRequestErrorsAndShowAsToastMsgs(error, this.toastMsgLoadingSource);
        });
  }

  _getBody() {
    return {
      due_date: this.item.due_date,
      description: this.item.description
    };
  }

}

window.customElements.define('add-edit-special-rep-req', AddEditSpecialRepReq);
