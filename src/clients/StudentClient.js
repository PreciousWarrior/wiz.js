import Client from "./BaseClient.js";
import auth from "../data/auth.js";
import portals from "../data/portals.js";
import * as Types from "../typedefs.js";

/** Class representing a Student, sharing collections of functions that work for both MYP and DP students.*/
class Student extends Client {
  /**
   * Create a student
   * @param {Types.auth} auth - Authentication object for the student.
   */
  constructor(auth) {
    super(auth, "student");
  }

  /**
   * @private
   */
  async getZoomMeetings() {
    return await this.post(
      "classes/student/VirtualClassZoomStudent.aspx/getScheduledMeetings",
      undefined,
      false,
      portals.CLASSES
    );
  }

  /**
   * @private
   */

  async getTeamsMeetings() {
    return await this.post(
      "classes/student/VirtualClassTeamsStudent.aspx/getScheduledMeetings",
      undefined,
      false,
      portals.CLASSES
    );
  }

  /**
   *
   * @returns {Promise<Types.Meeting[]>} Returns all the Zoom meetings of the user
   */
  async getMeetings() {
    const zoomMeetings = await this.getZoomMeetings();
    return zoomMeetings.map((meeting) => {
      const timestamp = Client.subtractTimezoneOffset(
        Client.convertWordyDateToUnixTimestamp(meeting.start_date) +
          Client.convertTimeToUnixTimestamp(meeting.start_time)
      );

      return {
        type: "zoom",
        id: meeting.meeting_id,
        className: meeting.topic,
        startTime: timestamp,
        duration: +meeting.duration,
        url: meeting.join_url,
        password: meeting.meeting_password,
        host: meeting.host,
        agenda: meeting.agenda,
      };
    });

    //TODO add Teams meeting object here (need a team meeting object sample in order to add)
  }

  /**
   * Gets the user's classes
   * @returns {Promise<Types.ClassFromList[]>}
   */
  async getClasses() {
    const classes = await this.post(
      "classes/student/allclasses.aspx/getClassList",
      undefined,
      false,
      portals.CLASSES
    );
    return classes.map((c) => {
      return {
        program: c.program,
        grade: +c.grade.split(" ")[1],
        name: c.course,
        shortName: c.subject,
        id: +c.class_id,
        code: c.class_code,
        teacherId: +c.teacher_id,
      };
    });
  }

  /**
   * @param {Number} weekId - The ID of the week to get, where 0 is the current week. Must be an integer.
   * @returns {Promise<Types.Schedule[][]>} - Returns the class schedule of the user in a jagged array, having an array of days in a week, and then an array of classes in a day.
   */
  async getClassSchedule(weekId = 0) {
    const rawSchedule = await this.post(
      "classes/generaldata.asmx/LoadClassScheduleNew",
      { Counter: weekId, week: "ca" },
      false,
      portals.CLASSES
    );
    const parsedSchedule = [[], [], [], [], [], [], []];
    const weekDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    rawSchedule.forEach((scheduleObj) => {
      parsedSchedule[weekDays.indexOf(scheduleObj.key_id)].push({
        id: parseInt(scheduleObj.class_id),
        weekday: scheduleObj.key_id,
        startTime: Client.subtractTimezoneOffset(
          Client.convertNumberDateToUnixTimestamp(
            scheduleObj.start_date_display,
            "/"
          ) + Client.convertTimeToUnixTimestamp(scheduleObj.start_time, false)
        ),

        endTime: Client.subtractTimezoneOffset(
          Client.convertNumberDateToUnixTimestamp(
            scheduleObj.start_date_display,
            "/"
          ) + Client.convertTimeToUnixTimestamp(scheduleObj.end_time, false)
        ),
        teacherName: scheduleObj.teacher_full_name,
        subject: scheduleObj.subject,
        code: scheduleObj.class_code,
      });
    });
    return parsedSchedule;
  }

  /**
   * Gets class information from the ID.
   * @param {Number} id - The ID of the class
   * @returns {Promise<Types.Class>} - The class object for the ID.
   */
  async getClass(id) {
    const payload = {
      class_id: id.toString(),
      classname: "",
    };
    await this.post(
      "classes/student/studenthomeold.aspx/setclasssession",
      payload,
      false,
      portals.CLASSES
    );
    const classInfo = await this.post(
      "classes/student/studenthomeold.aspx/getclasscode"
    );
    return {
      id: +classInfo.class_id,
      name: classInfo.class_name,
      code: classInfo.classcode,
      isAcademic: classInfo.course_type === "Academic",
      grade: +classInfo.grade.split(" ")[1],
    };
  }
}

export default Student;
