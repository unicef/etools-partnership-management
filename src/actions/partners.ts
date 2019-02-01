export const SET_PARTNERS = 'SET_PARTNERS';


export const setPartners = (partners: []) => {
  return {
    type: SET_PARTNERS,
    partners
  };
}
