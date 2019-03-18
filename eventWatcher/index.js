const fetch = require('node-fetch')
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
        await saveToTable(event)
    }

    context.done()
}

const saveToTable = async (event) => {
    await fetch("https://az-table.azurewebsites.us/activeDirectory/newEvent", {
        method: 'post',
        headers: new Headers({
            'Authorization': 'Bearer ' + process.env.TABLE,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(event)
    })
    return
}
