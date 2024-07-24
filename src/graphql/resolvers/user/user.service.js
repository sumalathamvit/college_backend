import axios from 'axios'
import UsersModel from '../../../models/users.modal'
import UserLogModel from '../../../models/user_logs.model'
import SupportModel from '../../../models/support.model'
import CertificationModel from '../../../models/certificate.model'
import UserCertificateModel from '../../../models/user_certificate.model'

import dotenv from 'dotenv'
import {
  generateSixDigitNumber,
  getCrmPassedCourses,
  getDateBeforeThreeYear,
  getLmsPassedCourses,
  handleLMSError,
  mapGroupWithName,
  sendEmailVerification,
} from '../../../utils/common'
import { AdminClass } from '../admin/admin.service'
import LearnerTrainingMapping from '../../../models/learner_training_mapping.model'
import { CrmClass } from '../crm/crm.service'
import {
  FLORIDA_MFA_OPTION,
  GROUP_NAME,
  LOG_MODULE,
  LOG_TYPE,
} from '../../../utils/constant'
import OAuthTokenModel from '../../../models/oauth_token'
import { Sequelize, Op, where } from 'sequelize'
import { AssessmentClass } from '../assestmentlog/assessment.service'
import Certification from '../../../models/certificate.model'

dotenv.config()
const learnUponStoreUrl = process.env.LEARNUPON_STORE_URL
const dynamicsUrl = process.env.DYNAMIC_URL
const clientId = process.env.LMS_CLIENT_ID
const clientSecret = process.env.LMS_CLIENT_SECRET
const tokenEndpoint = process.env.LMS_ACCESS_TOKEN_URL
// const username = process.env.LEARNUPON_USERNAME;
// const password = process.env.LEARNUPON_PASSWORD;
// const authString = Buffer.from(`${username}:${password}`).toString("base64");

const admin = new AdminClass()
const crmClass = new CrmClass()
const assessmentClass = new AssessmentClass()

export class LearnUponClass {
  token
  commonHeaders

  constructor(token) {
    this.token = token
    this.commonHeaders = {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    }
  }

  async checkUser(email) {
    return axios.get(
      `${learnUponStoreUrl}/api/v1/users/search?email=${encodeURIComponent(
        email
      )}`,
      this.commonHeaders
    )
  }

  async createUser(User) {
    return axios.post(
      `${learnUponStoreUrl}/api/v1/users`,
      User,
      this.commonHeaders
    )
  }

  async updateUser(User, id) {
    return axios.put(
      `${learnUponStoreUrl}/api/v1/users/${id}`,
      User,
      this.commonHeaders
    )
  }

  async checkUserPassword(User) {
    return axios.post(
      `${learnUponStoreUrl}/users/sign_in.json`,
      User
      // {
      //   headers: {
      //     Authorization: `Basic ${authString}`,
      //   },
      // }
    )
  }

  async checkUserEnrollment(email) {
    return axios.get(
      `${learnUponStoreUrl}/api/v1/enrollments/search?email=${encodeURIComponent(
        email
      )}`,
      this.commonHeaders
    )
  }

  async getGroups() {
    return axios.get(`${learnUponStoreUrl}/api/v1/groups`, this.commonHeaders)
  }

  async addGroupMember(group) {
    return axios.post(
      `${learnUponStoreUrl}/api/v1/group_memberships`,
      group,
      this.commonHeaders
    )
  }

  async getGroupMember(groupId) {
    return axios.get(
      `${learnUponStoreUrl}/api/v1/group_memberships?group_id=${groupId}`,
      this.commonHeaders
    )
  }

  async checkGroupMemberByUserId(userId) {
    return axios.get(
      `${learnUponStoreUrl}/api/v1/group_memberships?user_id=${userId}`,
      this.commonHeaders
    )
  }

  async getCourses() {
    return axios.get(`${learnUponStoreUrl}/api/v1/courses`, this.commonHeaders)
  }

