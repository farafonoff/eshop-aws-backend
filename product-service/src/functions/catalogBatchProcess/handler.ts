import { SQSBatchResponse, SQSEvent } from "aws-lambda";
import {
  PublishCommand,
  PublishCommandInput,
  SNSClient,
} from "@aws-sdk/client-sns";
import { batchPutProduct } from "../../repository/products";

const snsClient = new SNSClient({});

export const catalogBatchProcess = async (
  event: SQSEvent
): Promise<SQSBatchResponse> => {
  console.log(`Invoke catalogBatchProcess with records`, event.Records);
  const products = event.Records.map((item) => JSON.parse(item.body));
  const writeResult = await batchPutProduct(products);
  const batchItemFailures = writeResult.map((failedId) => ({
    itemIdentifier: failedId,
  }));
  const publishInput: PublishCommandInput = {
    TopicArn: process.env.TOPIC_ARN,
    Subject: `Imported products: ${products.length} success and ${batchItemFailures.length} failed`,
    Message: JSON.stringify(
      `Imported products ${JSON.stringify(
        products,
        null,
        2
      )}, errors: ${JSON.stringify(batchItemFailures, null, 2)}`
    ),
    MessageAttributes: {
      batchSize: {
        DataType: "Number",
        StringValue: String(products.length),
      },
      failedCount: {
        DataType: "Number",
        StringValue: String(batchItemFailures.length),
      },
    },
  };
  await snsClient.send(new PublishCommand(publishInput));
  return { batchItemFailures };
};

export const main = catalogBatchProcess;
