import axios from "axios";
import dotenv from "dotenv";
import UsersDataModel from "../../../models/user_data.model";
import UsersModel from "../../../models/users.modal";
import AssessmentProgress from "../../../models/assessment_progress";
import CourseModel from "../../../models/courses.model";

dotenv.config();
// dotenv.config({
//   path: `./${process.env.NODE_ENV}.env`,
// });

const headers = {
  "X-Shopify-Access-Token": process.env.AUTH_TOKEN,
  "Content-Type": "application/json; charset=utf-8",
};
const shopName = process.env.SHOP_NAME || "aimbrillstore.myshopify.com";
const shopifyAPIVersion = "2023-07";

class ShopifyAPI {
  constructor() {
    this.baseURL = `https://${shopName}/admin/api/${shopifyAPIVersion}`;
  }

  async get(endpoint, params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/${endpoint}`, {
        headers,
        params,
      });
      return response?.data;
    } catch (error) {
      console.error(`Shopify API GET Error: `, error?.response?.data?.errors);
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      const response = await axios.put(`${this.baseURL}/${endpoint}`, data, {
        headers,
      });
      return response?.data;
    } catch (error) {
      console.error(`Shopify API PUT Error: `, error?.response?.data?.errors);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      console.log('%ccustomer.service.js line:52 data', 'color: #007acc;', data);
      console.log('%ccustomer.service.js line:53 headers', 'color: #007acc;', headers);
      const response = await axios.post(`${this.baseURL}/${endpoint}`, data, {
        headers,
      });
      console.log(response);
      return response?.data;
    } catch (error) {
      console.error(`Shopify API POST Error: `, error?.response?.data?.errors);
      throw error;
    }
  }
}

const shopifyAPI = new ShopifyAPI();
export class CustomerClass {
  async checkCustomer(email) {
    return await shopifyAPI.get("customers/search.json", { query: email });
  }

  async updateTags(customerId, data) {
    return await shopifyAPI.put(`customers/${customerId}.json`, data);
  }

  async getTags(customerId) {
    const customer = await shopifyAPI.get(`customers/${customerId}.json`);
    return customer?.customer?.tags;
  }

  async createCustomer(data) {
    console.log('%ccustomer.service.js line:82 data', 'color: #007acc;', data);
    return await shopifyAPI.post("customers.json", data);
  }

  async getUserDataByEmail(email) {
    return UsersModel.findOne({
      where: { email },
    });
  }

  async getUserDataById(userId) {
    return UsersDataModel.findOne({
      where: { user_id: userId },
    });
  }
}

const customerClass = new CustomerClass();

// function to determine the course tag
export const determineTagName = async (userData) => {
  const progress = await getLatestAssessmentProgress(userData);
  const course = progress ? await CourseModel.findByPk(courseId) : null;
  return course?.name?.includes("Adult")
    ? "AdultInstructorCandidate"
    : "YouthInstructorCandidate";
};

// function to get the latest assessment progress
export const getLatestAssessmentProgress = async (userData) => {
  return await AssessmentProgress.findOne({
    where: { user_id: userData.id, isCompleted: true },
    order: [["updated_at", "DESC"]],
  });
};

// function to create a new Shopify customer
export const createShopifyCustomer = async (
  userData,
  email,
  password,
  tagName
) => {
  const customerData = {
    first_name: userData?.first_name,
    last_name: userData?.last_name,
    email,
    phone: userData?.phone_number,
    addresses: [
      {
        address1: userData?.addressline2
          ? [userData?.addressline1, userData?.addressline2].join(" ")
          : userData?.addressline2,
        city: userData?.city,
        phone: userData?.phone_number,
        zip: userData?.zipcode,
        last_name: userData?.last_name,
        first_name: userData?.first_name,
        country: userData?.country || "CA",
      },
    ],
    password,
    password_confirmation: password,
    tags: [tagName],
  };

  return await customerClass.createCustomer({ customer: customerData });
};
