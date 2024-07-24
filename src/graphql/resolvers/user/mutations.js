import { Sequelize } from 'sequelize'
import UsersDataModel from '../../../models/user_data.model'
import UsersModel from '../../../models/users.modal'
import {
  createToken,
  encrypt,
  getCrmPassedCourses,
  handleLMSError,
  sendSupportEmail,
} from '../../../utils/common'
import {
  LearnUponClass,
  UserClass,
  addUserInLMSGroup,
  addUserPassedCertification,
  checkCRMUser,
  createOrUpdateUserLog,
  enrollCourse,
  getAccessToken,
  handleUserDataUpdateInDb,
  inviteUserCheckEmail,
  sendVerificationEmailWithOTP,
} from './user.service'
import AssessmentProgress from '../../../models/assessment_progress'
import CourseModel from '../../../models/courses.model'
import { AdminClass } from '../admin/admin.service'
import {
  ERROR_MESSAGE,
  LOG_MODULE,
  LOG_TYPE,
  RESPONSE_MESSAGE,
  USER_ROLE,
  USER_TYPES,
} from '../../../utils/constant'
import { ApiResponse } from '../../../utils/output'
const userClass = new UserClass()
const admin = new AdminClass()

const userMutations = {
  userRegistration: async (_, args) => {
    const messages = []
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      mhfaConnect,
      addressline1,
      addressline2,
      state,
      city,
      zipcode,
      describeDietaryRestrictions,
      dietaryRestrictions,
      publicProfile,
      getNewsletter,
      jobTitle,
      organization,
      isPartOfOrganization,
      mfaOptions,
      password,
      confirmPassword,
      lmsCourseId,
    } = args
    const userData = await UsersModel.findOne({ where: { email } })

    try {
      let tag
      const progress = await AssessmentProgress.findOne({
        where: { user_id: userData.id, isCompleted: true },
        order: [['updated_at', 'DESC']],
      })
      const accessToken = await getAccessToken()
      const lmsClass = new LearnUponClass(accessToken)
      if (progress) {
        const course = await CourseModel.findByPk(progress?.course_id)
        tag = course?.name?.includes('Adult') ? 'Adult' : 'Youth' // depending upon tag the group decided to be added in LMS it can be youth or adult
      }

      if (userData) {
        let updatedUserData
        if (password) {
          updatedUserData = {
            updated_date: new Date(),
            password: encrypt(password), // adding password for shopify integration
          }
        } else {
          updatedUserData = {
            updated_date: new Date(),
          }
        }

        await admin.updateUser(updatedUserData, email)

        // FETCH LATEST CUSTOM DATA FROM DEV AND SET CORRECT WAY

        const CustomData = {
          'What brings you to MHFA Connect?': mhfaConnect,
          'Work Address Line 1': addressline1,
          'Work Address Line 2': addressline2,
          'Work Address City': city,
          'Work Address State': state,
          'Work Address Zip Code': zipcode,
          'Would you like to receive news and updates from MHFA and the National Council for Mental Wellbeing?':
            getNewsletter ? 'Yes' : 'No',
          'Phone Number': phoneNumber,
          'Job Title': jobTitle,
          'Are you part of a member organization?': isPartOfOrganization
            ? 'Yes'
            : 'No',
          // "Organization name": organization || null,
          'Instructor Public Profile': publicProfile ? 'Yes' : 'No',
          'Instructor Dietary Restrictions': dietaryRestrictions || 'None',
          'Instructor Dietary Restrictions - If Allergies/Other Preferences, please describe':
            describeDietaryRestrictions || null,
          'do you teach mhfa in or for one of the following groups? (select n/a if you do not teach mhfa in or for any of the groups.)':
            mfaOptions || null,
        }

        try {
          messages.push({
            message:
              "Conducting an initial check on the user's account status within the LMS portal.",
            isError: false,
            text: 'Check Connect account status.',
          })
          const res = await lmsClass.checkUser(email)
          messages.push({
            message:
              'User data retrieved successfully from the LMS portal, the account already exists.',
            isError: false,
            text: 'Verified Connect account exists.',
          })
          const learnUponUser = res?.data?.user[0]
          const userDataForLms = {
            User: {
              first_name: firstName,
              last_name: lastName,
              CustomData,
            },
          }
          /***
           * In future we may get already created group so need to change accordingly
           * ***/
          // add group member based on tag
          messages.push({
            message: "Updating User's data at LMS Portal",
            isError: false,
            text: 'Updating Connect account.',
          })

          const updateUserRes = await lmsClass.updateUser(
            userDataForLms,
            learnUponUser.id
          )

          if (updateUserRes) {
            messages.push({
              message:
                "User's Data has been updated successfully at LMS Portal",
              isError: false,
              text: 'Connect account updated.',
            })
          }

          if (tag) {
            await addUserInLMSGroup(
              tag,
              messages,
              email,
              learnUponUser,
              lmsClass,
              mfaOptions
            )
          }
          if (lmsCourseId) {
            await enrollCourse(
              lmsCourseId,
              email,
              messages,
              lmsClass,
              userData?.id
            )
          }
          await createOrUpdateUserLog(
            {
              log_module: LOG_MODULE.PROFILE_SAVED,
              log_description: 'Profile Updated',

              log_type: LOG_TYPE.EVENT,
            },
            userData?.id
          )

          await createOrUpdateUserLog(
            {
              log_module: LOG_MODULE.LMS_ACCOUNT_UPDATED,
              log_description: `LMS Account Updated - ${learnUponUser.id}`,

              log_type: LOG_TYPE.EVENT,
            },
            userData?.id
          )
        } catch (error) {
          console.log('%cmutations.js line:145 error', 'color: #007acc;', error)
          const userDataForLms = {
            User: {
              email: email,
              password: password,
              first_name: firstName,
              last_name: lastName,
              user_type: 'learner',
              CustomData,
            },
          }
          messages.push({
            message:
              'Creating User account at LMS as User not exists in LMS portal',
            isError: false,
            text: 'Check Connect account status.',
          })
          const data = await lmsClass.createUser(userDataForLms)
          if (data) {
            messages.push({
              message: 'User created successfully at LMS portal',
              isError: false,
              text: 'Connect account Created.',
            })
            if (tag) {
              await addUserInLMSGroup(
                tag,
                messages,
                email,
                data?.data,
                lmsClass,
                mfaOptions
              )
            }
            if (lmsCourseId) {
              await enrollCourse(
                lmsCourseId,
                email,
                messages,
                lmsClass,
                userData?.id
              )
            }
          }

          await createOrUpdateUserLog(
            {
              log_module: LOG_MODULE.PROFILE_SAVED,
              log_description: 'Profile Created',

              log_type: LOG_TYPE.EVENT,
            },
            userData?.id
          )
          await createOrUpdateUserLog(
            {
              log_module: LOG_MODULE.LMS_ACCOUNT_CREATED,
              log_description: `LMS Account Created - ${data?.data?.id}`,

              log_type: LOG_TYPE.EVENT,
            },
            userData?.id
          )
        }

        const updatedData = await UsersDataModel.upsert(
          {
            email,
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            mhfa_connect: mhfaConnect || null,
            addressline1,
            addressline2: addressline2 || null,
            state,
            city,
            zipcode,
            describe_dietary_restrictions: describeDietaryRestrictions || null,
            dietary_restrictions: dietaryRestrictions || null,
            public_profile: publicProfile ?? false,
            get_news_letter: getNewsletter,
            job_title: jobTitle,
            organization: organization || null,
            is_part_of_organization: isPartOfOrganization,
            mfa_options: mfaOptions,
            user_id: userData.id,
            updated_date: new Date(),
            created_at: Sequelize.literal('NOW()'),
          },
          { where: { user_id: userData.id } }
        )

        // crm User create or  update Api
        // await integrateCRM(email,firstName, messages)
        if (updatedData) {
          await admin.updateUser(
            {
              isMHA: true,
            },
            email
          )
          const token = createToken(userData.id, userData.email)
          const user = {
            id: userData.id,
            email: userData.email,
            is_active: userData.is_active,
            is_council_member: userData.is_council_member,
          }
          return ApiResponse.Output({ message: messages, token, data: user })
        }
      }
      return ApiResponse.Error({ message: messages })
    } catch (error) {
      const err = handleLMSError(error, messages)
      await createOrUpdateUserLog(
        // add error in user log
        {
          log_module: LOG_MODULE.LOGGED_IN,
          log_description: `Error - ${err}`,

          log_type: LOG_TYPE.ERROR,
        },
        userData?.id
      )
      return ApiResponse.Error({ message: messages, error: error.message })
    }
  },

  ResendOtp: async (_, args) => {
    try {
      const { email } = args
      const { otp, expirationTime } = sendVerificationEmailWithOTP(email)

      const singleData = await UsersModel.findOne({ where: { email } })
      if (!singleData) {
        return ApiResponse.Error({
          is_email_sent: false,
          message: ERROR_MESSAGE.EMAIL_NOT_FOUND,
          status: 404,
        })
      }
      const data = await admin.updateUser(
        {
          otp,
          is_email_verified: false,
          expiration_time: expirationTime,
          updated_date: new Date(),
        },
        email
      )
      if (data) {
        return ApiResponse.Output({
          is_email_sent: true,
          message: RESPONSE_MESSAGE.OTP_SEND,
        })
      }
      return ApiResponse.Error({
        is_email_sent: false,
        message: ERROR_MESSAGE.VERIFY_AGAIN,
        status: 400,
      })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  VerifyOtp: async (_, args) => {
    try {
      const { otp, email, userType } = args
      const data = await UsersModel.findOne({ where: { email } })
      if (
        data.otp == otp
        // &&
        // data.expiration_time.toISOString() > new Date().toISOString()
      ) {
        await admin.updateUser({ updated_date: new Date() }, email)
        if (userType !== USER_TYPES.ADMIN)
          await createOrUpdateUserLog(
            // adding log for ott login
            {
              log_module: LOG_MODULE.LOGGED_IN,
              log_description: `Logged in via OTT - ${userType}`,

              log_type: LOG_TYPE.EVENT,
            },
            data?.id
          )
        return ApiResponse.Output({ message: RESPONSE_MESSAGE.OTP_VERIFY })
      }
      return ApiResponse.Output({
        message: ERROR_MESSAGE.OTP_EXPIRED,
        status: 400,
      })
    } catch (error) {
      console.log('error -------------------------------->', error)
      return ApiResponse.Output({ error: error.message })
    }
  },

  CheckUserEmail: async (_, args) => {
    let userData
    let isInvited = false
    let courseId
    let lmsCourseId
    let isMHA
    let learnUponUserId = ''
    let message = 'User is Present'
    let success = true
    let status = 200
    let learnerStatus
    let waivePreCheck = false
    let isProfileCompleted = false
    try {
      const { email, mappingId, userId } = args
      userData = await userClass.getUser(email)
      const accessToken = await getAccessToken()
      const lmsClass = new LearnUponClass(accessToken)

      if (mappingId && userId) {
        // if invitation Id and userId exist in params
        const {
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
        } = await inviteUserCheckEmail(mappingId, userId, email, lmsClass)

        userData = learner_data
        isMHA = learner_isMHA
        isInvited = learner_isInvited
        courseId = learner_courseId
        lmsCourseId = learner_lmsCourseId
        learnUponUserId = learner_learnUponUserId
        message = learner_message
        success = learner_success
        status = learner_status
        learnerStatus = learner_learnerStatus
        waivePreCheck = learner_waive_pre_check
        isProfileCompleted = learner_isProfileCompleted
      } else {
        try {
          // Check user email in LMS portal
          const lmsUser = await lmsClass.checkUser(email)
          const learnUponUser = lmsUser?.data?.user[0]
          isMHA = true
          if (learnUponUser?.id) {
            learnUponUserId = learnUponUser.id
          }

          let createdUserData
          if (!userData) {
            // Create user in our database because user not exist
            createdUserData = await admin.createUser({
              email,
              updated_date: new Date(),
              created_date: new Date(),
              isMHA: true,
            })
            userData = createdUserData
          }

          await handleUserDataUpdateInDb(email, learnUponUser, userData?.id) // update LMS data in database
        } catch (err) {
          if (!userData) {
            const { expirationTime, otp } = sendVerificationEmailWithOTP(email)
            const createdUserData = await admin.createUser({
              email,
              otp,
              is_email_verified: false,
              expiration_time: expirationTime,
              created_date: new Date(),
            })
            userData = createdUserData
          }
          isMHA = false
        }
        // add certificate entry
        await addUserPassedCertification(userData, lmsClass)
      }
      return ApiResponse.Output({
        message,
        success,
        status,
        is_email_sent: !userData?.is_email_verified,
        data: userData,
        isMHA: isMHA ?? false,
        learnUponUserId: learnUponUserId,
        isInvited: isInvited,
        courseId: courseId,
        learnerStatus,
        lmsCourseId,
        waivePreCheck,
        isProfileCompleted,
      })
    } catch (error) {
      console.log(
        '%cmutations.js line:436 error.mes',
        'color: #007acc;',
        error.message
      )

      return ApiResponse.Error({
        message: ERROR_MESSAGE.USER_NOT_FOUND,
        is_email_sent: false,
        isMHA: false,
        isInvited: isInvited,
        waivePreCheck,
      })
    }
  },

  CheckAdminOrRequestEmail: async (_, args) => {
    try {
      const { email, role_id } = args
      const user = await userClass.getUserByRole(email, role_id)
      let isMHA = false
      if (user) {
        try {
          const accessToken = await getAccessToken()
          const lmsClass = new LearnUponClass(accessToken)
          const res = await lmsClass.checkUser(email)
          if (res) {
            isMHA = true
            await UsersModel.update(
              {
                isMHA: true,
              },
              {
                where: {
                  email,
                },
              }
            )
          }
        } catch (error) {
          const { expirationTime, otp } = sendVerificationEmailWithOTP(email)
          await UsersModel.update(
            {
              otp,
              expiration_time: expirationTime,
              isMHA: true,
            },
            {
              where: {
                email,
              },
            }
          )
          isMHA = false
        }

        return ApiResponse.Output({ isMHA: isMHA, data: user })
      } else {
        return ApiResponse.Error({ isMHA: false })
      }
    } catch (error) {
      return ApiResponse.Error({ isMHA: false, error: error.message })
    }
  },

  CheckCRM: async (_, args) => {
    const { email } = args
    try {
      const lmsCourses = await checkCRMUser(email) //get courses of user in crm
      const user = await userClass.getUser(email)

      if (!lmsCourses || lmsCourses.length === 0) {
        await createOrUpdateUserLog(
          // adding log for Pre - Req
          {
            log_module: LOG_MODULE.PRE_REQ_CHECK,
            log_description: `Prerequisite Failed`,

            log_type: LOG_TYPE.EVENT,
          },
          user?.id
        )
        return ApiResponse.Error({
          message: ERROR_MESSAGE.CRM_NOT_FOUND,
          iSCRM: false,
          status: 404,
        })
      }
      const courses = await CourseModel.findAll({})
      const crmPassedCourses = getCrmPassedCourses(courses, lmsCourses) // checked for passes courses
      const crmPassedCourseName = crmPassedCourses?.map(
        (_c) => _c.name?.split(' ')[0]
      )

      const logDescription = crmPassedCourseName?.length
        ? `Prerequisite Passed - ${crmPassedCourseName?.join(', ')}`
        : `Prerequisite Failed`

      await createOrUpdateUserLog(
        // adding log for Pre - Req
        {
          log_module: LOG_MODULE.PRE_REQ_CHECK,
          log_description: logDescription,

          log_type: LOG_TYPE.EVENT,
        },
        user?.id
      )
      if (!crmPassedCourses || crmPassedCourses.length === 0) {
        return ApiResponse.Error({
          message: 'ncbh_firstaidercoursetype value is null or empty',
          iSCRM: false,
          status: 404,
        })
      }
      await admin.updateUser({ isCRMVerify: true }, email)
      return ApiResponse.Output({
        message: RESPONSE_MESSAGE.CRM_USER,
        iSCRM: true,
        crmPassedCourses: crmPassedCourses,
      })
    } catch (error) {
      console.log('%cmutations.js line:541 error', 'color: #007acc;', error)
      return ApiResponse.Error({ iSCRM: false, error: error.message })
    }
  },

  CreateOrUpdateUserLog: async (_, args) => {
    const { log_module, log_description, user_id } = args
    try {
      await createOrUpdateUserLog(
        // Adding user log
        {
          log_module: log_module,
          log_description: log_description,
          log_type: LOG_TYPE.EVENT,
        },
        user_id
      )
      return ApiResponse.Output({})
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  CreateSupport: async (_, args) => {
    const { firstName, email, lastName, state } = args
    try {
      const user = await userClass.getUser(email)
      await userClass.createSupport({
        firstname: firstName,
        email,
        lastname: lastName,
        address1_stateorprovince: state,
        user_id: user?.id,
      })
      const resu =await createOrUpdateUserLog(
        {
          log_module: LOG_MODULE.SUPPORT,
          log_description: `Support ticket created`,

          log_type: LOG_TYPE.EVENT,
        },
        user?.id
      )
      sendSupportEmail(email)
      return ApiResponse.Output({ message: 'Support Added' })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  UpdateSupport: async (_, args) => {
    const { firstName, email, lastName, state, support_id } = args
    try {
      const support = await userClass.getSupportById(support_id)
      if (!support) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.SUPPORT_NOT_FOUND,
        })
      }
      await userClass.updateSupport(
        {
          firstname: firstName,
          email,
          lastname: lastName,
          address1_stateorprovince: state,
        },
        support_id
      )
      return ApiResponse.Output({ message: 'Support Updated' })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  DeleteSupport: async (_, args) => {
    const { support_id } = args
    try {
      const support = await userClass.getSupportById(support_id)
      if (!support) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.SUPPORT_NOT_FOUND,
        })
      }
      await userClass.updateSupport(
        {
          is_deleted: true,
        },
        support_id
      )
      return ApiResponse.Output({ message: 'Support Deleted' })
    } catch (error) {
      console.log('%cmutations.js line:716 error', 'color: #007acc;', error)
      return ApiResponse.Error({ error: error.message })
    }
  },

  WaivePreCheck: async (_, args) => {
    const { user_id, certificate_id } = args
    try {
      const certificate = await userClass.getCertificateById(certificate_id);
      await userClass.createUserCertification({
        certificate_id: certificate_id,
        user_id: user_id,
        certificate_status: 'waived_pre_check',
      })
      await createOrUpdateUserLog(
        {
          log_module: LOG_MODULE.WAIVE_PRE,
          log_description: `Waived Pre Check for ${certificate?.name}`,
          log_type: LOG_TYPE.EVENT,
        },
        user_id
      )

      return ApiResponse.Output({
        message: 'Waive Pre Check added for certification',
      })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  getCertification: async (_, args) => {
    const { user_id, certificate_id } = args
    try {
      const certificate = await userClass.getUserCertification(
        user_id,
        certificate_id
      )
      return ApiResponse.Output({
        message: 'Success',
        data: certificate,
      })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },
}

export default userMutations
