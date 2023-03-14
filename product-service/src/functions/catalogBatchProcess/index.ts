//import schema from "./schema";
import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: {
        arn: { "Fn::GetAtt": ["CatalogItemsQueue", "Arn"] },
        batchSize: 5,
        functionResponseType:
          "ReportBatchItemFailures" as "ReportBatchItemFailures",
      },
    },
  ],
};
