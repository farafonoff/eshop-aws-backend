import { middyfy } from "@libs/lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UPLOAD_BUCKET_NAME } from "../../../constants";
import { APIGatewayEvent } from "aws-lambda";
import { UPLOAD_PREFIX } from "../../../constants";
const client = new S3Client({});

const importProductsFile = async (event: APIGatewayEvent) => {
  const fileName = event?.queryStringParameters?.name ?? "";
  if (!/^[0-9a-zA-Z\-]+\.csv$/.test(fileName)) {
    return {
      statusCode: 400,
      body: "name query param should match [0-9a-zA-Z-]+.csv",
    };
  }
  const command = new PutObjectCommand({
    Bucket: UPLOAD_BUCKET_NAME,
    Key: `${UPLOAD_PREFIX}${fileName}`,
  });
  const putUrl = await getSignedUrl(client, command);
  return {
    statusCode: 200,
    body: putUrl,
  };
};

export const main = middyfy(importProductsFile);
