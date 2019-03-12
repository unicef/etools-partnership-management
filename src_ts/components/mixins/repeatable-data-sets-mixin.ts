import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import {DynamicDialogMixin} from 'etools-dialog/dynamic-dialog-mixin.js';
import EtoolsAjaxRequestMixin from 'etools-ajax/etools-ajax-request-mixin.js';
import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory';
import EndpointsMixin from '../endpoints/endpoints-mixin.js';
import { fireEvent } from '../utils/fire-custom-event.js';
import { GenericObject } from '../../typings/globals.types.js';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin DynamicDialogMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin EtoolsAjaxRequestMixin
 */
const RepeatableDataSetsMixin = dedupingMixin((baseClass: any) =>
  class extends EtoolsMixinFactory.combineMixins([
      EtoolsLogsMixin,
      DynamicDialogMixin,
      EndpointsMixin,
      EtoolsAjaxRequestMixin
    ], baseClass) {
    [x: string]: any;

    public static get properties() {
      return {
        dataItems: {
          type: Array,
          notify: true
        },
        dataSetModel: Object,
        editMode: {
          type: Boolean,
          reflectToAttribute: true,
        },
        deleteConfirmationTitle: String,
        deleteConfirmationMessage: String,
        deleteLoadingSource: String,
        deleteActionLoadingMsg: String,
        deleteActionDefaultErrMsg: String
      };
    }

    public dataItems: any[] = [];
    public dataSetModel: object | null= null;
    public deleteConfirmationTitle: string = 'Delete confirmation';
    public deleteConfirmationMessage: string = 'Are you sure you want to delete this item?';
    public deleteLoadingSource: string = 'delete-data-set';
    public deleteActionLoadingMsg: string = 'Deleting items from server...';
    public deleteActionDefaultErrMsg: string = 'Deleting items from server action has failed!';

    private connectedCallback() {
      super.connectedCallback();
      // create delete confirmation dialog
      this._createDeleteConfirmationDialog();
    }

    private disconnectedCallback() {
      super.disconnectedCallback();
      // remove delete confirmation dialog when the element is detached
      this.deleteDialog.removeEventListener('close', this._onDeleteConfirmation);
      this.removeDialog(this.deleteDialog);
    }

    /**
     * selValue - the just selected value or id
     * selIndex - the index of the selected data item
     * itemValueName - the name of property to compare selValue against
     */
    public isAlreadySelected(selValue: any, selIndex: any, itemValueName: any) {
      let duplicateItems = this.dataItems.filter(function(item, index) {
        return parseInt(item[itemValueName]) === parseInt(selValue)
            && parseInt(String(index)) !== parseInt(selIndex);
      });
      return (duplicateItems && duplicateItems.length);
    }

    public _emptyList(listLength: number) {
      return listLength === 0;
    }

    public _getItemModelObject(addNull: any) {
      if (addNull) {
        return null;
      }
      if (this.dataSetModel === null) {
        let newObj: GenericObject = {};
        if (this.dataItems.length > 0 && typeof this.dataItems[0] === 'object') {
          Object.keys(this.dataItems[0]).forEach(function(property) {
            newObj[property] = ''; // (this.model[0][property]) ? this.model[0][property] :
          });
        }

        return newObj;
      } else {
        return JSON.parse(JSON.stringify(this.dataSetModel));
      }
    }

    public _addElement(addNull: any) {
      if (!this.editMode) {
        return;
      }
      this._makeSureDataItemsAreValid();

      let newObj = this._getItemModelObject(addNull);
      this.push('dataItems', newObj);
    }

    public _openDeleteConfirmation(event: any) {
      event.stopPropagation();
      if (!this.editMode) {
        return;
      }
      this.elToDeleteIndex = parseInt(event.target.getAttribute('data-args'), 10);
      this.deleteDialog.opened = true;
    }

    public _handleDeleteResponse() {
      this._deleteElement();
      this.elToDeleteIndex = -1;
      fireEvent(this, 'global-loading', {active: false, loadingSource: this.deleteLoadingSource});
    }

    public _handleDeleteError(responseErr: any) {
      fireEvent(this, 'global-loading', {active: false, loadingSource: this.deleteLoadingSource});

      let msg = this.deleteActionDefaultErrMsg;
      if (responseErr instanceof Array && responseErr.length > 0) {
        msg = responseErr.join('\n');
      } else if (typeof responseErr === 'string') {
        msg = responseErr;
      }
      fireEvent(this, 'toast', {text: msg, showCloseBtn: true});
    }

    public _onDeleteConfirmation(event: any) {
      this.deleteDialog.opened = false;
      if (event.detail.confirmed === true) {
        let id = this.dataItems[this.elToDeleteIndex] ? this.dataItems[this.elToDeleteIndex].id : null;

        if (id) {
          if (!this._deleteEpName) {
            this.logError('You must define _deleteEpName property to be able to remove existing records');
            return;
          }

          fireEvent(this, 'global-loading', {
            message: this.deleteActionLoadingMsg,
            active: true,
            loadingSource: this.deleteLoadingSource
          });

          let self = this;
          let deleteEndpoint = this.getEndpoint(this._deleteEpName, {id: id});
          this.sendRequest({
            method: 'DELETE',
            endpoint: deleteEndpoint,
            body: {}
          }).then(function(_resp: any) {
            self._handleDeleteResponse();
          }).catch(function(error: any) {
            self._handleDeleteError(error.response);
          });
        } else {
          this._deleteElement();
          this.elToDeleteIndex = -1;
        }
      } else {
        this.elToDeleteIndex = -1;
      }
    }

    public _deleteElement() {
      if (!this.editMode) {
        return;
      }
      let index = this.elToDeleteIndex;
      if (index !== null && typeof index !== 'undefined' && index !== -1) {
        this.splice('dataItems', index, 1);

        fireEvent(this, 'delete-confirm', {index: this.elToDeleteIndex});
      }
    }

    public _createDeleteConfirmationDialog() {
      let deleteConfirmationContent = document.createElement('div');
      deleteConfirmationContent.innerHTML = this.deleteConfirmationMessage;
      this._onDeleteConfirmation = this._onDeleteConfirmation.bind(this);
      this.deleteDialog = this.createDialog(this.deleteConfirmationTitle, 'md', 'Yes',
          'No', this._onDeleteConfirmation, deleteConfirmationContent);
    }

    /**
     * Get last data item
     */
    public _getLastDataItem() {
      if (Array.isArray(this.dataItems) && this.dataItems.length > 0) {
        return this.dataItems[this.dataItems.length - 1];
      } else {
        this._makeSureDataItemsAreValid();
        return null;
      }
    }

    /**
     * Check is dataItems is Array, if not init with empty Array
     */
    public _makeSureDataItemsAreValid(dataItems?: any) {
      let items = dataItems ? dataItems : this.dataItems;
      if (!Array.isArray(items)) {
        this.set('dataItems', []);
      }
    }

  });

export default RepeatableDataSetsMixin;

