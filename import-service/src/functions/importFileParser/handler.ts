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
import { Readable } from "node:stream";
const client = new S3Client({});

async function processFile(key: string, bucket: string) {
  const read = new GetObjectCommand({
    Key: key,
    Bucket: bucket,
  });
  const response = await client.send(read);
  const pipe = (response.Body as Readable)
    .pipe(
      csvParser({
        separator: ";",
      })
    )
    .on("data", (data) => console.log(data));
  await new Promise((resolve, reject) => {
    pipe.on("end", resolve);
    pipe.on("error", reject);
  });
}

async function moveToProcessed(key: string, bucket: string) {
  const copyInput: CopyObjectCommandInput = {
    Bucket: bucket,
    CopySource: `${bucket}/${key}`,
    Key: key.replaceAll(UPLOAD_PREFIX, "processed/"),
  };
  await client.send(new CopyObjectCommand(copyInput));
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

const importProductsParser = async (event: S3Event) => {
  console.log(event);
  await Promise.all(
    event.Records.map(async (record) => {
      await processFile(record.s3.object.key, record.s3.bucket.name);
      await moveToProcessed(record.s3.object.key, record.s3.bucket.name);
      console.log(JSON.stringify(record));
    })
  );
};

export const main = importProductsParser;
