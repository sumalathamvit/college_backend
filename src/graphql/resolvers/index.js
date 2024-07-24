
import { courseMutations, courseQueries } from "./course";
import { userMutations, userQueries } from "./user";
import { questionMutations, questionQueries } from "./question";
import { assessmentLogMutations, assestmentLogQueries } from "./assestmentlog";
import { shopifyQueries, shopifyMutation } from "./shopifyIntegration";
import { adminQueries, adminMutation } from "./admin";
import { crmMutations, crmQueries } from "./crm";
import { requestMutation, requestQueries } from "./request";

const resolvers = {
  Query: {
    ...courseQueries,
    ...userQueries,
    ...questionQueries,
    ...assestmentLogQueries,
    ...shopifyQueries,
    ...adminQueries,
    ...crmQueries,
    ...requestQueries
  },
  Mutation: {
    ...courseMutations,
    ...userMutations,
    ...questionMutations,
    ...assessmentLogMutations,
    ...adminMutation,
    ...crmMutations,
    ...shopifyMutation,
    ...requestMutation
  },
};

export default resolvers;