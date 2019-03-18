
const fetch = require('node-fetch')
const moment = require('moment')
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
        if (events[event].country != "US") {
            context.log("not from us")
            context.log(events[event])
            await alertInternationalLogins(events[event])
        }
    }

    async function saveToTable(event) {
        await fetch("https://az-table.azurewebsites.us/activeDirectory/newEvent", {
            method: 'post',
            headers: new Headers({
                'Authorization': 'Bearer ' + process.env.TABLE,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(event)
        })
        .then(res => context.log(res.status))
        return
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
