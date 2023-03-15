import {
  BatchWriteItemCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { SQSEvent } from "aws-lambda";
import { catalogBatchProcess } from "./handler";
import records from "./mockRequest.json";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const event: SQSEvent = records as any;
let dynamoClient = mockClient(DynamoDBClient);
let snsClient = mockClient(SNSClient);
describe("catalogBatchProcess", () => {
  it("should import products", () => {
    catalogBatchProcess(event);
    expect(dynamoClient).toReceiveCommandTimes(BatchWriteItemCommand, 1);
    expect(snsClient).toReceiveCommandTimes(PublishCommand, 1);
  });
});
