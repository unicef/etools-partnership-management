import EndpointsMixin from '../../../endpoints/endpoints-mixin.js';
import {fireEvent} from '../../../utils/fire-custom-event';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {Constructor} from '../../../../typings/globals.types.js';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {MinimalStaffMember} from '../../../../models/partners.models.js';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
function StaffMembersDataMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class StaffMembersDataClass extends EndpointsMixin(baseClass) {
    @property({type: Array})
    staffMembers!: [];

    @property({type: String})
    staffLoadingMsgSource = 'staff-m';

    // This method will be used in the main element as observer for agreement.partner
    // or in other partner id changed observer
    public getPartnerStaffMembers(newId: number) {
      if (newId > 0) {
        fireEvent(this, 'global-loading', {
          message: 'Loading...',
          active: true,
          loadingSource: this.staffLoadingMsgSource
        });
        const endpoint = this.getEndpoint('partnerStaffMembers', {id: newId});
        const self = this;

        sendRequest({
          endpoint: endpoint
        })
          .then(function (response: any) {
            self._handleStaffMembersResponse(response);
          })
          .catch(function (error: any) {
            logError('Getting staff members failed for partner: ' + newId, 'staff-members-data-mixin', error);
            fireEvent(self, 'toast', {
              text: 'Can not get selected partner staff members data!',
              showCloseBtn: true
            });
          });
      }
    }

    public _handleStaffMembersResponse(res: any) {
      if (res instanceof Array && res.length) {
        const activeStaffMembers = res
          .map(function (sMember) {
            return new MinimalStaffMember(sMember);
          })
          .filter(function (sMember) {
            return sMember.active;
          });
        this.set('staffMembers', activeStaffMembers);
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
