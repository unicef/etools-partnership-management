import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import EtoolsAjaxRequestMixin from 'etools-ajax/etools-ajax-request-mixin.js';
import EndpointsMixin from '../../../endpoints/endpoints-mixin.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import { MinimalStaffMember } from '../../../../typings/partner.types.js';
import {fireEvent} from '../../../utils/fire-custom-event';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin EtoolsAjaxRequestMixin
 * @appliesMixin EndpointsMixin
 */
const StaffMembersDataRequiredMixinsList = [
  EtoolsLogsMixin,
  EtoolsAjaxRequestMixin,
  EndpointsMixin
];

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin StaffMembersDataRequiredMixinsList
 */
const StaffMembersData = dedupingMixin((baseClass: any) => class extends
   EtoolsMixinFactory.combineMixins(StaffMembersDataRequiredMixinsList, baseClass) {
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
        // @ts-ignore
        self.logError('Getting staff members failed for partner: ' + newId, 'staff-members-data-mixin', error);
        // @ts-ignore
        fireEvent(self, 'toast', {text: 'Can not get selected partner staff members data!', showCloseBtn: true});
      });
    }
  }

  public _handleStaffMembersResponse(res: any) {
    if (res instanceof Array && res.length) {
      let activeStaffMembers = res.map(function(sMember) {
         return new MinimalStaffMember(sMember.id, sMember.first_name,
            sMember.last_name, sMember.active);
      }).filter(function(sMember) {
        return sMember.active;
      });
      // @ts-ignore
      this.set('staffMembers', activeStaffMembers);
    }
    // @ts-ignore
    fireEvent(this, 'global-loading', {active: false, loadingSource: this.staffLoadingMsgSource});
  }

});

export default StaffMembersData;
