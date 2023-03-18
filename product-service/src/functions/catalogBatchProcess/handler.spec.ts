import { SQSEvent } from "aws-lambda";
import { catalogBatchProcess } from "./handler";
import records from "./mockRequest.json";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  BatchWriteCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { TABLE_NAME } from "../../constants";

const event: SQSEvent = records as any;
let dynamoClient = mockClient(DynamoDBDocumentClient);
let snsClient = mockClient(SNSClient);
const batchWriteResult: BatchWriteCommandOutput = {
  UnprocessedItems: {
    [TABLE_NAME]: [
      {
        PutRequest: {
          Item: { id: "failed" },
        },
      },
    ],
  },
  $metadata: {
    httpStatusCode: 200,
    requestId: "H4TI0FSS4DDC7UGTVO4LH0U0MBVV4KQNSO5AEMVJF66Q9ASUAAJG",
    extendedRequestId: undefined,
    cfId: undefined,
    attempts: 1,
    totalRetryDelay: 0,
  },
};
describe("catalogBatchProcess", () => {
  beforeEach(() => {
    dynamoClient.reset();
    snsClient.reset();
    dynamoClient.on(BatchWriteCommand).resolves(batchWriteResult);
  });
  it("should import products", async () => {
    const result = await catalogBatchProcess(event);
    expect(dynamoClient).toReceiveCommandTimes(BatchWriteCommand, 1);
    expect(snsClient).toReceiveCommandTimes(PublishCommand, 1);
    expect(result.batchItemFailures[0].itemIdentifier).toBe("failed");
  });
});
