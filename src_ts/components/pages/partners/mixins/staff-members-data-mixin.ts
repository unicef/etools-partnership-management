import {LitElement, property} from 'lit-element';
import EndpointsMixin from '../../../endpoints/endpoints-mixin-lit';
import {fireEvent} from '../../../utils/fire-custom-event';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {MinimalStaffMember} from '../../../../models/partners.models';
import {Constructor} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
function StaffMembersDataMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class StaffMembersDataClass extends EndpointsMixin(baseClass) {
    @property({type: Array})
    staffMembers!: [];

    @property({type: String})
    staffLoadingMsgSource = 'staff-m';

    // This method will be used in the main element as observer for agreement.partner
    // or in other partner id changed observer
    getPartnerStaffMembers(newId: number) {
      if (newId > 0) {
        fireEvent(this, 'global-loading', {
          message: 'Loading...',
          active: true,
          loadingSource: this.staffLoadingMsgSource
        });
        const endpoint = this.getEndpoint('partnerStaffMembers', {id: newId});

        sendRequest({
          endpoint: endpoint
        })
          .then((response: any) => {
            this._handleStaffMembersResponse(response);
          })
          .catch((error: any) => {
            logError('Getting staff members failed for partner: ' + newId, 'staff-members-data-mixin', error);
            fireEvent(this, 'toast', {
              text: 'Can not get selected partner staff members data!',
              showCloseBtn: true
            });
          });
      }
    }

    _handleStaffMembersResponse(res: any) {
      if (res instanceof Array && res.length) {
        const activeStaffMembers = res
          .map(function (sMember) {
            return new MinimalStaffMember(sMember);
          })
          .filter(function (sMember) {
            return sMember.active;
          });
        this.staffMembers = activeStaffMembers;
      }
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: this.staffLoadingMsgSource
      });
    }
  }
  return StaffMembersDataClass;
}

export default StaffMembersDataMixin;
