import dotenv from 'dotenv'
export const SALT_ROUNDS = 10

dotenv.config()
// dotenv.config({
//   path: `./${process.env.NODE_ENV}.env`,
// });

export const DATABASE = {
  USER_NAME: process.env.DB_USER,
  HOST: process.env.DB_HOST,
  DATABASE: process.env.DB_NAME,
  PASSWORD: process.env.DB_PASS,
}

export const USER_TYPES = {
  ADMIN: 'admin',
  CANDIDATE: 'learner',
  REQUEST: 'request',
}
export const USER_ROLE = {
  ADMIN: 3,
  CANDIDATE: 1,
  REQUEST: 2,
}

export const adultEnrollmentCheckSubStr = [
  'Blended Adult MHFA',
  'In-Person Adult MHFA',
  'Blended Adult Mental Health First Aid',
  'In-Person Adult Mental Health First Aid',
  'Higher Ed - In-Person Mental Health First Aid',
  'Fire/EMS - In-Person Mental Health First Aid',
  'Military, Veterans, and Their Families - In-Person Mental Health First Aid',
  'PASM para Comunidades de Habla-Hispana Presencial',
  'PASM para Comunidades de Habla-Hispana Semipresencial',
]

export const youthEnrollmentCheckSubStr = [
  'Blended Youth MHFA Version',
  'In-Person Youth MHFA Version',
  'Blended Youth Mental Health First Aid',
  'In-Person Youth Mental Health First Aid',
  'PASMJ para Comunidades de Habla-Hispana Presencial',
  'PASMJ para Comunidades de Habla-Hispana Semipresencial',
  'In-Person Youth MHFA for Tribal Communities and Indigenous Peoples',
  'In-Person Youth MHFA for Korean-speaking Communities',
  'In-Person Youth MHFA for Chinese-speaking Communities',
  'Blended Youth MHFA for Korean-speaking Communities',
  'Blended Youth MHFA for Chinese-speaking Communities',
]

export const GROUP_NAME = {
  ADULT: 'adult',
  YOUTH: 'youth',
}

export const FLORIDA_MFA_OPTION = 'Florida Department of Education (FL DOE)'

export const ADULT_COURSE = 'Adult Mental Health First Aid'
export const YOUTH_COURSE = 'Youth Mental Health First Aid'

export const USER_ACTIVITY_STATUS = {
  STARTED: 'Started',
  SCORE: 'Score',
  PROFILE: 'Profile',
  ENROLLED: 'Enrolled',
  STORE: 'Store',
  ERROR: 'Error',
}

export const LOG_MODULE = {
  LOGGED_IN: 'Logged In',
  PRE_REQ_CHECK: 'Prerequisite',
  START_ASSESSMENT: 'Started Assessment',
  SCORE: 'Score',
  PROFILE_STARTED: 'Profile Started',
  PROFILE_SAVED: 'Profile Saved',
  LMS_ACCOUNT_CREATED: 'LMS Account Created',
  SHOPIFY_ACCOUNT_CREATED: 'Shopify Account Created',
  LMS_ACCOUNT_UPDATED: 'LMS Account Updated',
  SHOPIFY_ACCOUNT_UPDATED: 'Shopify Account Updated',
  ENROLLED: 'Enrolled',
  ERROR: 'Error',
  SUPPORT:'Support Created',
  WAIVE_PRE:"Waived Pre-Check"
}

export const LOG_TYPE = {
  ERROR: 'Error',
  EVENT: 'Event',
}

export const ASSESSMENT_STATUS = {
  SUBMISSION: 'Submission',
  FAILED: 'Failed',
}

export const ERROR_MESSAGE = {
  REQUEST_NOT_FOUND: 'Request not found',
  USER_NOT_FOUND: 'User not found',
  TRAINING_NOT_FOUND: 'Training not found',
  LEARNER_NOT_FOUND: 'Learner not found',
  CANDIDATE_NOT_FOUND: 'Candidate not found',
  REQUESTER_NOT_FOUND: 'Requester not found',
  EMAIL_NOT_FOUND: 'Please verify email, email not found',
  VERIFY_AGAIN: 'Please verify again',
  OTP_EXPIRED: 'Otp is expired or not valid',
  CRM_NOT_FOUND: 'CRM user not found',
  INVALID_CREDENTIALS: 'Invisible credentials',
  FAILED: 'Failed',
  SUPPORT_NOT_FOUND:'Support not found'
}

export const RESPONSE_MESSAGE = {
  UPDATED: 'Updated',
  DELETED: 'Deleted',
  CREATED: 'Created',
  INVITED: 'Invited',
  ASSESSMENT_COMPLETED: 'Assessment completed Successfully',
  ASSESSMENT_PROGRESS_SAVED: 'Assessment Progress Saved Successfully',
  USER_ACTIVITY_STATUS_UPDATED: 'User Activity Status Updated',
  OTP_SEND: 'OTP Send Successfully',
  OTP_VERIFY: 'OTP Verify Successfully',
  CRM_USER: 'CRM User',
  LOGIN_SUCCESS: 'Login Successfully',
  ENROLLMENT: 'Enrollment of user',
}

export const LMS_PRE_REQ_COURSE_TYPE = [
  'Adult',
  'Adult - Recertification',
  'Spanish - Adult',
  'Korean - Adult',
  'Chinese - Adult',
  'Khmer - Adult',
  'Youth',
  'Youth - Recertification',
  'Spanish - Youth',
  'Korean - Youth',
  'Chinese - Youth',
  'Khmer - Youth',
]

export const CRM_COURSE_TYPE = {
  324970000: 'Adult',
  324970001: 'Youth',
  324970002: 'Spanish-Adult',
  324970003: 'Spanish-Youth',
}
