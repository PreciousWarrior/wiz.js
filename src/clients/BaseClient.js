import schools from "../data/schools.js";
import axios from "axios";
import portals from "../data/portals.js";
import * as Types from "../typedefs.js";

export default class Client {
  openedPortals = new Set();

  /**
   * A class representing a Base Client.
   * @param {Types.auth} auth - Authentication object for the user.
   *
   * @param {string} userType - The expected user type of the user (error will be thrown if a different user type is found)
   */
  constructor(auth, userType) {
    const schoolObject = schools[auth.school];
    if (!schoolObject) {
      throw new Error("An invalid school ID was provided to the BaseClient.");
    }
    this.auth = auth;
    this.school = schoolObject;
    this.userType = userType.toLowerCase();
  }
  /**
   * Authenticates to the wizemen API using the provided credentials.
   * @private
   */
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
   * Opens a portal which tells wizemen to allow the cookie to access certain API endpoints. This is *required* before accessing the API endpoint.
   * @param {Number} portalId - The ID of the portal to open (+ve integer)
   */

  async openPortal(portalId) {
    if (this.openedPortals.has(portalId)) {
      return;
    }
    const sessionVals = await this.post(
      "homecontrollers/launchpad/openPortal",
      { portalCode: `WIZPOR${portalId}` }
    );
    await this.get(sessionVals);
    this.openedPortals.add(portalId);
    return sessionVals;
  }

  /**
   * Requests without the saved authentication, instead with a custom cookie.
   * @param {string} path - Relative path from root, ignoring the slash, for example "homecontrollers/login/validateUser".
   * @param {string} method - An HTTP method for the request (GET, POST, etc.)
   * @param {Object} data - A JS object to be passed as data.
   * @param {string} cookie - Cookie to send in the request headers.
   */
  async customCookieRequest(path, method, data, cookie) {
    if (path[0] === "/") {
      path.replace("/", "");
    }
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
   * @param {Boolean} expectSingleObject - The response's body from the API endpoint will *always* be an array with a single object. The function returns the object in the array (wizemen likes to do this a lot).
   * @param {Number} portalId - The ID of a portal to open before sending the request
   * @param {Boolean} returnBody - A boolean, that indicates whether the whole response object should be returned or just the parsed body.
   */

  async request(
    path,
    method = "GET",
    data = {},
    expectSingleObject = false,
    portalId,
    returnBody = true
  ) {
    if (!this.cookie) {
      await this.authenticate();
      this.user = await this.getUserInfo();
      if (this.userType && this.user.type.toLowerCase() !== this.userType) {
        throw new Error(
          `User type was ${this.user.type.toLowerCase()} whereas expected type was ${
            this.userType
          }`
        );
      }
    }

    if (portalId) {
      await this.openPortal(portalId);
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
        if (!expectSingleObject) {
          return response.data["d"];
        }
        if (response.data["d"].length > 1) {
          throw new Error(
            "Response array has more than one object when expectSingleObject was specified."
          );
        }
        if (response.data["d"].length === 1) {
          return response.data["d"][0];
        }
        return null;
      }
      return response.data;
    }

    return response;
  }

  /**
   * Sends a POST request for the authenticated user, abstracting away the "d" response argument.
   * @param {string} path - Relative path from root, ignoring the slash, for example "homecontrollers/login/validateUser".
   * @param {Object} data - A JS object to be passed as request data.
   * @param {Boolean} expectSingleObject - The response's body from the API endpoint will *always* be an array with a single object. The function returns the object in the array (wizemen likes to do this a lot).
   * @param {Number} portalId - The ID of a portal to open before sending the request
   * @param {Boolean} returnBody - A boolean, that indicates whether the whole response object should be returned or just the parsed body.
   */
  async post(path, data, expectSingleObject, portalId, returnBody) {
    return await this.request(
      path,
      "POST",
      data,
      expectSingleObject,
      portalId,
      returnBody
    );
  }

  /**
   * Sends a GET request for the authenticated user, abstracting away the "d" response argument.
   * @param {string} path - Relative path from root, ignoring the slash, for example "homecontrollers/login/validateUser".
   * @param {Object} data - A JS object to be passed as request data.
   * @param {Boolean} expectSingleObject - The response's body from the API endpoint will *always* be an array with a single object. The function returns the object in the array (wizemen likes to do this a lot).
   * @param {Number} portalId - The ID of a portal to open before sending the request
   * @param {Boolean} returnBody - A boolean, that indicates whether the whole response object should be returned or just the parsed body.
   */
  async get(path, data, expectSingleObject, portalId, returnBody) {
    return await this.request(
      path,
      "GET",
      data,
      expectSingleObject,
      portalId,
      returnBody
    );
  }

  /**
   * Gets information about the user.
   * @returns {Promise<Types.User>} - returns a User object.
   */
  async getUserInfo() {
    const shitDataStructure = await this.post(
      "helpdesk/helpdesk_management.aspx/getUserLoginData",
      undefined,
      true,
      portals.HELPDESK
    );
    const betterDataStructure = {};
    for (const [key, value] of Object.entries(shitDataStructure)) {
      betterDataStructure[key.replace("user_", "")] = value;
    }
    return betterDataStructure;
  }

  /**
   * @param {string} time
   * @param {Boolean} is12Hour
   * @returns {Number} The time of the event, represented by the number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
   */
  static convertTimeToUnixTimestamp(time, is12Hour = true) {
    if (is12Hour) {
      const [parsedTime, AMPM] = time.split(" ");
      let [hours, minutes] = parsedTime.split(":");
      if (AMPM === "PM") {
        if (hours != 12) {
          hours = 12 + +hours;
        }
      }
      return new Date(
        Date.UTC(1970, 0, 1, -5 + +hours, -30 + +minutes)
      ).getTime();
    }
    const [hours, minutes] = time.split(":");
    return new Date(
      Date.UTC(1970, 0, 1, -5 + +hours, -30 + +minutes)
    ).getTime();
  }

  /**
   *
   * @param {string} wordyDate -  A date in the following format - 9-Aug-2021
   * @param {string} dateSeperator - The seperator between the dates, defaults to "-"
   * @returns {Number} The time of the event, represented by the number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
   */
  static convertWordyDateToUnixTimestamp(wordyDate, dateSeperator = "-") {
    const [date, monthName, year] = wordyDate.split(dateSeperator);
    const month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(monthName) / 3;
    return new Date(Date.UTC(year, month, date, -5, -30)).getTime();
  }

  /**
   *
   * @param {string} dateString -  A date in the following format - 09-08-2021
   * @param {string} dateSeperator - The seperator between the dates, defaults to "-"
   * @returns {Number} The time of the event, represented by the number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
   */
  static convertNumberDateToUnixTimestamp(dateString, dateSeperator = "-") {
    const [date, month, year] = dateString.split(dateSeperator);
    return new Date(Date.UTC(year, month, date, -5, -30)).getTime();
  }
}
