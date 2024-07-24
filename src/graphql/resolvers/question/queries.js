import CourseModel from "../../../models/courses.model";
import QuestionModel from "../../../models/questions.model";
import { ApiResponse } from "../../../utils/output";

const questionQueries = {
  GetQuestionByCourse: async (_, args) => {
    try {
      const { id } = args;
      const data = await QuestionModel.findAll({
        where: {
          course_id: id,
        },
        include: {
          model: CourseModel,
          attributes: ["name"],
        },
      });

      const courseName = data?.map((_q) => _q?.course?.name);
      return ApiResponse.Output({ data, course_name: courseName[0] });
    } catch (error) {
      console.log("catch-- ----------------->", error);
      return ApiResponse.Error({ error: error.message });
    }
  },
};

export default questionQueries;
