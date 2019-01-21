import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';

/**
 * @polymer
 * @mixinFunction
 */
const UserPermissionsMixin = dedupingMixin((baseClass: any) =>
    class extends baseClass {

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
            'editInterventionDetails'
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

    });

// @ts-ignore
export default UserPermissionsMixin;
