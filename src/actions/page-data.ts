export const SET_PAGE_DATA_PERMISSIONS = 'SET_PAGE_DATA_PERMISSIONS';
export const SET_IN_AMENDMENT_MODE_STATE = 'SET_IN_AMENDMENT_MODE_STATE';

export const setPageDataPermissions = (permissions: any) => {
  return {
    type: SET_PAGE_DATA_PERMISSIONS,
    permissions
  }
}

export const setInAmendment = (inAmendment: boolean) => {
  return {
    type: SET_IN_AMENDMENT_MODE_STATE,
    in_amendment: inAmendment
  };
}