  async enrollUserInCourse(data) {
    return axios.post(
      `${learnUponStoreUrl}/api/v1/enrollments`,
      data,
      this.commonHeaders
    )
  }

  async retrieveLMSAccessToken() {
    return OAuthTokenModel.findOne(
      {},
      {
        where: {
          id: 1,
        },
      }
    )
  }
  async refreshAccessToken(data, tokenEndpoint) {
    return axios.post(tokenEndpoint, data, {
      headers: {
        Accept: '*/*',
      },
    })
  }
  async storeAccessToken(data) {
    return OAuthTokenModel.update(data, {
      where: {
        id: 1,
      },
    })
  }
}
const lmsClass = new LearnUponClass()

export class UserClass {
  async getUser(email) {
    return UsersModel.findOne({
      where: {
        email,
      },
    })
  }

  async getUserByRole(email, role_id) {
    return UsersModel.findOne({
      where: {
        email,
        role_id,
      },
    })
  }
  async updateDbUser(user, id) {
    return UsersModel.update(user, {
      where: {
        id,
      },
    })
  }

  async createSupport(data) {
    return SupportModel.create(data)
  }

  async updateSupport(data, id) {
    return SupportModel.update(data, {
      where: {
        id,
      },
    })
  }

  async getSupport() {
    return SupportModel.findAll({
      where: {
        is_deleted: false,
      },
    })
  }

  async getSupportById(id) {
    return SupportModel.findOne({
      where: {
        id,
      },
    })
  }

  async createUserCertification(data) {
    return UserCertificateModel.create(data)
  }

  async getUserCertification(user_id, certificate_id) {
    return UserCertificateModel.findOne({
      where: {
        user_id,
        certificate_id,
      },
    })
  }

  async getCertificateById(id) {
    return CertificationModel.findOne({
      where: {
        id,
      },
    })
  }
  async getCertificationByUserId(user_id) {
    return CertificationModel.findAll({
      where: {
        user_id,
      },
    })
  }
  async updateCertification(data, user_id, course_id) {
    return CertificationModel.update(data, {
      where: {
        user_id,
        course_id,
      },
    })
  }

