
const fetch = require('node-fetch')
const azure = require('azure-storage')
const tableService = azure.createTableService()
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
    
    context.log(events.length)
    // delete em all
    async function deleteEntity(event) {
        await new Promise(async function (resolve, reject) {
            await tableService.deleteEntity('adEvents', event, (error, result, response) => {
                if (!error) {
                    context.log('success')
                    resolve(result)
                } else {
                    context.log('error')
                    reject(error)
                }
            })
        })
    }

    context.done()
}
