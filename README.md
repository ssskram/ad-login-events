# AD Login Events

AD Login Events is a BaaS service hosted in Azure that maintains a [table](https://github.com/CityofPittsburgh/az-table) of recent successful logins to City of Pittsburgh services.  Additionally, when a login occurs from an international location, the City's Security Engineer is alerted via [slack](https://github.com/CityofPittsburgh/baloo).

## catchEvents
This is a cron job that runs every five minutes.  It calls up the [MS Graph API](https://github.com/CityofPittsburgh/active-directory) for the previous 5 minutes of successful logins.  It writes every record to a [table](https://github.com/CityofPittsburgh/az-table) in Azure.  And for every event that originated from outside of the US, it posts an alert on slack via [baloo](https://github.com/CityofPittsburgh/baloo).

## deleteOldEvents
This is also a cron job that runs every five minutes.  It calls up the contents of the table in Azure, and deletes all records that are older than 48 hours.  Because we only need to keep a couple days worth of records for the [monitoring dashboard](https://github.com/CityofPittsburgh/ad-monitor).

## Authorization

No auth, only timer jobs

## Running Locally

### Prerequisites

* [Node.js](https://nodejs.org) - JS runtime
* local.settings.json - See local.settings.json.example for all required secrets

### Installation
```
git clone https://github.com/CityofPittsburgh/ad-login-events
cd ad-login-events
```

## Deployment

Deployed as an Azure Function.  Application is deployed directly from github, and can be triggered either (a) through the Azure GUI, (b) through the [CLI](https://docs.microsoft.com/en-us/cli/azure/webapp/deployment/source?view=azure-cli-latest#az-webapp-deployment-source-sync), or (c) through the [proxy service](https://github.com/CityofPittsburgh/azure-proxy).

For complete documentation on the azure environment, see [here](https://github.com/CityofPittsburgh/all-things-azure.git).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details