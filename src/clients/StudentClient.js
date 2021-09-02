import Client from "./BaseClient";
import portals from "../data/portals";

/** Class representing a Student, sharing collections of functions that work for both MYP and DP students.*/
class Student extends Client {
  /**
   * @param auth - Authentication object for the student.
   */
  constructor(auth) {
    auth.type = "student";
    super(auth);
  }

  /**
   * Builds a student and checks for any possible authentication errors.
   * @param auth
   * @returns {Promise<Student>}
   */
  static async build(auth) {
    const client = new Student(auth);
    try {
      await client.request();
      return client;
    } catch (e) {
      throw e;
    }
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
   * @returns {Promise} Returns all the Zoom meetings of the user
   */
  async getMeetings() {
    await this.request();
    let [zoomMeetings, teamsMeetings] = await Promise.all([
      this.getZoomMeetings(),
      this.getTeamsMeetings(),
    ]);
    zoomMeetings = zoomMeetings.map((meeting) => {
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
    teamsMeetings = teamsMeetings.map((meeting) => {
      const timestamp = Client.subtractTimezoneOffset(
        Client.convertWordyDateToUnixTimestamp(meeting.start_date) +
          Client.convertTimeToUnixTimestamp(meeting.start_time)
      );
      return {
        type: "teams",
        className: meeting.topic,
        startTime: timestamp,
        duration: +meeting.duration,
        url: meeting.join_url,
        host: meeting.host,
        agenda: meeting.agenda,
      };
    });
    return zoomMeetings.concat(teamsMeetings);
  }

  /**
   * Gets the user's classes
   * @returns {Promise}
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
   * @returns {Promise} - Returns the class schedule of the user in a jagged array, having an array of days in a week, and then an array of classes in a day.
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
    const classPromise = this.post(
      "classes/student/studenthomeold.aspx/getclasscode"
    );
    const studentsPromise = this.post(
      "classes/faculty/facultyclassroster.aspx/showclasslist",
      { menuid: "" }
    );
    const teacherPromise = this.post(
      "classes/student/studentclassroster.aspx/getteacherdetail",
      undefined,
      true
    );

    const [classInfo, students, teacher] = await Promise.all([
      classPromise,
      studentsPromise,
      teacherPromise,
    ]);
    const parsedTeacher = {
      name: teacher.formtutor_name,
      designation: teacher.formtutor_designation.trim(),
      email: teacher.formtutor_mail,
      phoneNumber: teacher.formtutor_phone,
      imageUrl: `${this.school.lowerCaseID}.wizemen.net${teacher.formtutor_img}`,
    };
    const parsedStudents = students.map((student) => {
      return {
        id: +student.user_id.substring(6),
        name: `${student.student_first_name} ${student.student_last_name}`,
        birthday: Client.convertWordyDateToUnixTimestamp(
          student.birthday.replace(",", ""),
          " ",
          true
        ),
        type: "Student",
        email: student.student_email,
        imageUrl: student.img_path,
        parents: [
          {
            name: `${student.parent1_first_name} ${student.parent1_last_name}`,
            email: student.parent1_email,
            phoneNumber: student.parent1_mobile,
          },
          {
            name: `${student.parent2_first_name} ${student.parent2_last_name}`,
            email: student.parent2_email,
            phoneNumber: student.parent2_mobile,
          },
        ],
        //wizemen does not pass gender in the students array for the class
        gender: null,
        homeroomTeacherName: student.homeroom_teacher_name,
      };
    });
    return {
      id: +classInfo.class_id,
      name: classInfo.class_name,
      code: classInfo.classcode,
      isAcademic: classInfo.course_type === "Academic",
      grade: +classInfo.grade.split(" ")[1],
      teacher: parsedTeacher,
      students: parsedStudents,
    };
  }
}

export default Student;
