/**
 * Types for the licence data returned by the API
 */
export interface LicenceData {
  tradeLicenseNumber: string;
  adcciNumber: string;
  tradeName: string;
  licenseType: string;
  branch: string;
  issuancePlace: string;
  establishmentDate: string;
  registrationDate: string;
  expiryDate: string;
  licenseStatus: string;
  address: string;
  establishmentVolume: string;
  legalForm: string;
  socialMediaAccount: string;
  socialMediaType: string;
  webSiteUrl: string;
  socialEnterpriseMaan: string;
  licenseActivities: string[];
}
