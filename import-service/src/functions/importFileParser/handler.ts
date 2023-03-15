import {
  CopyObjectCommand,
  CopyObjectCommandInput,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import { UPLOAD_PREFIX } from "../../../constants";
import csvParser from "csv-parser";
import stripBom from "strip-bom-stream";
import { Readable } from "node:stream";
import middy from "@middy/core";
import ssm from "@middy/ssm";
import { SendMessageBatchCommand, SQSClient } from "@aws-sdk/client-sqs";
const client = new S3Client({});
const sqsClient = new SQSClient({});

export const sendToQueue = async (queueUrl: string, record: object[]) => {
  const entries = record.map((record, index) => ({
    Id: String(index),
    MessageBody: JSON.stringify(record),
  }));
  const chunkSize = 10;
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);
    const sendResult = await sqsClient.send(
      new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: chunk,
      })
    );
    console.log("Messages send result", sendResult);
  }
};

export const processFile = async (key: string, bucket: string) => {
  const read = new GetObjectCommand({
    Key: key,
    Bucket: bucket,
  });
  const records = [];
  const response = await client.send(read);
  const pipe = (response.Body as Readable)
    .pipe(stripBom())
    .pipe(
      csvParser({
        separator: ";",
      })
    )
    .on("data", (data) => {
      console.log(data);
      records.push(data);
    });
  await new Promise((resolve, reject) => {
    pipe.on("end", resolve);
    pipe.on("error", reject);
  });
  return records;
};
export const moveToProcessed = async (key: string, bucket: string) => {
  const copyInput: CopyObjectCommandInput = {
    Bucket: bucket,
    CopySource: `${bucket}/${key}`,
    Key: key.replaceAll(UPLOAD_PREFIX, "processed/"),
  };
  await client.send(new CopyObjectCommand(copyInput));
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};

export const importProductsParser = async (event: S3Event, context) => {
  await Promise.all(
    event.Records.map(async (record) => {
      const records = await processFile(
        record.s3.object.key,
        record.s3.bucket.name
      );
      await sendToQueue(context.queueUrl, records);
      await moveToProcessed(record.s3.object.key, record.s3.bucket.name);
    })
  );
};

export const main = middy(importProductsParser).use(
  ssm({
    fetchData: {
      queueUrl: "CatalogItemsQueue",
    },
    setToContext: true,
  })
);
