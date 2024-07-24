import { sendInviteUser } from '../../../utils/common'
import dotenv from 'dotenv'
import {
  ERROR_MESSAGE,
  RESPONSE_MESSAGE,
  USER_ROLE,
} from '../../../utils/constant'
import { AdminClass } from './admin.service'
import { ApiResponse } from '../../../utils/output'
dotenv.config()
// dotenv.config({
//   path: `./${process.env.NODE_ENV}.env`,
// });

const adminClass = new AdminClass()

const adminMutation = {
  //request api
  createRequest: async (_, args) => {
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      addressline1,
      state,
      city,
      zipcode,
      trainingType,
      jobTitle,
      organization,
      isNationalCouncilMember,
      status,
      submissionDate,
      haveFunding,
      intrested_training,
      maxTraining,
    } = args
    try {
      let userExists = await adminClass.getUserByEmail(email) // get user by email address
      const updateUserData = userExists
        ? {
            email,
            is_council_member: isNationalCouncilMember,
          }
        : {
            email,
            is_council_member: isNationalCouncilMember,
            role_id: USER_ROLE.REQUEST,
          }
      if (userExists)
        await adminClass.updateUser(
          updateUserData, //update user if user already exists
          email
        )
      else userExists = await adminClass.createUser(updateUserData) // create user
      if (userExists) {
        const userData = await adminClass.upsertUserDataByUserId(
          {
            phone_number: phoneNumber,
            addressline1,
            state,
            city,
            zipcode,
            job_title: jobTitle,
            user_id: +userExists?.id,
          },
          userExists?.id
        )

        await adminClass.createRequest({
          users_data_id: +userData[0]?.id,
          training_type: trainingType,
          status: status ?? 'pending', // enum type "pending", "contracted", "notContracted"
          submission_date: submissionDate,
          haveFunding,
          intrested_training: intrested_training || [],
          max_training: maxTraining,
          first_name: firstName,
          last_name: lastName,
          organization: organization,
        })
      }
      return ApiResponse.Output({ message: RESPONSE_MESSAGE.CREATED })
    } catch (error) {
      console.log('%cmutations.js line:86 error', 'color: #007acc;', error)
      return ApiResponse.Error({ error: error.message })
    }
  },

  updateRequest: async (_, args) => {
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      addressline1,
      state,
      city,
      zipcode,
      instructorTrainingCount,
      trainingType,
      jobTitle,
      organization,
      isNationalCouncilMember,
      status,
      submissionDate,
      haveFunding,
      request_id,
      intrested_training,
      maxTraining,
    } = args

    try {
      const request = await adminClass.getRequest(request_id)
      if (!request) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.REQUEST_NOT_FOUND,
        })
      }

      const user = await adminClass.getUserByEmail(email)
      if (!user) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.USER_NOT_FOUND,
        })
      }
      const userData = await adminClass.getUserDataById(user?.id)
      await adminClass.updateUser(
        {
          is_council_member: isNationalCouncilMember,
          updated_at: Date.now(),
        },
        email
      )

      await adminClass.updateUserDataByUserId(
        {
          phone_number: phoneNumber,
          addressline1,
          state,
          city,
          zipcode,
          job_title: jobTitle,
          updated_at: Date.now(),
        },
        user?.id
      )

      await adminClass.updateRequestData(
        {
          training_type: trainingType,
          status,
          submission_date: submissionDate,
          instructorTrainingCount,
          haveFunding,
          updated_at: Date.now(),
          intrested_training, // request training type
          max_training: maxTraining,
          email,
          first_name: firstName,
          last_name: lastName,
          organization: organization,
        },
        request_id
      )
      return ApiResponse.Output({ message: RESPONSE_MESSAGE.UPDATED })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  deleteRequestUser: async (_, args) => {
    const { email } = args
    try {
      await adminClass.deleteUser(email)
      return ApiResponse.Output({ message: RESPONSE_MESSAGE.DELETED })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  //training api
  createTraining: async (_, args) => {
    try {
      const {
        request_id,
        status,
        training_type,
        max_learner,
        course_id,
        training_course_id,
        start_date,
        end_date,
        start_time,
        end_time,
        time_zone,
        address,
        state,
        city,
        zipcode,
        location,
        notes,
      } = args

      const request = await adminClass.getRequest(request_id)
      if (!request) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.REQUEST_NOT_FOUND,
        })
      }

      await adminClass.createTraining({
        max_learner: max_learner ?? 1,
        request_id,
        status: status ?? 'scheduling',
        training_type,
        lms_course_id: course_id,
        training_course_id,
        start_date,
        end_date,
        start_time,
        end_time,
        time_zone,
        address,
        state,
        city,
        zipcode,
        location,
        notes,
      })

      await adminClass.updateRequestByid(
        {
          instructorTrainingCount: request?.instructorTrainingCount
            ? request.instructorTrainingCount + 1
            : 1,
        },
        request_id
      )
      return ApiResponse.Output({ message: RESPONSE_MESSAGE.CREATED })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  updateTraining: async (_, args) => {
    try {
      const {
        status,
        max_learner,
        course_id,
        training_id,
        start_date,
        end_date,
        start_time,
        end_time,
        time_zone,
        address,
        state,
        city,
        zipcode,
        location,
        notes,
      } = args

      const training = await adminClass.getTraining(training_id)
      if (!training) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.TRAINING_NOT_FOUND,
        })
      }

      await adminClass.updateTraining(
        {
          max_learner,
          status: status ?? 'enrolling',
          lms_course_id: course_id,
          updated_at: new Date(),
          start_date,
          end_date,
          start_time,
          end_time,
          time_zone,
          address,
          state,
          city,
          zipcode,
          location,
          notes,
        },
        training_id
      )
      return ApiResponse.Output({ message: RESPONSE_MESSAGE.UPDATED })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  deleteTrainig: async (_, args) => {
    try {
      const { training_id } = args

      const training = await adminClass.getTraining(training_id)
      if (!training) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.TRAINING_NOT_FOUND,
        })
      }
      await adminClass.deleteTrainig(training_id)
      return ApiResponse.Output({ message: RESPONSE_MESSAGE.DELETED })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  //learner api
  inviteLearner: async (_, args) => {
    try {
      const { firstName, lastName, email, training_id, waivePrecheck } = args

      // Check if training exists
      const training = await adminClass.getTraining(training_id)
      if (!training) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.TRAINING_NOT_FOUND,
        })
      }

      // Check if maximum learner limit reached
      const enrolledTrainingUserCount =
        await adminClass.getTrainingCountFromMapping(training_id)
      if (+training.max_learner <= enrolledTrainingUserCount) {
        return ApiResponse.Error({
          status: 400,
          message: `Maximum ${+training.max_learner} learners allowed`,
        })
      }

      // Check if user already exists
      let user = await adminClass.getUserByEmail(email)
      if (!user) {
        // If user doesn't exist, create a new user
        user = await adminClass.createUser({
          email: email,
          role_id: USER_ROLE.CANDIDATE,
        })
      }

      // Create or retrieve user data
      let userData = await adminClass.getUserDataById(user?.id)
      if (!userData) {
        userData = await adminClass.createUserData({
          first_name: firstName,
          last_name: lastName,
          user_id: user.id,
        })
      }

      // Create mapping for the user and training

      let mappingData = await adminClass.getMappingByTrainingUserId(
        training_id,
        userData?.id
      )
      if (!mappingData) {
        mappingData = await adminClass.createMapping({
          user_data_id: userData.id,
          training_id,
          status: 'invited',
          waive_pre_check: waivePrecheck,
        })
      }
      const url = `${process.env.APP_URL}?userId=${user.id}&invitationId=${mappingData?.id}`
      sendInviteUser(user?.email, url)

      return ApiResponse.Output({ message: RESPONSE_MESSAGE.INVITED })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  updateLearner: async (_, args) => {
    try {
      const { firstName, lastName, learner_id, status } = args

      const learner = await adminClass.getLearnerMappingById(learner_id)
      if (!learner) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.LEARNER_NOT_FOUND,
        })
      }
      await adminClass.updateUserDataByUserDataId(
        {
          first_name: firstName,
          last_name: lastName,
        },
        learner?.user_data_id
      )
      return ApiResponse.Output({ message: RESPONSE_MESSAGE.UPDATED })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  deleteLearner: async (_, args) => {
    try {
      const { learner_id } = args
      const learner = await adminClass.getLearnerMappingById(learner_id)
      if (!learner) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.LEARNER_NOT_FOUND,
        })
      }

      await adminClass.updateLearnerMapping(
        {
          is_deleted: true,
        },
        learner_id
      )
      return ApiResponse.Output({ message: RESPONSE_MESSAGE.DELETED })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  inviteMultipleLeaner: async (_, args) => {
    let { csvData, training_id } = args
    try {
      csvData = csvData?.csvData?.map((_c) => ({
        ..._c,
        role_id: USER_ROLE.CANDIDATE,
      }))
      const training = await adminClass.getTraining(training_id)
      if (!training) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.TRAINING_NOT_FOUND,
        })
      }

      const enrolledTrainingUserCount =
        await adminClass.getTrainingCountFromMapping(training_id)
      if (+training.max_learner <= enrolledTrainingUserCount) {
        return ApiResponse.Error({
          status: 400,
          message: `Maximum ${+training.max_learner} learners allowed`,
        })
      }

      await Promise.all(
        csvData?.map(async (_c) => {
          let user = await adminClass.getUserByEmail(_c.email)

          if (!user) {
            user = await adminClass.createUser({
              email: _c?.email,
            })
          }
          let userData = await adminClass.getUserDataById(user?.id)
          if (!userData) {
            userData = await adminClass.createUserData({
              first_name: _c?.first_name,
              last_name: _c?.last_name,
              user_id: user?.id,
            })
          }

          const mappingData = await adminClass.getMappingByTrainingUserId(
            training_id,
            userData?.id
          )
          if (!mappingData) {
            await adminClass.createMapping({
              user_data_id: userData?.id,
              training_id,
              status: 'invited',
              waive_pre_check: _c?.waive_pre_check,
            })
          }
        })
      )

      return ApiResponse.Output({ message: RESPONSE_MESSAGE.CREATED })
    } catch (error) {
      console.log('%cmutations.js line:493 error', 'color: #007acc;', error)
      return ApiResponse.Error({ error: error.message })
    }
  },

  inviteAllLearner: async (_, args) => {
    let { training_id } = args
    try {
      const training = await adminClass.getTraining(training_id)
      if (!training) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.TRAINING_NOT_FOUND,
        })
      }
      const Learner = await adminClass.getLearnerForInvite(training_id)
      await Promise.all(
        Learner.map(async (_l) => {
          const userData = await adminClass.findUserDataByPk(_l?.user_data_id)
          if (userData) {
            const user = await adminClass.findUser(userData.user_id)
            const url = `${process.env.APP_URL}?userId=${user.id}&invitationId=${_l.id}`
            sendInviteUser(user?.email, url)
            await adminClass.updateLearnerMapping(
              {
                status: 'not_sent',
              },
              _l?.id
            )
          }
        })
      )
      return ApiResponse.Output({ message: RESPONSE_MESSAGE.INVITED })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  reInviteLearner: async (_, args) => {
    try {
      const { learner_id } = args

      // Check if training exists
      const learner = await adminClass.getLearnerMappingById(learner_id)
      if (!learner) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.LEARNER_NOT_FOUND,
        })
      }

      const userData = await adminClass.findUserDataByPk(learner?.user_data_id)
      if (userData) {
        const user = await adminClass.findUser(userData.user_id)
        // Generate invitation URL
        const url = `${process.env.APP_URL}?userId=${user.id}&invitationId=${learner_id}`
        await adminClass.updateLearnerMapping(
          {
            status: 'invited',
          },
          learner_id
        )
        // Send invitation email
        sendInviteUser(user?.email, url)
      }
      return ApiResponse.Output({ message: RESPONSE_MESSAGE.INVITED })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },
}

export default adminMutation
