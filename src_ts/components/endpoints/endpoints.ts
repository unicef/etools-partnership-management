const pmpEdpoints = {
  changeCountry: {
    url: '/api/v3/users/changecountry/'
  },
  changeOrganization: {
    url: '/api/v3/users/changeorganization/'
  },
  unicefUsers: {
    url: '/api/v3/users/?verbosity=minimal',
    exp: 60 * 60 * 1000, // 1h
    cachingKey: 'unicefUsers'
  },
  myProfile: {
    url: '/api/v3/users/profile/'
  },
  agreements: {
    template: '/api/pmp/v3/agreements/',
    exp: 30 * 60 * 1000, // 30min
    cacheTableName: 'agreements'
  },
  agreementDetails: {
    template: '/api/pmp/v3/agreements/<%=id%>/'
  },
  agreementDelete: {
    template: '/api/v2/agreements/delete/<%=id%>/'
  },
  partnerAssessmentDelete: {
    template: '/api/v2/partners/assessments/<%=id%>/'
  },
  interventionResultLinkDelete: {
    template: '/api/v2/interventions/result-links/<%=id%>/'
  },
  agreementAmendmentsDelete: {
    template: '/api/v2/agreements/amendments/<%=id%>/'
  },
  agreementAmendmentsTypeDelete: {
    template: '/api/v2/agreements/amendments/types/<%=id%>/'
  },
  countries: {
    url: '/api/countries/', // API request receives a 404 for now
    exp: 6 * 60 * 60 * 1000, // 6h
    cachingKey: 'countries'
  },
  partners: {
    url: '/api/pmp/v3/partners/',
    exp: 6 * 60 * 60 * 1000, // 6h
    cacheTableName: 'partners'
  },
  partnerDetails: {
    template: '/api/v2/partners/<%=id%>/'
    // exp: 6 * 1000, // 6 sec
    // if this caching key is missing then the data will be cached with the url as key
    // cachingKey: 'partnerDetails'
  },
  partnerActivities: {
    template: '/api/v1/field-monitoring/planning/activities/?page_size=all&hact_for_partner=<%=id%>'
  },
  createPartner: {
    template: '/api/v2/partners/add/?vendor=<%=vendor%>'
  },
  deletePartner: {
    template: '/api/v2/partners/delete/<%=id%>/'
  },
  partnerStaffMembers: {
    template: '/api/pmp/v3/partners/<%=id%>/staff-members/'
  },
  interventions: {
    url: '/api/pmp/v3/interventions/?show_amendments=true'
  },
  gddInterventions: {
    url: '/api/gdd/gdds/?show_amendments=true'
  },
  interventionDetails: {
    template: '/api/v2/interventions/<%=id%>/'
  },
  gddInterventionDetails: {
    template: '/api/gdd/gdds/<%=id%>/'
  },
  interventionDelete: {
    template: '/api/v2/interventions/delete/<%=id%>/'
  },
  gddInterventionDelete: {
    template: '/api/gdd/gdds/delete/<%=id%>/'
  },
  pdAttachments: {
    template: '/api/v2/interventions/<%=pdId%>/attachments/'
  },
  updatePdAttachment: {
    template: '/api/v2/interventions/attachments/<%=attId%>/'
  },
  dropdownsPmp: {
    url: '/api/pmp/v3/dropdowns/dynamic/',
    exp: 6 * 60 * 60 * 1000, // 6h
    cachingKey: 'dropdownsPmp'
  },
  dropdownsStatic: {
    url: '/api/v2/dropdowns/static/',
    exp: 6 * 60 * 60 * 1000, // 6h
    cachingKey: 'dropdownsStatic'
  },
  locations: {
    url: '/api/locations-light',
    exp: 60 * 60 * 60 * 1000, // 60h
    cachingKey: 'locations'
  },
  offices: {
    url: '/api/offices/v3/',
    exp: 6 * 60 * 60 * 1000, // 6h
    cachingKey: 'offices'
  },
  // TODO: might not be needed, gov in simple removed
  countryProgrammes: {
    cachingKey: 'countryProgrammes',
    exp: 5 * 60 * 1000, // 5min
    url: '/api/v2/reports/countryprogramme/'
  },
  sections: {
    url: '/api/sections/v3/',
    exp: 6 * 60 * 60 * 1000,
    cachingKey: 'sections'
  },
  sites: {
    url: '/api/v1/field-monitoring/settings/sites/?page_size=all',
    exp: 6 * 60 * 60 * 1000,
    cachingKey: 'sites'
  },
  ramIndicators: {
    template: '/api/v2/reports/results/<%=id%>/indicators/'
  },
  monitoringVisits: {
    template: '/api/t2f/travels/activities/partnership/<%=id%>/?year=<%=year%>'
  },
  partnerT2fProgrammaticVisits: {
    template: '/api/t2f/travels/activities/<%=id%>/?year=<%=year%>&status=completed'
  },
  partnerTPMActivities: {
    template:
      '/api/tpm/activities/?tpm_visit__status=unicef_approved&is_pv=true&date__year=<%=year%>&partner=<%=partnerId%>'
  },
  interventionTPMActivities: {
    template:
      '/api/tpm/activities/?tpm_visit__status=unicef_approved&date__year=<%=year%>&intervention=<%=interventionId%>'
  },
  sectorLocationsDelete: {
    template: '/api/v2/interventions/sector-locations/<%=id%>/'
  },
  cpOutputsByIdsAsValues: {
    // it's gonna be used for getting old cp outputs for esmm dropdown
    url: '/api/v2/reports/results'
  },
  frNumbersDetails: {
    url: '/api/v2/funds/frs'
  },
  userCountryDetails: {
    url: '/api/v3/users/country/'
  },
  environmentFlags: {
    url: '/api/v2/environment/flags/'
  },
  createIndicator: {
    template: '/api/v2/interventions/lower-results/<%=id%>/indicators/'
  },
  getEditDeleteIndicator: {
    template: '/api/v2/interventions/applied-indicators/<%=id%>/'
  },
  getPrpClusterIndicators: {
    // by cluster id
    template: '/api/indicator/ca/?clusters=<%=id%>',
    token: 'prp'
  },
  getPrpClusterIndicator: {
    // by id
    template: '/api/indicator/<%=id%>/',
    token: 'prp'
  },
  getResponsePlans: {
    template: '/api/core/workspace/<%=countryId%>/response-plan/',
    token: 'prp'
  },
  pdExpectedResults: {
    template: '/api/v2/interventions/<%=pdId%>/result-links/'
  },
  pdExpectedResultDetails: {
    template: '/api/v2/interventions/result-links/<%=resultId%>/'
  },
  pdLowerResults: {
    template: '/api/v2/interventions/result-links/<%=resultId%>/lower-results/'
  },
  pdLowerResultDetails: {
    template: '/api/v2/interventions/lower-results/<%=llResultId%>/'
  },
  lowerResultsDelete: {
    template: '/api/v2/reports/lower_results/<%=id%>/'
  },
  disaggregations: {
    url: '/api/v2/reports/disaggregations/'
  },
  patchDisaggregations: {
    template: '/api/v2/reports/disaggregations/<%=id%>/'
  },
  interventionProgress: {
    template: '/api/unicef/<%=countryId%>/programme-document/<%=pdId%>/progress/?external=1',
    token: 'prp'
  },
  interventionAmendmentAdd: {
    template: '/api/v2/interventions/<%=intervId%>/amendments/'
  },
  reports: {
    template: '/api/unicef/<%=countryId%>/progress-reports/',
    token: 'prp'
  },
  hrClusterReportingRequirements: {
    template: '/api/indicator/reporting-frequencies/',
    token: 'prp'
  },
  reportDetails: {
    template: '/api/unicef/<%=countryId%>/progress-reports/<%=reportId%>/',
    token: 'prp'
  },
  reportAttachments: {
    template: '/api/unicef/<%=countryId%>/progress-reports/<%=reportId%>/attachments/',
    token: 'prp'
  },
  reportIndicatorsDetails: {
    template: '/api/indicator/indicator-reports/',
    token: 'prp'
  },
  reportingRequirements: {
    template: '/api/v2/interventions/<%=intervId%>/reporting-requirements/<%=reportType%>/'
  },
  specialReportingRequirements: {
    template: '/api/v2/reports/interventions/<%=intervId%>/special-reporting-requirements/'
  },
  specialReportingRequirementsUpdate: {
    template: '/api/v2/reports/interventions/special-reporting-requirements/<%=reportId%>/'
  },
  reportRequirementsList: {
    template: '/api/v2/interventions/<%=intervId%>/reporting-periods/'
  },
  reportRequirementsItem: {
    template: '/api/v2/interventions/reporting-periods/<%=reportId%>/'
  },
  reportReview: {
    template: '/api/unicef/<%=countryId%>/progress-reports/<%=reportId%>/review/',
    token: 'prp'
  },
  progressReports: {
    template: '/api/unicef/<%=countryId%>/progress-reports/',
    token: 'prp'
  },
  getPRPCountries: {
    template: '/api/core/workspace/',
    exp: 60 * 60 * 60 * 1000,
    token: 'prp',
    cachingKey: 'prpCountries'
  },
  downloadReportAnexC: {
    template: '/api/unicef/<%=countryId%>/progress-reports/<%=reportId%>/annex-C-export-PDF/',
    token: 'prp'
  },
  downloadReportXls: {
    template: '/api/unicef/<%=countryId%>/progress-reports/<%=reportId%>/?page=1&export=xlsx',
    token: 'prp'
  },
  downloadReportPdf: {
    template: '/api/unicef/<%=countryId%>/progress-reports/<%=reportId%>/?page=1&export=pdf',
    token: 'prp'
  },
  reportIndicatorsExport: {
    template: '/api/unicef/<%=countryId%>/programme-document/indicators/',
    token: 'prp'
  },
  // tokens get/refresh endpoints
  prpToken: {
    url: '/api/jwt/get'
  },
  engagements: {
    url: '/api/audit/engagements/hact/'
  },
  resultExports: {
    url: '/api/v2/reports/applied-indicators/intervention/'
  },
  gddResultExports: {
    url: '/api/gdd/gdds/results/'
  },
  pdLocationsExport: {
    url: '/api/v2/interventions/locations/'
  },
  gddLocationsExport: {
    url: '/api/gdd/gdds/locations/?format=csv'
  },
  attachmentsUpload: {
    url: '/api/v2/attachments/upload/'
  },
  cpOutputRamIndicators: {
    template: '/api/v2/interventions/<%=intervention_id%>/output_cp_indicators/<%=cp_output_id%>/'
  },
  partnerAssessment: {
    template: '/api/v2/partners/assessments/'
  },
  patchPartnerAssessment: {
    template: '/api/v2/partners/assessments/<%=assessmentId%>/'
  },
  expectedResultsExport: {
    template: '/api/v2/reports/interventions/results/<%=intervention_id%>/?format=docx_table'
  },
  interventionPVLinkDelete: {
    template: '/api/v2/interventions/<%=intervention_id%>/planned-visits/<%=id%>/'
  },
  importECN: {
    url: '/api/ecn/v1/interventions/import/ecn/'
  },
  unicefRepresentatives: {
    url: '/api/v3/users/unicef-representatives/'
  }
};

export default pmpEdpoints;
