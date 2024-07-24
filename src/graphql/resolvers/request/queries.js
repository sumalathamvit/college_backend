import { ERROR_MESSAGE } from "../../../utils/constant";
import { ApiResponse } from "../../../utils/output";
import { RequestClass } from "./request.service";

const requestClass = new RequestClass();

const requestQueries = {
  GetRequestOfRequester: async (_, args) => {
    try {
      const { requester_id } = args; // requesterId - user with role request/admin
      const user = await requestClass.getUserById(requester_id);

      if (!user) {
        return ApiResponse.Error({
          status: 404,
          message: ERROR_MESSAGE.REQUESTER_NOT_FOUND,
        });
      }

      // get user Data id from user
      const userData = await requestClass.getUserDataByUserId(requester_id);

      const requestData = await requestClass.findRequestByRequesterId(
        userData?.id
      );

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
        };
      });
      return ApiResponse.Output({ data });
    } catch (error) {
      return ApiResponse.Error({ error: error.message });
    }
  },
};

export default requestQueries;





