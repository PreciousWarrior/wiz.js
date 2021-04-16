const Client = require('./client');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("What is your email? ", function (email) {
    rl.question("What is your wizemen password? ", function (password) {
        rl.question("What is your school code? (default is PSN.) ", function (code) {
            let client = null;
            if (code == "") { client = new Client(email, password) }
            else { client = new Client(email, password, code) };
            client.start().then(r => {
                console.log(`\nWelcome, ${client.user.name}!`);

                client.getNotificationCount().then(count => {

                    console.log(`You have ${count} unread notifications.\nLooks like wiz.js is working properly!`)


                })
                //client.getCheckedAssessments().then(assesments => { console.log(assesments[0].scheduled_date) })

                //client.getSchedule(0).then(schedule => { console.log(schedule) })
                //client.getClasses().then(meetings => { console.log(meetings) })
                //client.getEvents().then(events => { console.log(events[100]) })

                //client.getAttendenceSummary().then(summary => { console.log(summary) })
            })
        })
    })
})

process.on("unhandledRejection", err => {
    throw err;
})

