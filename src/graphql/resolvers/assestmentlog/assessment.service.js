import AnswerModel from "../../../models/answer.model";
import AssessmentLogModel from "../../../models/assesstment_log.model";
import CourseModel from "../../../models/courses.model";
import UsersModel from "../../../models/users.modal";

export class AssessmentClass {
  async findAllAnswersByCourse(course_id) {
    return AnswerModel.findAll({
      where: {
        course_id,
      },
    });
  }

  async findUserByEmail(email) {
    return UsersModel.findOne({
      where: {
        email,
      },
    });
  }

  async findCourseById(course_id) {
    return CourseModel.findByPk(course_id);
  }

  async updateAssessmentLog(data, id, courseId) {
    return AssessmentLogModel.update(data, {
      where: {
        user_id: id,
        course_id: courseId,
      },
    });
  }

  async getAllAssessmentLog(id) {
    return AssessmentLogModel.findAll({
      include: {
        model: CourseModel,
      },
      where: {
        user_id: id,
        // end_time: {
        //   [Op.not]: null,
        // },
      },
    });
  }

  async getAssessmentByUserIdAndCourseId(id, courseId) {
    return AssessmentLogModel.findOne({
      where: {
        user_id: id,
        course_id: courseId,
      },
    });
  }

  async createAssessment(data) {
    return AssessmentLogModel.create(data);
  }

  async getAssessmentLog(id, courseId) {
    return AssessmentLogModel.findOne({
      include: {
        model: CourseModel,
      },
      where: {
        user_id: id,
        course_id: courseId,
      },
    });
  }
}
