enum UserStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  SUSPENDED = 'SUSPENDED',
}
enum Industry {
  Education='Education',
  WebDesign='Web Design',
  Religious='Religious',
  NonProfit='Non-Profit',
  EventOrganizer='Event Organizer',
  Marketing='Marketing',
  WebDevelopment='Web Development',
  Consultancy='Consultancy',
  Photography='Photography',
  SocialMedia='Social Media',
  SmallBusiness='Small Business',
  Sports='Sports',
  RealEstate='Real Estate',
  HumanResources='Human Resources',
  Other='Other'
}
type BasicUser = {
  username: string;
  name: string;
  email: string;
  website?: string;
  time_zone: string;
  account_type: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  region: string;
  is_verified: '0' | '1';
  usage: string;
  company?: string;
  industry?: Industry;
  loginToGetSubmissions: '0' | '1';
  loginToViewUploadedFiles: '0' | '1';
  loginToViewSubmissionRSS: '0' | '1';
  showJotFormPowered: '0' | '1';
  language: string;
  avatarUrl: string;
  is2FAEnabled: boolean;
  disableViewLimits: boolean;
}
export type User = BasicUser & {
  allowBoards: boolean;
  allowDigest: boolean;
  allowPrefills: boolean;
  allowSign: boolean;
  allowWorkflowFeatures: boolean;
  allowAutoDeleteSubmissions: boolean;
  teamsBetaUser: '0' | '1';
  paymentNewProductManagement: boolean;
  allowEncryptionV2: boolean;
  allowNewCondition: boolean;
  allowConditionsV2: boolean;
  isFormBuilderNewShare: boolean;
  isInputTableBetaUserEnabled: boolean;
  allowMixedListing: boolean;
  allowAIAgentFormFiller: boolean;
  allowPaymentReusableForEnterprise: boolean;
  isNewSMTPFlowEnabled: boolean;
}
export type UserSettings = BasicUser;
export type UpdateUserSettings = {
  name?: string;
  email?: string;
  website?: string;
  time_zone?: string;
  company?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  industry?: Industry;
}
export type UserUsage = {
  username: string;
 submissions: string;
 ssl_submissions: string;
 payments: string;
 uploads: string;
 mobile_submissions: string;
 views: string;
 api: number;
}

// Form
enum FormStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
  DELETED = 'DELETED',
}
enum FormType {
  LEGACY = 'LEGACY',
  CARD = 'CARD',
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

// Submission
export enum SubmissionStatus {
  ACTIVE="ACTIVE",
  OVERQUOTA="OVERQUOTA"
}
type Answer = {
  name: string;
  order: string;
  type: string;
  text: string;
} & (
  | {
      answer: Record<string, string>;
      prettyFormat?: string;
    }
  | {
      answer: string;
    }
  | {}
);
export type Submission = {
  id: string;
  form_id: string;
  ip: string;
  created_at: string;
  updated_at: string;
  status: SubmissionStatus;
  new: "0" | "1";
  flag: "0" | "1";
  notes: string;
  answers: {
    [answer: string]: Answer;
  };
  workflowStatus?: string;
}

// System
export enum PlanName {
  FREE='FREE',
  BRONZE='BRONZE',
  SILVER='SILVER',
  GOLD='GOLD',
  PLATINUM='PLATINUM'
}
export type Plan = {
  name: PlanName;
  limits: {
      submissions: number;
      overSubmissions: number;
      sslSubmissions: number;
      payments: number;
      uploads: number;
      tickets: number;
      subusers: number;
      api: number;
      views: number;
      formCount: number;
      "hipaaCompliance": boolean;
  }
  "prices": {
      "monthly": number;
      "yearly": number;
      "biyearly": number;
    },
    "plimusIDs": {
      "monthly": number;
      "yearly": number;
      "biyearly": number;
    },
    "fastSpringURLs": {
      "monthly": string;
      "yearly": string;
      "biyearly": string;
    },
}