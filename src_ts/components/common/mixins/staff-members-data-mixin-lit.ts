import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {MinimalStaffMember} from '../../../models/partners.models';
import {Constructor} from '@unicef-polymer/etools-types';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../endpoints/endpoints';
import {get as getTranslation} from 'lit-translate';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
function StaffMembersDataMixinLit<T extends Constructor<LitElement>>(baseClass: T) {
  class StaffMembersDataClass extends EndpointsLitMixin(baseClass) {
    @property({type: Array})
    staffMembers!: MinimalStaffMember[];

    @property({type: String})
    staffLoadingMsgSource = 'staff-m';

    // This method will be used in the main element as observer for agreement.partner
    // or in other partner id changed observer
    getPartnerStaffMembers(newId: number, showLoading: boolean) {
      if (newId > 0) {
        if (showLoading) {
          fireEvent(this, 'global-loading', {
            active: true,
            loadingSource: this.staffLoadingMsgSource
          });
        }
        const endpoint = this.getEndpoint(pmpEdpoints, 'partnerStaffMembers', {id: newId});

        sendRequest({
          endpoint: endpoint
        })
          .then((response: any) => {
            this._handleStaffMembersResponse(response);
          })
          .catch((error: any) => {
            EtoolsLogger.error('Getting staff members failed for partner: ' + newId, 'staff-members-data-mixin', error);
            fireEvent(this, 'toast', {
              text: getTranslation('ERROR_ON_RETRIEVING_PARTNER_STAFF_MEMBERS')
            });
          });
      }
    }

    _handleStaffMembersResponse(res: any) {
      if (res instanceof Array && res.length) {
        const prefixedStaffMembers = res.map(function (sMember) {
          return new MinimalStaffMember(sMember);
        });
        this.staffMembers = prefixedStaffMembers;
      }
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: this.staffLoadingMsgSource
      });
    }
  }
  return StaffMembersDataClass;
}

export default StaffMembersDataMixinLit;
