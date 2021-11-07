import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { TableClient } from "@azure/data-tables"
import { DefaultAzureCredential } from "@azure/identity"
import { ResourceManagementClient } from "@azure/arm-resources";

const account = process.env["TABLE_ACCOUNT"];
const subscriptionId = process.env["SUBSCRIPTION_ID"];
const resourceGroupName = process.env["RESOURCE_GROUP"];


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const credential = new DefaultAzureCredential();
    const tableClient = new TableClient(
        `https://${account}.table.core.windows.net`,
        'servers',
        credential
      );

    if (req.method == "GET") {
      let entitiesIter = tableClient.listEntities();
      let resp:any = [];
      for await (const entity of entitiesIter) {
        resp.push(await getServerInfo(entity));
      }
      context.res = {
          body: resp
        };
    } else {
      const body = req.body;
      await tableClient.createEntity({ partitionKey: "fixed", rowKey: body.serverName, size: body.size , whitelist: body.whitelist, ops: body.ops, motd: body.motd, maxPlayers: body.maxPlayers});
      const retVal = await createServer(body.serverName, body.size, body.whitelist, body.ops, body.motd, body.maxPlayers);
      body.status = "Creating";
      context.res = {
        status: retVal,
        body: body
      };
    }

};

async function createServer(serverName:string, size:string, whitelist: string, ops:string, motd: string, maxPlayers: number) {
  let memory = 2;
  let cpu = 1;
  switch(size) {
    case "medium":
      memory = 8;
      cpu = 2;
      break;
    case "large":
      memory = 16;
      cpu = 4;
      break;
    case "small":
    default:
      memory = 4;
      cpu = 1;
      break;
  }
  const credential = new DefaultAzureCredential();
  const resourceClient = new ResourceManagementClient(credential, subscriptionId);
  const createResult = await resourceClient.deployments.beginCreateOrUpdate(resourceGroupName, serverName, { 
    location: "", 
    properties: { 
      mode: "Incremental", 
      templateLink: { 
        uri: "https://raw.githubusercontent.com/andreracz/minecraft-on-azure/master/vanilla-aci.json" 
      },
      parameters: ({
        serverName: {
          "value": serverName
        },
        whitelist: {
          "value": whitelist
        },
        ops: {
          "value": ops
        },
        eula: {
          "value": true
        },
        motd: {
          "value": motd
        },
        memory: {
          value: memory
        },
        numberCpuCores: {
          value: cpu
        },
        maxPlayers: {
          value: maxPlayers
        }
      })
    } 
  });
}

async function getServerInfo(serverInfo) {
    return {
        serverName: serverInfo.rowKey, size: serverInfo.size, maxPlayers: serverInfo.maxPlayers
    }
}

export default httpTrigger;