export function getAllPermissions() {
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

export function userIsPme(user: any) {
  if (!user || !Array.isArray(user.groups)) {
    return false;
  }
  return !! user.groups.find((grp: any) => {
    return grp.name === 'PME';
  });
}
