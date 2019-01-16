const pmpEdpoints = {
  changeCountry: {
    url: '/api/v3/users/changecountry/'
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
    template: '/api/v2/agreements/',
    exp: 30 * 60 * 1000, // 30min
    cacheTableName: 'agreements'
  },
  agreementDetails: {
    template: '/api/v2/agreements/<%=id%>/'
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
    url: '/api/v2/partners/',
    exp: 6 * 60 * 60 * 1000, // 6h
    cacheTableName: 'partners'
  },
  partnerDetails: {
    template: '/api/v2/partners/<%=id%>/'
    // exp: 6 * 1000, // 6 sec
    // if this caching key is missing then the data will be cached with the url as key
    // cachingKey: 'partnerDetails'
  },
  createPartner: {
    template: '/api/v2/partners/add/?vendor=<%=vendor%>'
  },
  deletePartner: {
    template: '/api/v2/partners/delete/<%=id%>/'
  },
  partnerStaffMembers: {
    template: '/api/v2/partners/<%=id%>/staff-members/'
  },
  interventions: {
    url: '/api/v2/interventions/',
    exp: 10 * 60 * 1000,
    cacheTableName: 'interventions'
  },
  interventionDetails: {
    template: '/api/v2/interventions/<%=id%>/'
  },
  interventionDelete: {
    template: '/api/v2/interventions/delete/<%=id%>/'
  },
  pdAttachments: {
    template: '/api/v2/interventions/<%=pdId%>/attachments/'
  },
  updatePdAttachment: {
    template: '/api/v2/interventions/attachments/<%=attId%>/'
  },
  dropdownsPmp: {
    url: '/api/v2/dropdowns/pmp',
    exp: 6 * 60 * 60 * 1000, // 6h
    cachingKey: 'dropdownsPmp'
  },
  dropdownsStatic: {
    url: '/api/v2/dropdowns/static',
    exp: 6 * 60 * 60 * 1000, // 6h
    cachingKey: 'dropdownsStatic'
  },
  locations: {
    url: '/api/locations-light',
    exp: 60 * 60 * 60 * 1000, // 60h
    cachingKey: 'locations'
  },
  offices: {
    url: '/api/offices',
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
    url: '/api/v2/reports/sections/',
    exp: 6 * 60 * 60 * 1000,
    cachingKey: 'sections'
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
  partnerTPMProgrammaticVisits: {
    template: '/api/tpm/visits/?ordering=reference_number&status=unicef_approved&tpm_activities__partner=<%=partnerId%>'
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
  getPrpClusterIndicators: { // by cluster id
    template: '/api/indicator/ca/?clusters=<%=id%>',
    token: 'prp'
  },
  getPrpClusterIndicator: { // by id
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
  reportAttachment: {
    template: '/api/unicef/<%=countryId%>/progress-reports/<%=reportId%>/attachment/',
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
  pdLocationsExport: {
    url: '/api/v2/interventions/locations/'
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
  }
};

export default pmpEdpoints;
