import LearnerTrainingMapping from '../../../models/learner_training_mapping.model'
import RequestModel from '../../../models/request.model'
import TrainigModel from '../../../models/training.model'
import UsersDataModel from '../../../models/user_data.model'
import UsersModel from '../../../models/users.modal'
import { USER_ROLE } from '../../../utils/constant'
import { Op, Sequelize } from 'sequelize'

export class AdminClass {
  async findAllRequest() {
    return RequestModel.findAll({
      include: {
        model: UsersDataModel,
        attributes: [
          'id',
          'organization',
          'first_name',
          'last_name',
          'phone_number',
          'job_title',
        ],
        include: {
          model: UsersModel,
          attributes: ['id', 'email'],
        },
      },
      order: [['created_at', 'DESC']],
    })
  }

  async findRequestById(requestId) {
    return RequestModel.findByPk(requestId, {
      include: {
        model: UsersDataModel,
        attributes: [
          'id',
          'organization',
          'first_name',
          'last_name',
          'phone_number',
          'job_title',
          'city',
          'state',
          'zipcode',
          'addressline1',
        ],
        include: {
          model: UsersModel,
          attributes: ['id', 'email', 'is_council_member'],
        },
      },
    })
  }

  async findUser(userId) {
    return UsersModel.findByPk(userId)
  }

  async findUserDataByPk(userDataId) {
    return UsersDataModel.findByPk(userDataId)
  }

  async createUser(user) {
    return UsersModel.create(user)
  }

  async upsertUser(user, email) {
    return UsersModel.upsert(user, { where: { email } })
  }

  async createUserData(user) {
    return UsersDataModel.create(user)
  }

  async createRequest(request) {
    return RequestModel.create(request)
  }

  async getUserByEmail(email) {
    return UsersModel.findOne({
      where: {
        email,
      },
    })
  }

  async updateUser(user, email) {
    return UsersModel.update(user, {
      where: { email },
    })
  }

  async updateUserDataByUserId(user, id) {
    return UsersDataModel.update(user, {
      where: {
        user_id: id,
      },
    })
  }

  async upsertUserDataByUserId(user, id) {
    return UsersDataModel.upsert(user, {
      where: {
        user_id: id,
      },
    })
  }

  async updateRequestData(data, id) {
    return RequestModel.update(data, {
      where: {
        id,
      },
    })
  }
  async updateRequestByid(data, id) {
    return RequestModel.update(data, {
      where: {
        id,
      },
    })
  }

  async getUserDataById(id) {
    return UsersDataModel.findOne({
      where: {
        user_id: id,
      },
    })
  }

  async deleteUser(email) {
    return UsersModel.destroy({
      where: {
        email,
      },
    })
  }

  async getRequest(requestId) {
    return RequestModel.findByPk(requestId)
  }

  async createTraining(trainingData) {
    return TrainigModel.create(trainingData)
  }

  async getTraining(trainingId) {
    return TrainigModel.findByPk(trainingId)
  }

  async getTrainingCountFromMapping(trainingId) {
    return LearnerTrainingMapping.count({
      where: {
        training_id: trainingId,
      },
    })
  }

  async updateTraining(trainingData, trainingId) {
    return TrainigModel.update(trainingData, {
      where: {
        id: trainingId,
      },
    })
  }

  async createMultipleUser(data) {
    return UsersModel.bulkCreate(data, {
      fields: ['email', 'role_id'],
      ignoreDuplicates: true,
    })
  }
  async createMultipleUserData(data) {
    return UsersDataModel.bulkCreate(data, {
      ignoreDuplicates: true,
    })
  }

  async createMultipleUserMapping(data) {
    return LearnerTrainingMapping.bulkCreate(data, {
      ignoreDuplicates: true,
    })
  }

  
  async getTrainingByRequestId(requestId) {
    return TrainigModel.findAll({
      where: {
        request_id: requestId,
      },
    })
  }

  async deleteTrainig(trainingId) {
    return TrainigModel.destroy({
      where: {
        id: trainingId,
      },
    })
  }

  async createMapping(data) {
    return LearnerTrainingMapping.create(data)
  }

  async getLearner(trainingId) {
    return LearnerTrainingMapping.findAll({
      include: {
        model: UsersDataModel,
        attributes: ['id', 'first_name', 'last_name'],
        include: {
          model: UsersModel,
          attributes: ['id', 'email'],
        },
      },
      where: {
        training_id: trainingId,
        is_deleted: false,
      },
      order: [['created_at', 'DESC']],
    })
  }

  async getLearnerForInvite(trainingId) {
    return LearnerTrainingMapping.findAll({
      where: {
        training_id: trainingId,
        is_deleted: false,
        status: 'not_sent',
      },
    })
  }
  async getMappingByTrainingUserId(training_id, user_data_id) {
    return LearnerTrainingMapping.findOne({
      where: {
        training_id,
        is_deleted: false,
        user_data_id
      },
    })
  }

  async getLearnerMappingById(learnerId) {
    return LearnerTrainingMapping.findByPk(learnerId)
  }

  async updateLearnerMapping(data, leaner_id) {
    return LearnerTrainingMapping.update(data, {
      where: {
        id: leaner_id,
      },
    })
  }

  async deleteLearner(learnerId) {
    return LearnerTrainingMapping.destroy({
      where: {
        id: learnerId,
      },
    })
  }

  async updateUserDataByUserDataId(user, userDataId) {
    return UsersDataModel.update(user, {
      where: {
        id: userDataId,
      },
    })
  }

  async getTrainingById(trainigId) {
    return TrainigModel.findByPk(trainigId)
  }

  async findAllCandidate(
    searchTerm,
    orderField = 'email',
    orderDirection = 'ASC'
  ) {
    const baseQuery = {
      attributes: ['first_name', 'last_name'],
      include: {
        model: UsersModel,
        attributes: ['id', 'email'],
        where: {
          role_id: USER_ROLE.CANDIDATE,
        },
        required: false,
        right: true,
      },
    }

    if (searchTerm) {
      baseQuery.where = {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${searchTerm}%` } },
          { last_name: { [Op.iLike]: `%${searchTerm}%` } },
          { '$user.email$': { [Op.iLike]: `%${searchTerm}%` } },
        ],
      }
    }

    if (orderField === 'email') {
      baseQuery.order = [[Sequelize.col('user.email'), orderDirection]]
    } else {
      baseQuery.order = [[orderField, orderDirection]]
    }
    console.log(
      '%cadmin.service.js line:269 baseQuery',
      'color: #007acc;',
      baseQuery
    )

    return UsersDataModel.findAll(baseQuery)
  }
}
