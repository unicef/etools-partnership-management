export const SET_PARTNERS = 'SET_PARTNERS';
export const DELETE_PARTNER = 'DELETE_PARTNER';
export const SET_SHOULD_RELOAD_PARTNERS = 'SET_SHOULD_RELOAD_PARTNERS';

export const setPartners = (partners: []) => {
  return {
    type: SET_PARTNERS,
    partners
  };
};

export const deletePartner = (partnerId: number) => {
  return {
    type: DELETE_PARTNER,
    partnerId
  };
};

export const setShouldReloadPartners = (shouldReloadList: boolean) => {
  return {
    type: SET_SHOULD_RELOAD_PARTNERS,
    shouldReloadList
  };
};
