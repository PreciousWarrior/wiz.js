/**
 * @typedef {Object} User
 * @property {number} id - The user's ID
 * @property {string} email - The user email
 * @property {string} type - The user type (Student, Teacher, etc.)
 * @property {string} name: - The user's name (excluding the middle name if present)
 * @property {string} gender: - The user's gender
 * @property {string} imageUrl: - The image (without protocol) of the user
 */
/**
 *  @typedef {Object} auth
 * @property {string} email - Email ID of the user
 * @property {string} password - Password of the user
 * @property {string} school - School ID of the user - PSN, PSG, etc
 * @property {string} type - Type of the user - student, teacher, etc
 */

/**
 * @typedef {Object} Meeting
 * @property {string|null|undefined} id - The ID of the meeting, exclusive to zoom meetings
 * @property {string} topic - The name of the class the zoom meeting is for
 * @property {number} startTime - The start time of the meeting, represented by the number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
 * @property {number} duration - The duration, in minutes, of the meeting
 * @property {string} url - The URL to join the meeting
 * @property {string|null|undefined} password - The password to join the meeting, exclusive to zoom meetings
 * @property {string} host - The host of the meeting
 * @property {string} agenda - The agenda of the meeting
 * @property {string} type - The type of the meeting, either "zoom" or "teams"
 */

/**
 * @typedef {Object} Schedule
 * @property {number} id - The ID of the class
 * @property {number} startTime - The start time of the class, represented by the number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
 * @property {number} endTime - The end time of the class, represented by the number of milliseconds that have elapsed since 1970-01-01 00:00:00 UTC
 * @property {string} weekday - The name of the day of the week of the class.
 * @property {string} teacherName - The name of the teacher of the class
 * @property {string} subject - The subject of the class
 * @property {string} code - The code of the class
 */

/**
 * @typedef {Object} Class
 * @property {number} id - The ID of the class
 * @property {string} name - The name of the class
 * @property {string} code - The code of the class
 * @property {Boolean} isAcademic - Whether the class is academic or not
 * @property {number} grade - The grade of the class
 * @property {Teacher} teacher - The teacher of the class
 * @property {Array<User>} students - The students in the class
 */

/**
 * @typedef {Object} ClassFromList
 * @property {string} program - The program (MYP, DP, etc) of the class
 * @property {number} grade - The grade of the class
 * @property {string} name - The name of the class
 * @property {string} shortName - The short name of the class
 * @property {number} id - The ID of the class
 * @property {number} code - The code of the class
 * @property {number} teacherId - The ID of the class' teacher
 *
 */

/**
 * @typedef {Object} Teacher
 * @property {string} name - The name of the teacher
 * @property {string} designation - The designation (such as 'Physics Teacher') of the teacher
 * @property {string} email - The email address of the teacher
 * @property {string} phoneNumber - The phone number of the teacher
 * @property {string} imageUrl - The image URL of the teacher without the protocol
 */
