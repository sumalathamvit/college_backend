import RequestModel from "../../../models/request.model";
import UsersDataModel from "../../../models/user_data.model";
import UsersModel from "../../../models/users.modal";

export class RequestClass {
  async getUserById(id) {
    return UsersModel.findOne({
      where: {
        id,
      },
    });
  }

  async getUserDataByUserId(userId) {
    return UsersDataModel.findOne({
      where:{
        user_id: userId,
      }
    })
  }

  async findRequestByRequesterId(userDataId) {
    return RequestModel.findAll({
      where: {
        users_data_id: userDataId,
      },
      include: {
        model: UsersDataModel,
        attributes: [
          "id",
          "organization",
          "first_name",
          "last_name",
          "phone_number",
          "job_title",
          "city",
          "state",
          "zipcode",
          "addressline1",
        ],
        include: {
          model: UsersModel,
          attributes: ["id", "email", "is_council_member"],
         
        },
      },
    });
  }
}