import { SQSBatchResponse, SQSEvent } from "aws-lambda";
import { batchPutProduct } from "src/repository/products";

export const catalogBatchProcess = async (
  event: SQSEvent
): Promise<SQSBatchResponse> => {
  console.log(`Invoke catalogBatchProcess with records ${event.Records}`);
  const products = event.Records.map((item) => JSON.parse(item.body));
  const writeResult = await batchPutProduct(products);
  const batchItemFailures = writeResult.map((failedId) => ({
    itemIdentifier: failedId,
  }));
  return { batchItemFailures };
};

export const main = catalogBatchProcess;
