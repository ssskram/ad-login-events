
const fetch = require('node-fetch')
const moment = require('moment')
const azure = require('azure-storage')
const tableService = azure.createTableService()
const tz = require('moment-timezone')
global.Headers = fetch.Headers

module.exports = async (context, req) => {

    // get all events where timestamp is older than 48 hours
    const response = await fetch("https://az-table.azurewebsites.us/activeDirectory/toDelete", {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer ' + process.env.TABLE
        })
    })

    const events = await response.json()
    for (const event in events) {
        await deleteEntity(events[event])
    }

    // delete em all
    async function deleteEntity(event) {
        await new Promise(async function (resolve, reject) {
            await tableService.deleteEntity('adEvents', event, (error, result, response) => {
                if (!error) {
                    resolve(result)
                } else {
                    console.log(error)
                    reject(error)
                }
            })
        })
    }

    context.done()
}
