let https = require("https")

class Client {
    codes = { "PSN": "Pathways School, Noida", "PSG": "Pathways School, Gurgaon", "PWS": "Pathways School, Aravali" }//TODO these need to be confirmed
    cookie = ""

    constructor(email, password, schoolCode) {
        this.schoolCode = schoolCode.toUpperCase();
        this.link = `${schoolCode.toLowerCase()}.wizemen.net`;
        this.fullLink = `https://${this.link}`;
        this.rootLink = this.fullLink + '/';
        this.email = email;
        this.password = password;
        this.schoolName = this.codes[this.schoolCode];
        if (!this.schoolName) { console.error("Incorrect school code entered.") }
    }


    request(json, path, method = "POST", responseJson = true, acceptArg = "application/json, text/javascript, */*; q=0.01", ignoreWrongResp = false) {
        return new Promise((resolve, reject) => {
            let payload = JSON.stringify(json)
            const options = {
                hostname: this.link,
                path: "/" + path,
                method: method,
                headers: {
                    "Accept": acceptArg,
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "en-GB,en;q=0.9",
                    "Cache-Control": "max-age=0",
                    "Connection": "keep-alive",
                    "Content-Length": `${payload.length}`,
                    "Content-Type": "application/json; charset=UTF-8",
                    "Cookie": this.cookie,
                    "Host": this.link,
                    "Origin": this.fullLink,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0",
                    "X-Requested-With": "XMLHttpRequest"
                }

            }
            let dataResponse;
            const req = https.request(options, response => {
                if (!response) { reject("There was no response form the server while making a general request.") }
                if (response.statusCode != 200 && !ignoreWrongResp) { reject("The server responded with a non OK response code! " + response.statusCode) }
                response.on("data", d => {
                    dataResponse += d;
                })
                response.on("end", function () {
                    dataResponse = dataResponse.replace("undefined", "")
                    if (responseJson) {
                        resolve({ "headers": response.headers, "body": JSON.parse(dataResponse).d })
                    }
                    resolve(dataResponse)
                })
            })
            req.on('error', error => {
                reject(error)
            })

            req.write(payload)
            req.end()

        })
    }

    async login() {

        let response = await this.request({
            emailid: this.email,
            pwd: this.password,
            schoolCode: this.schoolCode,
            schoolName: this.schoolName
        }, "generaldata.asmx/validateUser")

        if (response.body != "success_Student") {
            console.error("Either your authentication values are incorrect, or you're not logged in as a student. " + response.body);
            //TODO SUPPORT OTHER ACCOUNT TYPES

        }

        let cookieList = response.headers["set-cookie"];
        if (cookieList) { this.cookie = cookieList[0].split(";")[0] }


        return;
    }


}

module.exports = Client;


