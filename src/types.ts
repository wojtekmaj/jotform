enum UserStatus {
  ACTIVE='ACTIVE',
  DELETED='DELETED',
  SUSPENDED='SUSPENDED'
}
export type UserSettings = {
  username: string;
  name: string;
  email: string;
  website: string;
  time_zone: string;
  account_type: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  // "region": "US",
  is_verified: "0" | '1',
  // "usage": "https://api.jotform.com/user/usage",
  company?: string;
  // "new_users_campaign": "1740167520",
  // "loginToGetSubmissions": "1",
  // "loginToViewUploadedFiles": "1",
  // "loginToViewSubmissionRSS": "1",
  showJotFormPowered: '0' | '1';
  // "defaultTheme": "5e6b428acc8c4e222d1beb91",
  // "formListingsTestUser": "1",
  // "users_campaign_extended": "new_users_campaign",
  // "smartPDFFormCreation": "25801",
  // "language": "en-US",
  avatarUrl: string;
  // "is2FAEnabled": false,
  // "disableViewLimits": false
}

// Form
enum FormStatus {
  ENABLED='ENABLED',
  DISABLED='DISABLED',
  DELETED='DELETED'
}
enum FormType {
  LEGACY='LEGACY',
  CARD='CARD'
}
export type Form = {
  id: string;
  username: string;
  title: string;
  height: string;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  last_submission: string | null;
  new: string;
  count: string;
  type: FormType;
  favorite: '0' | '1';
  archived: '0' | '1';
  url: string;
};
