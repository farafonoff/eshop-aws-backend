import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  BatchWriteCommandOutput,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { REGION, TABLE_NAME } from "../constants";
import { Product } from "./product";
const dbClient = new DynamoDBClient({
  region: REGION,
});
const documentClient = DynamoDBDocumentClient.from(dbClient);

export async function getAllProducts(): Promise<Product[]> {
  const result = await documentClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return result.Items as Product[];
}

export async function getAllAvailableProducts(
  notLessCount: number
): Promise<Product[]> {
  const result = await documentClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      IndexName: "AvailableProducts",
      FilterExpression: "#productCount >= :amount",
      ExpressionAttributeValues: {
        ":amount": notLessCount,
      },
      ExpressionAttributeNames: {
        "#productCount": "count",
      },
    })
  );
  return result.Items as Product[];
}

export async function queryProductById(productId: string): Promise<Product> {
  const result = await documentClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id: productId } })
  );
  return result.Item as Product;
}

export async function putProduct(product: Product) {
  await documentClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...product,
      },
    })
  );
}

export async function batchPutProduct(products: Product[]): Promise<string[]> {
  const putRequests = products.map((product) => {
    return {
      PutRequest: {
        Item: product,
      },
    };
  });

  const batch: BatchWriteCommandInput = {
    RequestItems: {
      [TABLE_NAME]: putRequests,
    },
  };

  const result = await documentClient.send(new BatchWriteCommand(batch));
  const failedIds: string[] =
    result.UnprocessedItems[TABLE_NAME]?.map(
      (putRequest) => putRequest?.PutRequest?.Item?.id
    ) || [];
  console.log(`Batch write result`, result);
  console.log(failedIds);
  return failedIds;
}
