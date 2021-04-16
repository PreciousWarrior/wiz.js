const Client = require('./client');

process.on("unhandledRejection", err => {
    throw err;
})

module.exports = { Client }