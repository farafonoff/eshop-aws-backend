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
const client = new S3Client({});

export const processFile = async (key: string, bucket: string) => {
  const read = new GetObjectCommand({
    Key: key,
    Bucket: bucket,
  });
  const response = await client.send(read);
  const pipe = (response.Body as Readable)
    .pipe(stripBom())
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

const importProductsParser = async (event: S3Event) => {
  await Promise.all(
    event.Records.map(async (record) => {
      await processFile(record.s3.object.key, record.s3.bucket.name);
      await moveToProcessed(record.s3.object.key, record.s3.bucket.name);
    })
  );
};

export const main = importProductsParser;
