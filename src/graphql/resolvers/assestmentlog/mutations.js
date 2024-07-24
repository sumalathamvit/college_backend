import dotenv from "dotenv";
import AssessmentProgress from "../../../models/assessment_progress";
import LearnerTrainingMapping from "../../../models/learner_training_mapping.model";
import UsersDataModel from "../../../models/user_data.model";
import { ApiResponse } from "../../../utils/output";
import { getResult, getTotalMarks } from "../../../utils/common";
import { AssessmentClass } from "./assessment.service";
import {
  ASSESSMENT_STATUS,
  LOG_MODULE,
  LOG_TYPE,
  RESPONSE_MESSAGE,
  USER_ACTIVITY_STATUS,
} from "../../../utils/constant";
import { createOrUpdateUserLog } from "../user/user.service";
dotenv.config();

const Assessment = new AssessmentClass();

const assessmentLogMutations = {
  updateAssestment_log: async (_, args) => {
    try {
      const { email, course_id, inputData, reassessment_date } = args;

      // Retrieve user, user data, and mapping data
      const user = await Assessment.findUserByEmail(email);
      const userData = await UsersDataModel.findOne({
        where: { user_id: user.id },
      });
      const mappingData = userData
        ? await LearnerTrainingMapping.findOne({
            where: { user_data_id: userData.id, status: "clicked" },
          })
        : null;

      // Retrieve course information
      const course = await Assessment.findCourseById(course_id);

      // Update AssessmentProgress
      await AssessmentProgress.update(
        { isCompleted: true, updated_at: Date.now() },
        { where: { course_id, user_id: user?.id } }
      );

      // Retrieve answers and calculate result and total marks
      const answerResponse = await Assessment.findAllAnswersByCourse(course_id);
      const answer = answerResponse.map((_ans) => ({
        question_id: +_ans?.question_id,
        answer: _ans?.answer,
      }));
      const result = getResult(inputData, answer);
      const [assessment_score, totalQuetion] = getTotalMarks(result);

      // Determine assessment status
      const assessmentStatus =
        assessment_score >= (+process.env.PASSING_SCORE || 10)
          ? ASSESSMENT_STATUS.SUBMISSION
          : ASSESSMENT_STATUS.FAILED;

      // Update AssessmentLog
      await Assessment.updateAssessmentLog(
        {
          status: assessmentStatus,
          end_time: inputData[0]?.end_time,
          assessment_score,
          reassessment_date,
        },
        user?.id,
        course_id
      );

      // Update LearnerTrainingMapping if applicable
      if (mappingData) {
        await LearnerTrainingMapping.update(
          { status: assessment_score >= 9 ? "passed" : "failed" },
          { where: { id: mappingData.id } }
        );
      }

      // Retrieve assessment log data
      const assessmentLogData = await Assessment.getAssessmentLog(
        user?.id,
        course_id
      );

      await createOrUpdateUserLog(
        // Create or update user log for score
        {
          log_module: LOG_MODULE.SCORE,
          log_description: `Assessment ${course?.name} ${assessmentStatus}`,
          log_type: LOG_TYPE.EVENT,
        },
        user?.id
      );

      const data = {
        id: assessmentLogData?.id,
        status: assessmentLogData?.status,
        course,
        user_id: user?.id,
        start_time: assessmentLogData?.start_time,
        end_time: assessmentLogData?.end_time,
      };
      return ApiResponse.Output({
        message: RESPONSE_MESSAGE.ASSESSMENT_COMPLETED,
        data,
      });
    } catch (error) {
      return ApiResponse.Error({ error: error.message });
    }
  },

  createAssessment_progress: async (_, args) => {
    try {
      const {
        question_id,
        course_id,
        user_id,
        answer,
        questionNumber,
        start_time,
      } = args;
      const progress = await AssessmentProgress.findOne({
        where: {
          user_id,
          course_id,
        },
      });

      if (!progress) {
        await AssessmentProgress.create({
          question_id,
          course_id,
          answers: answer,
          user_id,
          questionNumber,
          isCompleted: false,
          start_time: new Date().toISOString(),
        });
      } else {
        await AssessmentProgress.update(
          {
            question_id,
            course_id,
            answers: answer,
            user_id,
            questionNumber,
            isCompleted: false,
            updated_at: Date.now(),
          },
          {
            where: {
              user_id,
              course_id,
            },
          }
        );
      }

      return ApiResponse.Output({
        message: RESPONSE_MESSAGE.ASSESSMENT_PROGRESS_SAVED,
      });
    } catch (error) {
      return ApiResponse.Error({ error: error.message });
    }
  },

  UpdateCandidateStatus: async (_, args) => {
    const { user_id, status, course_id } = args;
    try {
      const assessment = await Assessment.getAssessmentByUserIdAndCourseId(
        user_id,
        course_id
      );

      const commonUpdateOptions = {
        updated_at: new Date(),
      };

      if (status === USER_ACTIVITY_STATUS.STARTED && !assessment) {
        // Create assessment if not exists with status
        await Assessment.createAssessment({
          course_id,
          user_id,
          start_time: new Date().toISOString(),
          user_activity_status: status,
        });
      } else {
        // Update assessment log
        const updateOptions = {
          user_activity_status: status,
          ...((status === USER_ACTIVITY_STATUS.ENROLLED ||
            status === USER_ACTIVITY_STATUS.STORE) && {
            is_profile_completed: true,
          }),
          ...commonUpdateOptions,
        };

        await Assessment.updateAssessmentLog(updateOptions, user_id, course_id);
      }

      return ApiResponse.Output({
        message: RESPONSE_MESSAGE.USER_ACTIVITY_STATUS_UPDATED,
      });
    } catch (error) {
      return ApiResponse.Error({ error: error.message });
    }
  },
};

export default assessmentLogMutations;
