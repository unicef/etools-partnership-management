import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import {connect} from "pwa-helpers/connect-mixin";
import {store} from "../../store";


/**
 * @polymer
 * @mixinFunction
 */
const UserPermisionsMixin = dedupingMixin((baseClass: any) =>
    class extends connect(store)(baseClass) {

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

        // return !!_.find(user.groups, (grp) => {
        //   return grp.name === 'PME';
        // });
      }

    });



export default UserPermisionsMixin;
