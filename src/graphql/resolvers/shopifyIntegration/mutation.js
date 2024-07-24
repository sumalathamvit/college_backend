import AssessmentProgress from "../../../models/assessment_progress";
import CourseModel from "../../../models/courses.model";
import { decrypt } from "../../../utils/common";
import { LOG_MODULE, LOG_TYPE } from "../../../utils/constant";
import { ApiResponse } from "../../../utils/output";
import { createOrUpdateUserLog } from "../user/user.service";
import { CustomerClass } from "./customer.service";

const customerClass = new CustomerClass();

const shopifyMutation = {
  IntegrateShopify: async (_, args, { req }) => {
    const messages = [];
    const { email } = args;
    const user = await customerClass.getUserDataByEmail(email);

    try {
      var customer;
      // if (req.session.password) {
      //   console.log(
      //     "%cqueries.js line:10 req.session.password",
      //     "color: #007acc;",
      //     req.session.password,
      //     );
      //     const  p = decrypt(req.session.password)
      //     console.log('%cqueries.js line:18 p', 'color: #007acc;', p);
      // }
      console.log("%cmutation.js line:26 user", "color: #007acc;", user);
      const userData = await customerClass.getUserDataById(user?.id);
      var password = "";
      var tagName;
      const progress = await AssessmentProgress.findOne({
        where: { user_id: user.id, isCompleted: true },
        order: [["updated_at", "DESC"]],
      });

      if (progress) {
        const course = await CourseModel.findByPk(progress.course_id);
        tagName = course?.name?.includes("Adult")
          ? "AdultInstructorCandidate"
          : "YouthInstructorCandidate";
      }
      console.log(
        "%cmutation.js line:41 user?.password",
        "color: #007acc;",
        user?.password
      );
      if (user?.password) {
        console.log(
          "%cmutation.js line:44 object",
          "color: #007acc;",
          user?.password
        );
        password = decrypt(user?.password);
        console.log(
          "%cmutation.js line:44 object",
          "color: #007acc;",
          password
        );
      }
      messages.push({
        message: "Verifying the user information in Shopify Customers",
        isError: false,
        text: "Check Store account status.",
      });
      customer = await customerClass.checkCustomer(email);
      console.log(
        "%cmutation.js line:49 customer",
        "color: #007acc;",
        customer
      );
      console.log(
        "%cmutation.js line:52 password",
        "color: #007acc;",
        password
      );

      if (!customer?.customers?.length) {
        messages.push({
          message:
            "Initiating the creation of a customer profile on Shopify, as the customer data is not currently on record.",
          isError: false,
          text: "Creating Store account.",
        });
        console.log(
          '%cmutation.js line:49 customer',
          'color: #007acc;',
          customer,
          password
        )

        let shopifyCustomerData = {
          first_name: userData?.first_name,
          last_name: userData?.last_name,
          email: email,
          phone: userData?.phone_number,
          addresses: [
            {
              address1: userData?.addressline2
                ? [userData?.addressline1, userData?.addressline2].join(" ")
                : userData?.addressline2,
              city: userData?.city,
              zip: userData?.zipcode,
              last_name: userData?.last_name,
              first_name: userData?.first_name,
              country: userData?.country || "United States",
            },
          ],
          password: password,
          password_confirmation: password,
          tags: [tagName],
        };

        console.log(
          "%cmutation.js line:84 shopifyCustomerData",
          "color: #007acc;",
          shopifyCustomerData
        );

        /// SHOPIFY CUSTOMER CREATION
        customer = await customerClass.createCustomer({
          customer: shopifyCustomerData,
        });
        await createOrUpdateUserLog(
          {
            log_module: LOG_MODULE.SHOPIFY_ACCOUNT_CREATED,
            log_description: `Shopify Account Created - ${customer?.customer?.id}`,
            log_type: LOG_TYPE.EVENT,
          },
          user?.id
        );

        console.log(
          "%cmutation.js line:82 customer",
          "color: #007acc;",
          customer
        );

        messages.push({
          message:
            "Customer profile successfully established on the Shopify platform.",
          isError: false,
          text: "Store account created.",
        });
        if (customer) {
          messages.push({
            message: `Applying the course tag${
              tagName
                ? `, namely the ${tagName} tag, to the customer account.`
                : ""
            }`,
            isError: false,
            text: `Adding to Store account: ${tagName}`,
          });
        }
      } else {
        messages.push({
          message:
            "Customer data retrieved successfully, the profile is already registered in the Shopify system.",
          isError: false,
          text: "verify Store account",
        });
        messages.push({
          message:
            "Fetching the existing tags associated with the customer's Shopify account.",
          isError: false,
          text: 'Checking the existing tag with store',
        })

        const customerTags = await customerClass.getTags(
          customer?.customers[0]?.id
        )
        await createOrUpdateUserLog( // add shopify update log
          {
            log_module: LOG_MODULE.SHOPIFY_ACCOUNT_UPDATED,
            log_description: `Shopify Account Updated - ${customer?.customers[0]?.id}`,
            log_type: LOG_TYPE.EVENT,
          },
          user?.id
        )
        const tags = customerTags?.split(',')?.map((tag) => tag.trim())
        tags.push(tagName)
        customer = await customerClass.updateTags(customer?.customers[0]?.id, {
          customer: {
            id: customer?.customers[0]?.id,
            tags: tags,
          },
        });
        messages.push({
          message: `Updating the customer's Shopify account with all relevant tags${
            tagName ? `, including ${tagName}` : ""
          }`,
          isError: false,
          text: `Adding to Store account: ${tagName}`,
        });
      }
      return ApiResponse.Output({ message: messages });
    } catch (error) {
      console.log("%cqueries.js line:130 error", "color: #007acc;", error);
      const err =
        JSON.stringify(error?.response?.data?.errors) || error.message;

      await createOrUpdateUserLog(
        // add error in user log
        {
          log_module: LOG_MODULE.LOGGED_IN,
          log_description: `Error - ${err}`,
          
          log_type: LOG_TYPE.ERROR,
        },
        user?.id
      );
      return ApiResponse.Error({ error: err, message: messages });
    }
  },
};

export default shopifyMutation;
