import schools from "../data/schools.js";
import axios from "axios";
import auth from "../data/auth.js";

export default class Client {
  /**
   * @param {Object} auth - Authentication object for the user.
   * @param {string} auth.email - Email ID of the user
   * @param {string} auth.password - Password of the user
   * @param {number} auth.school - School ID (0-2) of the user
   *
   * @param {Object} options - Options for the client.
   */
  constructor(auth, options) {
    const schoolObject = schools[auth.school];
    if (!schoolObject) {
      throw new Error("An invalid school ID was provided to the BaseClient.");
    }
    this.auth = auth;
    this.school = schoolObject;
  }

  async authenticate() {
    const response = await this.customCookieRequest(
      "homecontrollers/login/validateUser",
      "POST",
      {
        emailid: this.auth.email,
        pwd: this.auth.password,
        schoolCode: this.school.id,
        schoolName: this.school.name,
      }
    );
    if (!response.data.startsWith("success")) {
      switch (response.data) {
        case "Incorrect Password Entered.":
          throw new Error("INCORRECT_PASSWORD");
        case "This Email ID is not registered with Wizemen.":
          throw new Error("UNREGISTERED_EMAIL_ID");
        default:
          throw new Error(
            "AUTHENTICATION_UNSUCCESSFUL: The server responded with " +
              response.data
          );
      }
    }
    if (!response.headers["set-cookie"]) {
      throw new Error("The server did not respond with the cookie header");
    }
    this.cookie = response.headers["set-cookie"][0].split(";")[0];
  }

  /**
   * Requests without the saved authentication, instead with a custom cookie.
   * @param {string} path - Relative path from root, ignoring the slash, for example "homecontrollers/login/validateUser".
   * @param {string} method - An HTTP method for the request (GET, POST, etc.)
   * @param {Object} data - A JS object to be passed as data.
   * @param {string} cookie - Cookie to send in the request headers.
   */
  async customCookieRequest(path, method, data, cookie) {
    let headers = {
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/json; charset=utf-8",
      Host: `${this.school.lowerCaseID}.wizemen.net`,
      Origin: `https://${this.school.lowerCaseID}.wizemen.net`,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      Referer: "https://psn.wizemen.net/launchpadnew",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
    };
    if (cookie) {
      headers["Cookie"] = cookie;
    }
    return await axios.request({
      url: `https://${this.school.lowerCaseID}.wizemen.net/${path}`,
      method,
      data,
      timeout: 10000,
      headers,
    });
  }

  /**
   * Requests for the authenticated user, abstracting away the "d" response argument.
   * @param {string} path - Relative path from root, ignoring the slash, for example "homecontrollers/login/validateUser".
   * @param {string} method - An HTTP method for the request (GET, POST, etc.)
   * @param {Object} data - A JS object to be passed as request data.
   * @param {Boolean} returnBody - A boolean, that indicates whether the whole response object should be returned or just the parsed body.
   */

  async request(path, method = "GET", data = {}, returnBody = true) {
    if (!this.cookie) {
      await this.authenticate();
    }

    const response = await this.customCookieRequest(
      path,
      method,
      data,
      this.cookie
    );

    //TODO check for expired cookie, if expired, authenticate and recursively call self.

    if (returnBody) {
      if (response.data["d"]) {
        return response.data["d"];
      }
      return response.data;
    }

    return response;
  }

  /**
   * Sends a POST request for the authenticated user, abstracting away the "d" response argument.
   * @param {string} path - Relative path from root, ignoring the slash, for example "homecontrollers/login/validateUser".
   * @param {Object} data - A JS object to be passed as request data.
   * @param {Boolean} returnBody - A boolean, that indicates whether the whole response object should be returned or just the parsed body.
   */
  async post(path, data, returnBody) {
    return await this.request(path, "POST", data, returnBody);
  }

  /**
   * Sends a GET request for the authenticated user, abstracting away the "d" response argument.
   * @param {string} path - Relative path from root, ignoring the slash, for example "homecontrollers/login/validateUser".
   * @param {Object} data - A JS object to be passed as request data.
   * @param {Boolean} returnBody - A boolean, that indicates whether the whole response object should be returned or just the parsed body.
   */
  async get(path, data, returnBody) {
    return await this.request(path, "GET", data, returnBody);
  }

  /**
   * Gets information about the user.
   */
  async getUserInfo() {
    //TODO fix this ;(
    await this.post("homecontrollers/launchpad/openPortal", {
      portalCode: "WIZPOR10",
    });
    return await this.post(
      "helpdesk/helpdesk_management.aspx/getUserLoginData"
    );
  }
}

const client = new Client(auth);

client.getUserInfo().then((i) => console.log(i));
