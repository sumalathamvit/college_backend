import CourseModel from '../../../models/courses.model'
import LearnerTrainingMapping from '../../../models/learner_training_mapping.model'
import TrainigModel from '../../../models/training.model'
import UsersDataModel from '../../../models/user_data.model'
import UsersModel from '../../../models/users.modal'
import { encrypt, getLmsPassedCourses } from '../../../utils/common'
import {
  ERROR_MESSAGE,
  LOG_MODULE,
  LOG_TYPE,
  RESPONSE_MESSAGE,
  USER_TYPES,
} from '../../../utils/constant'
import { ApiResponse } from '../../../utils/output'
import { AssessmentClass } from '../assestmentlog/assessment.service'
import {
  LearnUponClass,
  UserClass,
  UserLogClass,
  createOrUpdateUserLog,
  getAccessToken,
} from './user.service'

const assessmentClass = new AssessmentClass()
const userClass = new UserClass()
const userLog = new UserLogClass()

const userQueries = {
  CheckUserDetails: async (_, args, context) => {
    // console.log('%cqueries.js line:33 req', 'color: #007acc;', req.session);
    // if (context.req.session) {
    //   context.req.session.password = "encryptedPassword";
    // }

    // context.req.session.save();

    try {
      const { email, password, userType } = args
      const user = await userClass.getUser(email)
      const accessToken = await getAccessToken()
      const lmsClass = new LearnUponClass(accessToken)
      const User = {
        user: {
          login: email,
          password: password,
          next: '',
        },
        next: '',
        auth_code: '',
      }

      // Example usage

      const encryptedPassword = encrypt(password)
      await UsersModel.update(
        {
          password: encryptedPassword,
        },
        {
          where: {
            email,
          },
        }
      )
      try {
        await lmsClass.checkUserPassword(User)
        if (userType !== USER_TYPES.ADMIN) {
          await createOrUpdateUserLog(
            // adding log for Password login
            {
              log_module: LOG_MODULE.LOGGED_IN,
              log_description: `Logged in via Password - ${userType}`,
              log_type: LOG_TYPE.EVENT,
            },
            user?.id
          )
        }

        return ApiResponse.Output({ message: RESPONSE_MESSAGE.LOGIN_SUCCESS })
      } catch (error) {
        return ApiResponse.Error({
          error: error.message,
          message: ERROR_MESSAGE.INVALID_CREDENTIALS,
          status: 404,
        })
      }
    } catch (error) {
      console.log('%cqueries.js line:99 error', 'color: #007acc;', error)
      return ApiResponse.Error({
        error: error.message,
        message: ERROR_MESSAGE.INVALID_CREDENTIALS,
        status: 500,
      })
    }
  },

  GetUserDetailByUserId: async (_, args) => {
    try {
      const { user_id } = args
      const user = await UsersModel.findByPk(user_id)
      const data = await UsersDataModel.findOne({
        where: { user_id },
      })
      const userData = {
        ...data?.dataValues,
        isMHA: user?.isMHA,
      }
      await createOrUpdateUserLog(
        // Adding Log for Profile
        {
          log_module: LOG_MODULE.PROFILE_STARTED,
          log_description: LOG_MODULE.PROFILE_STARTED,
          log_type: LOG_TYPE.EVENT,
        },
        user_id
      )
      return ApiResponse.Output({ message: 'User is present', data: userData })
    } catch (error) {
      console.log('catch-- ----------------->', error)
      return ApiResponse.Error({ error: error.message })
    }
  },

  CheckUserIsCeritifiedMHFA: async (_, args) => {
    try {
      const { email, course_id } = args
      try {
        const accessToken = await getAccessToken()
        const lmsClass = new LearnUponClass(accessToken)
        const user = await userClass.getUser(email)
        const allLmsCourses = await lmsClass.getCourses() // all LMS Course
        let courses
        if (course_id) {
          // condition for invited user pre-req check(training)
          courses = await CourseModel.findAll({
            where: {
              id: course_id,
            },
          })
        } else {
          courses = await CourseModel.findAll({}) // get db courses
        }
        const userLMSEnrollment = await lmsClass.checkUserEnrollment(email) // get LMS enrollments
        const preReqPassesCourses = getLmsPassedCourses(
          courses,
          userLMSEnrollment?.data?.enrollments,
          allLmsCourses?.data
        ) // check for pre Req of lms courses
        const courseName = preReqPassesCourses?.map(
          (_c) => _c?.name?.split(' ')[0]
        )

        if (courseName?.length) {
          // adding log for Pre - Req
          await createOrUpdateUserLog(
            {
              log_module: LOG_MODULE.PRE_REQ_CHECK,
              log_description: `Prerequisite Passed - ${courseName?.join(
                ', '
              )}`,
              log_type: LOG_TYPE.EVENT,
            },
            user?.id
          )
        }

        return ApiResponse.Output({
          message: RESPONSE_MESSAGE.ENROLLMENT,
          data: preReqPassesCourses,
        })
      } catch (error) {
        console.log('%cqueries.js line:177 error', 'color: #007acc;', error)
        return ApiResponse.Error({ error: error.message })
      }
    } catch (error) {
      console.log('catch-- ----------------->', error)
      return ApiResponse.Error({ error: error.message })
    }
  },

  CheckLMSUser: async (_, args) => {
    try {
      const { email } = args

      try {
        const accessToken = await getAccessToken()
        const lmsClass = new LearnUponClass(accessToken)
        await lmsClass.checkUser(email)

        await UsersModel.update({ isMHA: true }, { where: { email } })
        return ApiResponse.Output({})
      } catch (err) {
        await UsersModel.update({ isMHA: false }, { where: { email } })
        return ApiResponse.Error({
          message: ERROR_MESSAGE.FAILED,
          status: 404,
        })
      }
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  GetInvitedUserResult: async (_, args) => {
    try {
      const { invitationId, userId } = args

      const invitationData = await LearnerTrainingMapping.findOne({
        where: {
          id: invitationId,
        },
      })
      if (invitationData) {
        const training = await TrainigModel.findByPk(
          invitationData?.training_id
        )
        const assessmentHistoryExists =
          await assessmentClass.getAssessmentByUserIdAndCourseId(
            userId,
            training?.training_course_id
          )

        if (assessmentHistoryExists?.status === 'Submission') {
          invitationData.status = 'passed'
        }
        if (assessmentHistoryExists?.status === 'Failed') {
          invitationData.status = 'failed'
        }
        return ApiResponse.Output({ data: invitationData })
      } else {
        return ApiResponse.Error({ message: 'Fail', status: 404 })
      }
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  GetUserLogs: async (_, args) => {
    try {
      const { user_id, limit, start_date, end_date } = args
      const userLogs = await userLog.getUserLogsByUserId(
        user_id,
        start_date,
        end_date,
        limit || 100
      )
      // userLogs = filterUserLogs(start_date, end_date, limit || 100, userLogs);
      return ApiResponse.Output({ data: userLogs })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },
  GetSupport: async (_, args) => {
    try {
      let support = await userClass.getSupport()
      support = support?.map((_s) => ({
        id: _s?.id,
        first_name: _s?.firstname,
        last_name: _s?.lastname,
        state: _s?.address1_stateorprovince,
        email: _s?.email,
        is_deleted: _s?.is_deleted,
      }))

      return ApiResponse.Output({ data: support })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },
}

export default userQueries
