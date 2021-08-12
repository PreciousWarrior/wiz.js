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
   * @returns {Types.Meeting[]} Returns all the Zoom meetings of the user
   */
  async getMeetings() {
    const [zoomMeetings, teamsMeetings] = await Promise.all([
      this.getZoomMeetings(),
      this.getTeamsMeetings(),
    ]);
    return zoomMeetings.map((meeting) => {
      return {
        type: "zoom",
        id: meeting.meeting_id,
        className: meeting.topic,
        startTime: Client.convertWizemenTimeToDateObject(
          meeting.start_date,
          meeting.start_time
        ),
        duration: meeting.duration,
        url: meeting.join_url,
        password: meeting.meeting_password,
        host: meeting.host,
        agenda: meeting.agenda,
      };
    });

    //TODO add Teams meeting object here (need a team meeting object sample in order to add)
  }

  /*
  async getClasses() {
    return await this.post(
      "classes/student/allclasses.aspx/getClassList",
      undefined,
      false,
      portals.CLASSES
    );
  }
  */
}

export default Student;

const student = new Student(auth);
student.getMeetings().then((a) => console.log(a));
