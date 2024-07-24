import { LearnUponClass, getAccessToken } from '../user/user.service'
import { AdminClass } from './admin.service'
import { AssessmentClass } from '../assestmentlog/assessment.service'
import { ApiResponse } from '../../../utils/output'
import { ERROR_MESSAGE } from '../../../utils/constant'

const adminClass = new AdminClass()
const assessment = new AssessmentClass()

const adminQueries = {
  GetInstructorTrainingRequest: async (_, args) => {
    try {
      const requestData = await adminClass.findAllRequest()
      const data = requestData.map((_item) => {
        return {
          id: _item.id,
          email: _item?.users_datum?.user?.email,
          first_name: _item?.first_name,
          last_name: _item?.last_name,
          job_title: _item?.users_datum?.job_title,
          phone_number: _item?.users_datum?.phone_number,
          training_type: _item?.training_type, // adult or youth
          status: _item?.status,
          submission_date: _item?.submission_date,
          created_at: _item?.created_at,
          organization: _item?.organization,
          updated_at: _item?.updated_at,
          instructorTrainingCount: _item?.instructorTrainingCount,
          max_training: _item?.max_training,
          have_funding: _item?.haveFunding,
          course_name: _item?.course_name,
          intrested_training: _item?.intrested_training,
        }
      })
      return ApiResponse.Output({ data })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  GetLMSCourse: async (_, a) => {
    try {
      const accessToken = await getAccessToken()
      const lmsClass = new LearnUponClass(accessToken)
      const course = await lmsClass.getCourses()
      const data = course?.data?.courses?.map((_c) => {
        return {
          id: _c?.id,
          name: _c?.name,
          source_id: _c?.source_id,
          keywords: _c?.keywords,
          number_of_modules: _c?.number_of_modules,
          owner_first_name: _c?.owner_first_name,
          owner_last_name: _c?.owner_last_name,
          owner_email: _c?.owner_email,
          owner_id: _c?.owner_id,
          created_at: _c?.created_at,
          date_published: _c?.date_published,
          description_text: _c?.description_text,
          difficulty_level: _c?.difficulty_level,
        }
      })

      return ApiResponse.Output({ data })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  GetTrainingList: async (_, args) => {
    try {
      const { request_id } = args
      const request = await adminClass.getRequest(request_id)
      if (!request) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.REQUEST_NOT_FOUND,
        })
      }
      const training = await adminClass.getTrainingByRequestId(request_id)
      return ApiResponse.Output({ data: training })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  GetInstructorTrainingRequestBYId: async (_, args) => {
    try {
      const { request_id } = args
      const request = await adminClass.getRequest(request_id)
      if (!request) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.REQUEST_NOT_FOUND,
        })
      }
      const requestData = await adminClass.findRequestById(request_id)
      const data = {
        id: requestData.id,
        intrested_training: requestData?.intrested_training,
        course_name: requestData?.course_name,
        course_id: requestData?.course_id,
        email: requestData?.users_datum?.user?.email,
        isNationalCouncilMember:
          requestData?.users_datum?.user?.is_council_member,
        first_name: requestData?.first_name,
        last_name: requestData?.last_name,
        job_title: requestData?.users_datum?.job_title,
        phone_number: requestData?.users_datum?.phone_number,
        city: requestData?.users_datum?.city,
        organization: requestData?.organization,
        state: requestData?.users_datum?.state,
        zipcode: requestData?.users_datum?.zipcode,
        addressline1: requestData?.users_datum?.addressline1,
        training_type: requestData?.training_type, // adult or youth
        status: requestData?.status,
        submission_date: requestData?.submission_date,
        created_at: requestData?.created_at,
        updated_at: requestData?.updated_at,
        instructorTrainingCount: requestData?.instructorTrainingCount,
        max_training: requestData?.max_training,
        have_funding: requestData?.haveFunding,
      }
      return ApiResponse.Output({ data })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  GetTrainingDetails: async (_, args) => {
    try {
      const { training_id } = args
      const training = await adminClass.getTraining(training_id)
      if (!training) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.REQUEST_NOT_FOUND,
        })
      }
      const data = await adminClass.getTrainingById(training_id)
      return ApiResponse.Output({ data })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  GetLearnerList: async (_, args) => {
    try {
      const { training_id } = args
      const training = await adminClass.getTraining(training_id)
      if (!training) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.TRAINING_NOT_FOUND,
        })
      }
      const data = await adminClass.getLearner(training_id)
      const learnerData = data?.map((_item) => {
        return {
          id: _item.id,
          email: _item?.users_datum?.user?.email,
          first_name: _item?.users_datum?.first_name,
          last_name: _item?.users_datum?.last_name,
          status: _item?.status,
          created_at: _item?.created_at,
          updated_at: _item?.updated_at,
          user_id: _item?.users_datum?.user?.id,
          waive_pre_check: _item?.waive_pre_check,
        }
      })
      return ApiResponse.Output({ data: learnerData })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  GetCandidate: async (_, args) => {
    try {
      const { searchTerm, orderField, orderDirection } = args
      const user = await adminClass.findAllCandidate(
        searchTerm,
        orderField,
        orderDirection
      )
      const candidateData = user.map((_item) => {
        return {
          first_name: _item?.first_name,
          last_name: _item?.last_name,
          email: _item?.user?.email,
          id: _item?.user?.id,
        }
      })
      return ApiResponse.Output({ data: candidateData })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  GetCandidateDetails: async (_, args) => {
    const { id } = args
    try {
      const user = await adminClass.findUser(id)
      const userData = await adminClass?.getUserDataById(id)
      if (!user) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.CANDIDATE_NOT_FOUND,
        })
      }

      const result = await assessment.getAllAssessmentLog(id)
      const AssessmentData = result.map((data) => {
        return {
          id: data?.id,
          course_id: data?.course_id,
          status: data?.status,
          start_time: data?.start_time,
          end_time: data?.end_time,
          user_id: data?.user_id,
          assessment_score: data?.assessment_score,
          reassessment_date: data?.reassessment_date,
          course: data?.course,
        }
      })
      const candidateData = {
        first_name: userData?.first_name,
        last_name: userData?.last_name,
        email: user?.email,
        id: user?.id,
      }
      return ApiResponse.Output({ candidateData, AssessmentData })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },
}

export default adminQueries
