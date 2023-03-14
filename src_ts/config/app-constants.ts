import {GenericObject} from '@unicef-polymer/etools-types/dist/global.types';

const CONSTANTS = {
  PD_EXPORT_TYPES: {
    PdResult: 'PD Result',
    PdBudget: 'PD Budget',
    PdLocations: 'PD Locations'
  },
  DEFAULT_LIST_SIZE: 10,
  DOCUMENT_TYPES: {
    PD: 'PD',
    SSFA: 'SSFA',
    SHPD: 'SHPD',
    SPD: 'SPD',
    ProgrammeDocument: 'Programme Document',
    SmallScaleFundingAgreement: 'Small Scale Funding Agreement',
    SimplifiedHumanitarianProgrammeDocument: 'Simplified Humanitarian Programme Document'
  },
  AGREEMENT_TYPES: {
    PCA: 'PCA',
    SSFA: 'SSFA',
    MOU: 'MOU'
  },
  STATUSES: {
    Draft: 'Draft',
    Signed: 'Signed',
    Active: 'Active',
    Suspended: 'Suspended',
    Terminated: 'Terminated',
    Ended: 'Ended',
    Closed: 'Closed'
  },
  PARTNER_STATUSES: {
    NotSynced: 'Not Synced',
    SyncedFromVISION: 'Synced from VISION',
    BlockedInVISION: 'Blocked in VISION',
    MarkedForDeletionInVISION: 'Marked For Deletion in VISION'
  },
  REQUIREMENTS_REPORT_TYPE: {
    QPR: 'QPR', // Quarterly Progress Report
    HR: 'HR', // Humanitarian Report
    SPECIAL: 'SPECIAL', // Special Report
    SR: 'SR' // Special Report, value frm PRP
  }
};

export const appLanguages: GenericObject[] = [
  {value: 'en', display_name: 'English'},
  {value: 'fr', display_name: 'French'},
  {value: 'es', display_name: 'Spanish'},
  {value: 'ar', display_name: 'Arabic'},
  {value: 'pt', display_name: 'Portuguese'},
  {value: 'ru', display_name: 'Russian'}
];

export default CONSTANTS;
