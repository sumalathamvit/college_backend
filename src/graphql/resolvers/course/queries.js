import Certification from '../../../models/certificate.model'
import CourseModel from '../../../models/courses.model'
import { ApiResponse } from '../../../utils/output'

const courseQueries = {
  GetCourse: async () => {
    try {
      const courseData = await CourseModel.findAll({})
      return ApiResponse.Output({ data: courseData })
    } catch (error) {
      return ApiResponse.Error({ error: error.message })
    }
  },

  GetCertificates: async () => {
    try {
      let Certificate = []
      let certificateData = await CourseModel.findAll({
        include: {
          model: Certification,
        },
      })
      certificateData = certificateData?.map((_c) => [..._c?.certificates])
      certificateData = certificateData.map((certificates) =>
        certificates[0]
      )
      return ApiResponse.Output({ data: certificateData })
    } catch (error) {
      console.log('%cqueries.js line:38 error', 'color: #007acc;', error);
      return ApiResponse.Error({ error: error.message })
    }
  },
}

export default courseQueries
