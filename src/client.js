const apiLib = require('./api');


cookieRefreshHours = 1 //currently this is an extreme lower bound since no tests have been conducted.


class Client {
    #REFRESHHOURS = 1
    REFRESHTIME = 1000 * 60 * 60 * this.#REFRESHHOURS
    constructor(email, password, schoolCode = "PSN") {
        this.api = new apiLib(email, password, schoolCode);
    }

    async start() {
        await this.refresh()
    }

    async refresh() {
        await this.api.login();
        this.user = await this.getUser();
        this.user.name = `${this.user.userFirstName} ${this.user.userLastName}`;
        await this.verifyClasses();
    }

    async getUser() {
        let response = await this.api.request({}, "userProfile/frmUserProfileStudent.aspx/getUser");
        return response.body[0];
    }

    //MAIN FUNCTIONS BEGIN

    async getZoomMeetings() {
        let response = await this.api.request({}, "classes/student/VirtualClassZoomStudent.aspx/getScheduledMeetings");
        return response.body;
    }

    async getClasses() {
        let response = await this.api.request({}, "classes/student/allclasses.aspx/getClassList");
        return response.body;
    }

    async getCheckedAssessments() {
        let response = await this.api.request({}, "student/home.aspx/getAssessmentChecked");
        return response.body;
    }

    async getSchedule(week = 0) {
        //this is currently broken./
        let weekStr;
        if (week == 0) { weekStr = "currentweek" }
        else if (week > 0) { weekStr = "nextweek" }
        else { weekStr = "prevweek" }
        let response = await this.api.request({
            "week": weekStr,
            "Counter": week
        }, "classes/generaldata.asmx/LoadClassScheduleNew");
        return response.body;
    }

    async getNotificationCount() {
        let response = await this.api.request({}, "NotificationDtls.asmx/getUnreadNotificationCount");
        return Number(response.body);
    }

    async getAttendenceSummary() {
        let response = await this.api.request({}, "classes/student/studentattendance.aspx/getAttendanceSummary");
        return response.body;
    }

    async getEvents() {
        let response = await this.api.request({ "movdir": "Current" }, "classes/student/studentclasscalendar.aspx/getEvents");
        return response.body;
    }

    //MAIN FUNCTIONS END

    async verifyClasses() {
        let getSessionVals = await this.api.request({ "portalCode": "WIZPOR6", "schoolName": this.user.userSchool }, "generaldata.asmx/openPortal");

        await this.api.request({}, getSessionVals.body.slice(1), "GET", false,
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", true);
        return;

    }




}


module.exports = Client

