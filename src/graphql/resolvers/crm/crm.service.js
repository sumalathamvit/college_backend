import axios from "axios";
import qs from "qs";
import dotenv from "dotenv";

dotenv.config();
// dotenv.config({
//   path: `./${process.env.NODE_ENV}.env`,
// });

const clientId = process.env.CRM_CLIENT_ID;
const clientSecret = process.env.CRM_CLIENT_SECTET;
const tenantId = process.env.CRM_TENANT_ID;
const resourseUrl = process.env.CRM_RESOURSE_URL;

let data = qs.stringify({
  grant_type: "client_credentials",
  client_id: clientId,
  client_secret: clientSecret,
  resource: resourseUrl,
});

let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: `https://login.microsoftonline.com/${tenantId}/oauth2/token`,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Cookie:
      "fpc=AnW65gtsMvlMrS53_AADMR74QtykAQAAAHMk6dwOAAAA; stsservicecookie=estsfd; x-ms-gateway-slice=estsfd",
  },
  data: data,
};

export class CrmClass {
  getCrmAccessToken() {
    return axios.request(config);
  }
}
