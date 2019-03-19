
const fetch = require('node-fetch')
const moment = require('moment')
const azure = require('azure-storage')
const tableService = azure.createTableService()
const tz = require('moment-timezone')
global.Headers = fetch.Headers

module.exports = async (context, req) => {

    // get all events, last five minutes
    const response = await fetch("https://active-directory.azurewebsites.us/loginEvents/events?prevMinutes=5", {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer ' + process.env.ACTIVE_DIRECTORY
        })
    })

    const events = await response.json()
    for (const event in events) {
        await saveToTable(events[event])
        if ((events[event].country != null && events[event].country != "US")) {
            await alertInternationalLogins(events[event])
        }
    }

    async function saveToTable(event) {
        const entGen = azure.TableUtilities.entityGenerator
        const entity = {
            PartitionKey: entGen.String(event.userName),
            RowKey: entGen.String(event.id),
            eventTime: event.time,
            userEmail: event.userEmail,
            appName: event.appName,
            ipAddress: event.ipAddress,
            city: event.city,
            state: event.state,
            country: event.country,
            latitude: event.latitude,
            longitude: event.longitude
        }
        await tableService.insertOrReplaceEntity('adEvents', entity, function (error, result, response) {
            if (!error) {
                res.status(200).send()
            } else {
                console.log(error)
                res.status(500).send(error)
            }
        });
    }

    function alertInternationalLogins(event) {
        fetch("https://baloo.azurewebsites.us/activeDirectory/alert", {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + process.env.BALOO,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                user: event.userName,
                country: event.country,
                time: moment(event.time).tz('America/New_York').format('MM-DD-YYYY, hh:mm A'),
                id: event.id
            })
        })
    }

    context.done()
}
