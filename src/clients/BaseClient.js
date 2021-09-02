import schools from "../data/schools";
import axios from "axios";
import portals from "../data/portals";

/**A class representing a Base Client. */
class Client {
	//TODO change portal auth system by reverse engineering customvals and how they work
	openedPortals = new Set();

	/**
	 * Create a Client
	 * @param auth - Authentication object for the user.
	 *
	 * @param refreshCookieEvery - Refresh the cookie every x milliseconds
	 */
	constructor(auth, refreshCookieEvery = 1000 * 60 * 60) {
		this.auth = auth;
		const schoolId = auth.school ?? "PSN";
		this.school = schools.find((school) => school.id === schoolId);
		this.userType = this.auth.type.toLowerCase() ?? "student";
		this.cookieTimeout = refreshCookieEvery;
		axios.defaults.timeout = 20000;
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
			} else {
				if (hours === "12" && minutes === "00") {
					return Date.UTC(1970, 0, 1);
				}
			}

			return Date.UTC(1970, 0, 1, hours, minutes);
		}
		const [hours, minutes] = time.split(":");
		return Date.UTC(1970, 0, 1, hours, minutes);
	}

	/**
	 *
	 * @param {string} wordyDate -  A date in the following format - 9-Aug-2021
	 * @param {string} dateSeperator - The seperator between the dates, defaults to "-"
	 * @param isMonthFirst
	 * @returns {Number} The time of the event, represented by the number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
	 */
	static convertWordyDateToUnixTimestamp(
		wordyDate,
		dateSeperator = "-",
		isMonthFirst = false
	) {
		
		let date;
		let monthName;
		let year;
		if (isMonthFirst) {
			const data = wordyDate.split(dateSeperator);
			monthName = data[0];
			date = data[1];
			year = data[2];
		} else {
			const data = wordyDate.split(dateSeperator);
			date = data[0];
			monthName = data[1];
			year = data[2];
		}
		const month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(monthName) / 3;
		return Date.UTC(year, month, date);
	}

	/**
	 *
	 * @param {string} dateString -  A date in the following format - 09-08-2021
	 * @param {string} dateSeperator - The seperator between the dates, defaults to "-"
	 * @returns {Number} The time of the event, represented by the number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
	 */
	static convertNumberDateToUnixTimestamp(dateString, dateSeperator = "-") {
		const [date, month, year] = dateString.split(dateSeperator);
		return Date.UTC(year, month - 1, date);
	}

	/**
	 * @param {Number} time - Time to subtract the offset from, represented by the number of milliseconds that have elapsed since 1970-01-01 +00:05:30 UTC
	 * @returns {Number} The number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
	 */
	static subtractTimezoneOffset(time) {
		return time - (5 * 60 * 60 * 1000 + 30 * 60 * 1000);
	}

	/**
	 * Authenticates to the wizemen API using the provided credentials.
	 * @private
	 */
	authenticate = async () => {
		if (this.cookie) {
			await this.logout();
		}
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
		this.timeout = setTimeout(this.authenticate, this.cookieTimeout);
	};

	/**
	 * Invalidates the current cookie (logs out with wizemen)
	 * @private
	 */
	async logout() {
		await this.get("signout");
		this.cookie = null;
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
			{portalCode: `WIZPOR${portalId}`}
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
			path = path.replace("/", "");
		}
		let headers = {
			Accept: "*/*",
			"Accept-Encoding": "gzip, deflate, br",
			"Content-Type": "application/json; charset=utf-8",
		};
		if (cookie) {
			headers["Cookie"] = cookie;
		}
		const resp = await axios.request({
			url: `https://${this.school.lowerCaseID}.wizemen.net/${path}`,
			method,
			data,
			headers,
		});
		
		return resp;
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
		}

		// for testing authentication, etc

		if (!path) return;

		if (portalId) {
			await this.openPortal(portalId);
		}

		const response = await this.customCookieRequest(
			path,
			method,
			data,
			this.cookie
		);

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
	 * @returns {Promise<{gender: *, imageUrl, name: string, id: number, type: *, email: *}>} - returns a User object.
	 */
	async getUserInfo() {
		const shitDataStructure = await this.post(
			"helpdesk/helpdesk_management.aspx/getUserLoginData",
			undefined,
			true,
			portals.HELPDESK
		);
		return {
			id: +shitDataStructure.user_id.substring(6),
			email: shitDataStructure.user_email,
			type: shitDataStructure.user_type,
			name: `${shitDataStructure.user_first_name} ${shitDataStructure.user_last_name}`,
			gender: shitDataStructure.user_gender,
			imageUrl: shitDataStructure.user_image.split("https://")[1],
		};
	}
}

export default Client;
