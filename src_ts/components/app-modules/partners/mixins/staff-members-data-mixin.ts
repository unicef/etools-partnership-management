//import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import EtoolsAjaxRequestMixin from 'etools-ajax/etools-ajax-request-mixin.js';
import EndpointsMixin from '../../../endpoints/endpoints-mixin.js';
import {fireEvent} from '../../../utils/fire-custom-event';
import {logError} from 'etools-behaviors/etools-logging.js';
import { Constructor } from '../../../../typings/globals.types.js';
import { PolymerElement } from '@polymer/polymer';
import { MinimalStaffMember } from '../../../../models/partners.models.js';



/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsAjaxRequestMixin
 * @appliesMixin EndpointsMixin
 */
function StaffMembersData<T extends Constructor<PolymerElement>>(baseClass: T) {
  // @ts-ignore
  class staffMembersData extends EndpointsMixin(EtoolsAjaxRequestMixin(baseClass)) {
    static get properties() {
      return {
        staffMembers: Array,
        staffLoadingMsgSource: String
      };
    }

    public staffMembers: any[] = [];
    public staffLoadingMsgSource: string = 'staff-m';

    // This method will be used in the main element as observer for agreement.partner
    // or in other partner id changed observer
    public getPartnerStaffMembers(newId: number) {
      if (newId > 0) {

        // @ts-ignore
        fireEvent(this, 'global-loading', {
          message: 'Loading...',
          active: true,
          loadingSource: this.staffLoadingMsgSource
        });
        // @ts-ignore
        let endpoint = this.getEndpoint('partnerStaffMembers', {id: newId});
        let self = this;

        // @ts-ignore
        this.sendRequest({
          endpoint: endpoint
        }).then(function(response: any) {
          self._handleStaffMembersResponse(response);
        }).catch(function(error: any) {
          logError('etting staff members failed for partner: ' + newId, 'staff-members-data-mixin', error);
          fireEvent(self, 'toast', {text: 'Can not get selected partner staff members data!', showCloseBtn: true});
        });
      }
    }

    public _handleStaffMembersResponse(res: any) {
      if (res instanceof Array && res.length) {
        let activeStaffMembers = res.map(function(sMember) {
          return new MinimalStaffMember(sMember);
        }).filter(function(sMember) {
          return sMember.active;
        });
        // @ts-ignore
        this.set('staffMembers', activeStaffMembers);
      }
      // @ts-ignore
      fireEvent(this, 'global-loading', {active: false, loadingSource: this.staffLoadingMsgSource});
    }
  };
  return staffMembersData;
}

export default StaffMembersData;
