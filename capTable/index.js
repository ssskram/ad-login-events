
const fetch = require('node-fetch')
const moment = require('moment')
const azure = require('azure-storage')
const tableService = azure.createTableService()
const tz = require('moment-timezone')
global.Headers = fetch.Headers

module.exports = async (context, req) => {

    // get all events where timestamp is older than 48 hours
    const events = []
    const query = new azure.TableQuery()
        .where('Timestamp le ?', 'Now - 48')

    // for each event, delete


    context.done()
}
