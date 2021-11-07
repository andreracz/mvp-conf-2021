import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { TableClient } from "@azure/data-tables"
import { DefaultAzureCredential } from "@azure/identity"

const account = process.env["TABLE_ACCOUNT"];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const credential = new DefaultAzureCredential();
    const tableClient = new TableClient(
        `https://${account}.table.core.windows.net`,
        'servers',
        credential
      );

    let entitiesIter = tableClient.listEntities();
    let resp:any = [];
    for await (const entity of entitiesIter) {
      resp.push(await getServerInfo(entity));
    }
    context.res = {
        body: resp
      };
};

async function getServerInfo(serverInfo) {
    return {
        serverName: serverInfo.rowKey, size: serverInfo.size, maxPlayers: serverInfo.maxPlayers
    }
}

export default httpTrigger;