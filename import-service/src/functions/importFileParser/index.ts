import { handlerPath } from "@libs/handler-resolver";
import { UPLOAD_BUCKET_NAME } from "../../../constants";
import { UPLOAD_PREFIX } from "../../../constants";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: UPLOAD_BUCKET_NAME,
        event: "s3:ObjectCreated:*",
        rules: [
          {
            prefix: UPLOAD_PREFIX,
          },
        ],
      },
    },
  ],
};
