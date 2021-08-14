/**
 * @typedef {Object} User
 * @property {string} id - The user ID
 * @property {string} email - The user email
 * @property {string} type - The user type
 * @property {string} first_name: - The user's first name
 * @property {string} middle_name: - The user's middle name
 * @property {string} last_name: - The user's last name
 * @property {string} school: - The ID of the user's school
 * @property {string} gender: - The user's gender
 * @property {string} image: - An HTTP path to the user's image
 * @property {string} school_name: - The name of the user's school
 */
/**
 *  @typedef {Object} auth
 * @property {string} email - Email ID of the user
 * @property {string} password - Password of the user
 * @property {Number} school - School ID (0-2) of the user
 */

/**
 * @typedef {Object} Meeting
 * @property {string} id - The ID of the meeting
 * @property {string} topic - The name of the class the zoom meeting is for
 * @property {Number} startTime - The start time of the meeting, represented by the number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
 * @property {Number} duration - The duration, in minutes, of the meeting
 * @property {string} url - The URL to join the meeting
 * @property {string} password - The password to join the meeting
 * @property {string} host - The host of the meeting
 * @property {string} agenda - The agenda of the meeting
 */

/**
 * @typedef {Object} Schedule
 * @property {Number} id - The ID of the class
 * @property {Number} startTime - The start time of the class, represented by the number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
 * @property {Number} endTime - The end time of the class, represented by the number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
 * @property {string} weekday - The name of the day of the week of the class.
 * @property {string} teacherName - The name of the teacher of the class
 * @property {string} subject - The subject of the class
 * @property {string} code - The code of the class
 */

/**
 * @typedef {Object} Class
 * @property {Number} id - The ID of the class
 * @property {string} name - The name of the class
 * @property {string} code - The code of the class
 * @property {Boolean} isAcademic - Whether the class is academic or not
 * @property {Number} grade - The grade of the class
 */

/**
 * @typedef {Object} ClassFromList
 * @property {string} program - The program (MYP, DP, etc) of the class
 * @property {Number} grade - The grade of the class
 * @property {string} name - The name of the class
 * @property {string} shortName - The short name of the class
 * @property {Number} id - The ID of the class
 * @property {Number} code - The code of the class
 * @property {Number} teacherId - The ID of the class' teacher
 *
 */

export default {};