  async checkCrmContact(token, email) {
    return axios.get(
      `${dynamicsUrl}/api/data/v9.2/altai_evt_registrationattendees?$select=altai_name,_ncbh_firstaiderprospect_value,altai_evt_registrationattendeeid,statuscode,_altai_registrationsid_value&$expand=altai_evt_eventregistrationid($select=ncbh_instructorcourseid,altai_name,ncbh_actualenddate,ncbh_firstaidercoursetype),altai_registrationsid($select=emailaddress1)&$filter=(statuscode eq 324970000) and (altai_evt_eventregistrationid/ncbh_firstaidercoursetype ne null and altai_evt_eventregistrationid/ncbh_actualenddate gt ${getDateBeforeThreeYear()}) and (altai_registrationsid/emailaddress1 eq '${email}')&$orderby=_ncbh_firstaiderprospect_value desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
  }
  async checkCrmUser(token, email) {
    return axios.get(
      `${dynamicsUrl}/api/data/v9.2/altai_evt_registrationattendees?$select=altai_name,_ncbh_firstaiderprospect_value,altai_evt_registrationattendeeid,statuscode,_altai_registrationsid_value&$expand=altai_evt_eventregistrationid($select=ncbh_instructorcourseid,altai_name,ncbh_actualenddate,ncbh_firstaidercoursetype),altai_registrationsid($select=emailaddress1)&$filter=(altai_registrationsid/emailaddress1 eq '${email}')`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
  }
  async createCRMUser(user, token) {
    return axios.post(
      `${dynamicsUrl}/api/data/v9.2/altai_evt_registrationattendees`,
      user,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
  }
  async updateCRMUser(user, token, email) {
    return axios.post(
      `${dynamicsUrl}/api/data/v9.2/altai_evt_registrationattendees`,
      user,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
  }
  async addCRMUserToGroup(groupId, token) {
    return axios.post(
      `${dynamicsUrl}/api/data/v9.2/altai_evt_registrationattendees`,
      user,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
const userClass = new UserClass()

export class UserLogClass {
  async getUserLogsByUserId(userId, start_date, end_date, limit) {
    const whereClause = {
      user_id: userId,
    }

    if (start_date && end_date) {
      whereClause.timestamp = {
        [Op.between]: [start_date, end_date],
      }
    }
    return UserLogModel.findAll({
      where: whereClause,
      limit: limit,
      order: [['timestamp', 'DESC']],
    })
  }

  async updateUserLog(data, userId) {
    return UserLogModel.update(data, {
      where: {
        user_id: userId,
      },
    })
  }
  async createUserLog(data) {
    return UserLogModel.create(data)
  }
}
const userLog = new UserLogClass()

export const enrollCourse = async (
  lmsCourseId,
  email,
  messages,
  lmsClass,
  userId
) => {
  try {
    messages.push({
      message: `Enrolling User in LMS Course`,
      isError: false,
      text: 'Enrolling user in Connect course.',
    })

    const enrollment = await lmsClass.checkUserEnrollment(email)
    const enrollmentExists = enrollment?.data?.enrollments?.find(
      (_c) => _c.course_id === +lmsCourseId
    )

    if (enrollmentExists) {
      messages.push({
        message: `User has already enrolled the course`,
        isError: false,
        text: 'User already have connect course',
      })
    } else {
      try {
        await lmsClass.enrollUserInCourse({
          Enrollment: {
            email: email,
            course_id: lmsCourseId,
          },
        })
        await createOrUpdateUserLog(
          //  Add user log for lms enrollment
          {
            log_module: LOG_MODULE.ENROLLED,
            log_description: `User Enrolled LMS Course - ${lmsCourseId}`,
            log_type: LOG_TYPE.EVENT,
          },
          userId
        )
        messages.push({
          message: `User Enrolled in course Successfully`,
          isError: false,
          text: 'User enrolled in Connect course.',
        })
      } catch (error) {
        handleLMSError(error, messages)
      }
    }
  } catch (error) {
    messages.push({
      message: error.message,
      isError: true,
      text: error.message,
    })
  }
}

const addGroupMember = async (groupId, messages, data, lmsClass) => {
  try {
    const groupOfUser = await lmsClass.checkGroupMemberByUserId(data?.id) // get all group of user

    const isMemberExists = groupOfUser?.data?.group?.find(
      (_g) => _g?.id === groupId
    ) // check member exists in group
    const groupName = mapGroupWithName[groupId] // get group name
    if (!isMemberExists) {
      await lmsClass.addGroupMember({
        // add in group as it is not in group
        GroupMembership: {
          group_id: groupId,
          user_id: data?.id,
        },
      })

      messages.push({
        message: `Adding User in ${groupName}`,
        isError: false,
        text: `Adding Connect account to group: ${groupName}`,
      })
    } else {
      messages.push({
        message: `User already exists in the ${groupName}, So No need to add`,
        isError: false,
        text: `Connect already exists in ${groupName}`,
      })
    }
  } catch (error) {
    // console.log("%cuser.service.js line:306 error", "color: #007acc;", error);
    messages.push({
      message: error.message,
      isError: true,
      text: error.message,
    })
  }
}

export const addUserInLMSGroup = async (
  tag,
  messages,
  email,
  data,
  lmsClass,
  mfaOptions
) => {
  try {
    messages.push({
      message: 'Retrieving a list of user groups from the LMS portal.',
      isError: false,
      text: 'Retrieving Connect account user groups.',
    })

    const mhfaGroup = await lmsClass.getGroups()
    const groups = mhfaGroup?.data?.groups

    const assessmentGroupId =
      tag?.toLowerCase() === GROUP_NAME.YOUTH
        ? process.env.LMS_YOUTH_GROUP_ID
        : process.env.LMS_ADULT_GROUP_ID

    const generalGroupId = process.env.LMS_GENERAL_GROUP_ID
    const sacfGroupId = process.env.LMS_SACF_GENERAL_GROUP_ID
    await addGroupMember(+assessmentGroupId, messages, data, lmsClass) // checking group for youth or adult
    await addGroupMember(+generalGroupId, messages, data, lmsClass) //checking general group

    if (mfaOptions === FLORIDA_MFA_OPTION) {
      // checking for mfaoptions is equal to "Florida Department of Education (FL DOE)"
      await addGroupMember(+sacfGroupId, messages, data, lmsClass) //checking general group
    }
  } catch (error) {
    console.log('%cuser.service.js line:347 error', 'color: #007acc;', error)
    messages.push({
      message: error.message,
      isError: true,
      text: error.message,
    })
  }
}

export const sendVerificationEmailWithOTP = (email) => {
  const otp = generateSixDigitNumber()
  sendEmailVerification(email, otp)
  return {
    otp,
    expirationTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  }
}

//updating lms data in database
export const handleUserDataUpdateInDb = async (
  email,
  learnUponUser,
  userId
) => {
  try {
    let userData
    const userDataModelObj = {
      email,
      first_name: learnUponUser?.first_name,
      last_name: learnUponUser?.last_name,
      phone_number: learnUponUser?.CustomData?.phone_number,
      mhfa_connect:
        learnUponUser?.CustomData?.['what_brings_you_to_mhfa_connect?'],
      addressline1: learnUponUser?.CustomData?.work_address_line_1,
      addressline2: learnUponUser?.CustomData?.work_address_line_2 || null,
      state: learnUponUser?.CustomData?.work_address_state || null,
      city: learnUponUser?.CustomData?.work_address_city || null,
      zipcode: learnUponUser?.CustomData?.work_address_zip_code || null,
      describe_dietary_restrictions:
        learnUponUser?.CustomData?.[
          'instructor_dietary_restrictions_-_if_allergies/other_preferences,_please_describe'
        ] || null,
      dietary_restrictions:
        learnUponUser?.CustomData?.['instructor_dietary_restrictions'] || null,
      public_profile:
        learnUponUser?.CustomData?.instructor_public_profile || null,
      get_news_letter:
        learnUponUser?.CustomData?.[
          'would_you_like_to_receive_news_and_updates_from_mhfa_and_the_national_council_for_mental_wellbeing?'
        ] || false,
      job_title: learnUponUser?.CustomData?.job_title || null,
      organization: learnUponUser.CustomData?.organization_name || null,
      is_part_of_organization:
        learnUponUser?.CustomData?.are_you_part_of_a_member_organization ===
        'Yes',
      mfa_options:
        learnUponUser?.CustomData?.[
          'do_you_teach_mhfa_in_or_for_one_of_the_following_groups?_(select_n/a_if_you_do_not_teach_mhfa_in_or_for_any_of_the_groups.)' ||
            null
        ],
      updated_date: new Date(),
      created_date: new Date(),
    }

    const userDataInfoByID = await admin.getUserDataById(userId) // find userData by userDataId

    if (userDataInfoByID) {
      await admin.updateUserDataByUserId(userDataModelObj, userId) // update userData if userData already exists
    } else {
      userDataModelObj.user_id = userId
      userData = await admin.createUserData(userDataModelObj) // create userData
    }
  } catch (error) {
    console.log(error)
  }
}

const checkInvitedLearnerStatus = async (userId, courseId, mappingId) => {
  // Check if assessment history exists for the user and course.
  const assessmentHistoryExists =
    await assessmentClass.getAssessmentByUserIdAndCourseId(userId, courseId)
  let status

  if (assessmentHistoryExists) {
    // If assessment status is "Submission," set status to "passed"; if "Failed," set status to "failed."
    if (assessmentHistoryExists?.status === 'Submission') {
      status = 'passed'
    }
    if (assessmentHistoryExists?.status === 'Failed') {
      status = 'failed'
    }
  } else {
    // If no assessment history exists, update status to "clicked" for invited users.
    await LearnerTrainingMapping.update(
      { status: 'clicked' },
      { where: { id: mappingId, status: 'invited' } }
    )
  }
  return {
    status,
    isProfileCompleted: assessmentHistoryExists?.is_profile_completed,
  }
}

export const inviteUserCheckEmail = async (
  mappingId,
  userId,
  email,
  lmsClass
) => {
  let learner_data
  let learner_isInvited = false
  let learner_courseId
  let learner_lmsCourseId
  let learner_isMHA
  let learner_learnUponUserId = ''
  let learner_message = 'User is Present'
  let learner_success = true
  let learner_status = 200
  let learner_learnerStatus
  let learner_waive_pre_check = false
  let learner_isProfileCompleted = false

  //checking user exist in lms or not
  try {
    const lmsUser = await lmsClass.checkUser(email)
    const learnUponUser = lmsUser?.data?.user[0]
    learner_isMHA = true

    // Handle user data creation or update
    await handleUserDataUpdateInDb(email, learnUponUser, userId)
    if (learnUponUser.id) learner_learnUponUserId = learnUponUser.id
    await userClass.updateDbUser({ isMHA: true }, userId)
  } catch (error) {
    const { expirationTime, otp } = sendVerificationEmailWithOTP(email) // send verification email
    await admin.updateUser(
      {
        email,
        otp,
        is_email_verified: false,
        expiration_time: expirationTime,
        created_date: new Date(),
        isMHA: false,
      },
      email
    )
    learner_isMHA = false
  }

  // Get the status of learner
  const mappingData = await admin.getLearnerMappingById(mappingId) // get Invitation data
  learner_waive_pre_check = mappingData?.waive_pre_check
  const userData = await admin.findUserDataByPk(mappingData?.user_data_id)
  const user = await admin.findUser(userData?.user_id)
  if (+user?.id === userId && user?.email === email) {
    const trainingDetails = await admin.getTrainingById(
      //find training details
      mappingData?.training_id
    )

    const { status: updatedStatus, isProfileCompleted } =
      await checkInvitedLearnerStatus(
        userId,
        trainingDetails?.training_course_id,
        mappingId
      )
    learner_isProfileCompleted = isProfileCompleted
    learner_learnerStatus = updatedStatus || mappingData?.status
    learner_courseId = trainingDetails?.training_course_id
    learner_lmsCourseId = trainingDetails?.lms_course_id
    learner_data = user
    learner_message = 'User is Invited and Verified'
  } else {
    learner_message = 'User is Not Invited and UnAuthorized'
    learner_success = false
    learner_status = 500
  }
  learner_isInvited = true

  // add certificate entry
  await addUserPassedCertification(userData?.id, lmsClass, learner_courseId)

  return {
    learner_isMHA,
    learner_learnUponUserId,
    learner_message,
    learner_success,
    learner_status,
    learner_learnerStatus,
    learner_data,
    learner_isInvited,
    learner_courseId,
    learner_lmsCourseId,
    learner_waive_pre_check,
    learner_isProfileCompleted,
  }
}

export const checkCRMUser = async (email) => {
  try {
    const token = await crmClass.getCrmAccessToken()

    const response = await userClass.checkCrmContact(
      token?.data?.access_token,
      encodeURIComponent(email)
    )

    return response?.data?.value
  } catch (error) {
    return error
  }
}

export const integrateCRM = async (email, firstName, messages) => {
  try {
    const token = await crmClass.getCrmAccessToken()
    messages.push({
      message:
        "Conducting an initial check on the user's account status within the CRM.",
      isError: false,
    })
    const crmUser = await userClass.checkCrmUser(
      token?.data?.access_token,
      email
    )
    if (!crmUser.data.value.length) {
      messages.push({
        message: 'Start creating user as it is not exist in CRM.',
        isError: false,
      })
      await userClass.createCRMUser(
        {
          first_name: firstName,
          email: email,
        },
        token
      )

      messages.push({
        message: 'User created in crm successfully',
        isError: false,
      })
    } else {
      messages.push({
        message: "Update User's Data in crm as user already exists",
        isError: false,
      })
      await userClass.updateCRMUser(
        {
          first_name: firstName,
          email: email,
        },
        token,
        email
      )
    }
    messages.push({
      message: "Update User's Data in crm as user already exists",
      isError: false,
    })

    // await userClass.addCRMUserToGroup(groupId,token);
  } catch (error) {
    messages.push({
      message: error.message,
      isError: true,
    })
  }
}

export const isAccessTokenExpired = (expirationTime) => {
  const expDate = new Date(expirationTime)
  const currTime = new Date()
  return expirationTime && expDate < currTime
}

export const getAccessToken = async () => {
  try {
    let accessToken = await lmsClass.retrieveLMSAccessToken()
    const expirationTime = accessToken.expires_at
    const refreshToken = accessToken.refresh_token
    accessToken = accessToken.access_token
    if (!accessToken || isAccessTokenExpired(expirationTime)) {
      const refreshTokenPayload = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }
      const tokenResponse = await lmsClass.refreshAccessToken(
        refreshTokenPayload,
        tokenEndpoint
      )
      accessToken = tokenResponse.data?.access_token
      await lmsClass.storeAccessToken({
        access_token: tokenResponse.data?.access_token,
        refresh_token: tokenResponse.data?.refresh_token,
        expires_at: Sequelize.literal("NOW() + INTERVAL '55 minutes'"),
      })
    }
    return accessToken
  } catch (error) {
    console.log('%cuser.service.js line:518 error', 'color: #007acc;', error)
    throw error
  }
}

export const createOrUpdateUserLog = async (Logs, userId) => {
  try {
    await userLog.createUserLog({
      user_id: userId,
      log_type: Logs?.log_type,
      log_module: Logs?.log_module,
      log_description: Logs?.log_description,
      timestamp: new Date()?.toISOString(),
    })
  } catch (error) {
    console.log('%cuser.service.js line:711 error', 'color: #007acc;', error)
    throw new Error(error)
  }
}

export const addUserPassedCertification = async (
  user,
  lmsClass,
  certificate_id = null
) => {
  try {
    const allLmsCourses = await lmsClass.getCourses() // all LMS Course
    let certificates, preReqPassesCourses, finalCourse
    if (certificate_id) {
      // condition for invited user pre-req check(training)
      certificates = await Certification.findAll({
        where: {
          id: certificate_id,
        },
      })
    } else {
      certificates = await Certification.findAll({}) // get db courses
    }

    const userLMSEnrollment = await lmsClass.checkUserEnrollment(user?.email) // get LMS enrollments
    preReqPassesCourses = getLmsPassedCourses(
      certificates,
      userLMSEnrollment?.data?.enrollments,
      allLmsCourses?.data
    )

    if (!preReqPassesCourses?.length) {
      // check CRM Pre-Req
      preReqPassesCourses = getCrmPassedCourses(
        certificates,
        userLMSEnrollment?.data?.enrollments
      )
    }

    const certificationPromises = preReqPassesCourses?.map(async (_c) => {
      const certificate = await userClass.getUserCertification(user?.id, _c?.id)
      if (!certificate) {
        await userClass.createUserCertification({
          certificate_id: _c?.id,
          user_id: user?.id,
          certificate_status: 'pre_req_passed',
          start_date: '',
          expire_date: '',
        })
      }
    })

    await Promise.all(certificationPromises)
  } catch (error) {
    throw new Error(error.message)
  }
}
