import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import { Constructor } from '../../typings/globals.types';
import { PolymerElement } from '@polymer/polymer';

/**
 * @polymer
 * @mixinFunction
 */
function UserPermissionsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class userPermissionsClass extends baseClass {

    public getAllPermissions() {
      return {
        defaultPermissions: [
          'loggedInDefault',
          'userInfoMenu',
          'viewPartnerDetails',
          'viewAgreementDetails',
          'viewInterventionDetails'
        ],
        unicefUserPermissions: [
        ],
        superPermissions: [
          'loggedInDefault',
          'userInfoMenu',
          'interventionsMenu',
          'statsMenu',
          'viewPartnerDetails',
          'editPartnerDetails',
          'viewAgreementDetails',
          'editAgreementDetails',
          'viewInterventionDetails',
          'editInterventionDetails'
        ],
        partnershipManagerPermissions: [
          'partnershipManager',
          'editPartnerDetails',
          'editAgreementDetails',
          'editInterventionDetails'
        ],
        PMEPermissions: [
          'PME'
        ],
        ICTPermissions: [
          'ICT'
        ]
      };
    }

    public userIsPme(user: any) {
      if (!user || !Array.isArray(user.groups)) {
        return false;
      }
      return !! user.groups.find((grp: any) => {
        return grp.name === 'PME';
      });
    }

  };

  return userPermissionsClass;
}

export default UserPermissionsMixin;
