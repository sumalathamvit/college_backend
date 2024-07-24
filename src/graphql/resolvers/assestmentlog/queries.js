import UsersModel from "../../../models/users.modal";
import AssessmentProgress from "../../../models/assessment_progress";
import { AssessmentClass } from "./assessment.service";
import { ApiResponse } from "../../../utils/output";
const assessment = new AssessmentClass();

const assestmentLogQueries = {
  GetAssestment: async (_, args) => {
    try {
      const { email } = args;
      const user = await UsersModel.findOne({
        where: { email },
      });

      const result = await assessment.getAllAssessmentLog(user?.id);

      const response = result.map((data) => {
        return {
          id: data?.id,
          course_id: data?.course_id,
          status: data?.status,
          start_time: data?.start_time,
          end_time: data?.end_time,
          user_id: data?.user_id,
          course: data?.course,
          assessment_score: data?.assessment_score,
          reassessment_date: data?.reassessment_date,
          is_profile_completed: data?.is_profile_completed,
        };
      });
      return ApiResponse.Output({ data: response });
    } catch (error) {
      console.log("catch-- ----------------->", error);
      return ApiResponse.Error({ error: error.message });
    }
  },

  GetAssessmentProgress: async (_, args) => {
    try {
      const { user_id, course_id } = args;
      const result = await AssessmentProgress.findOne({
        where: {
          user_id: user_id,
          course_id: course_id,
          // isCompleted: false,
        },
      });
      return ApiResponse.Output({ data: result });
    } catch (error) {
      console.log("catch-- ----------------->", error);
      return ApiResponse.Error({ error: error.message });
    }
  },
  GetAllAssessmentProgress: async (_, args) => {
    try {
      const { user_id } = args;
      const result = await AssessmentProgress.findAll({
        where: {
          user_id: user_id,
          // isCompleted: false,
        },
      });
      return ApiResponse.Output({ data: result });
    } catch (error) {
      return ApiResponse.Error({ error: error.message });
    }
  },
};

export default assestmentLogQueries;
