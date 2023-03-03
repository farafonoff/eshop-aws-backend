import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { REGION, TABLE_NAME } from "src/constants";
const dbClient = new DynamoDBClient({
  region: REGION,
});
const documentClient = DynamoDBDocumentClient.from(dbClient);

export async function getAllProducts() {
  const result = await documentClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return result.Items;
}

export async function queryProductById(productId: string) {
  const result = await documentClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id: productId } })
  );
  return result.Item;
}
