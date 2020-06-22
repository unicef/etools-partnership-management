export const SET_PARTNERS = 'SET_PARTNERS';
export const DELETE_PARTNER = 'DELETE_PARTNER';

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
