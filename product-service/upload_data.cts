import mockData from "./mockResponse.json";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { REGION, TABLE_NAME } from "./src/constants";
const dbClient = new DynamoDBClient({
  region: REGION,
});
const documentClient = DynamoDBDocumentClient.from(dbClient);

const putRequests = mockData.map((item) => {
  return {
    PutRequest: {
      Item: item,
    },
  };
});

const batch: BatchWriteCommandInput = {
  RequestItems: {
    [TABLE_NAME]: putRequests,
  },
};

async function doWork() {
  const result = await documentClient.send(new BatchWriteCommand(batch));
  return result;
}
doWork().then(console.log).catch(console.error);
