import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { sdkStreamMixin } from "@aws-sdk/util-stream-node";
import * as handler from "./handler";
import { S3EventRecord } from "aws-lambda";
import { createReadStream } from "fs";
import { join } from "path";

let s3Client = mockClient(S3Client);
const mockRecord = {
  s3: {
    object: {
      key: "uploaded/file.csv",
    },
    bucket: {
      name: "bucket",
    },
  },
} as S3EventRecord;
describe("importProductsParser", () => {
  beforeEach(() => {
    s3Client.reset();
    s3Client.on(GetObjectCommand).resolves({
      Body: sdkStreamMixin(createReadStream(join(__dirname, "example.csv"))),
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should parse incoming csv", async () => {
    const lines = [];
    jest.spyOn(console, "log").mockImplementation((data) => {
      lines.push(data);
    });
    const moveSpy = jest.spyOn(handler, "moveToProcessed");
    const parseSpy = jest.spyOn(handler, "processFile");
    await handler.importProductsParser({ Records: [mockRecord] }, {});
    expect(moveSpy).toBeCalledTimes(1);
    expect(parseSpy).toBeCalledTimes(1);
    expect(lines).toHaveLength(20);
    expect(lines).toContainEqual({
      count: "12",
      description: "description 20",
      price: "75",
      title: "product 20",
      id: "20",
    });
  });
  it("should work with 2 incoming records", async () => {
    const lines = [];
    jest.spyOn(console, "log").mockImplementation((data) => {
      lines.push(data);
    });
    const moveSpy = jest.spyOn(handler, "moveToProcessed");
    const parseSpy = jest.spyOn(handler, "processFile");
    await handler.importProductsParser(
      { Records: [mockRecord, mockRecord] },
      {}
    );
    expect(moveSpy).toBeCalledTimes(2);
    expect(parseSpy).toBeCalledTimes(2);
  });
  it("should move file to processed", async () => {
    await handler.importProductsParser({ Records: [mockRecord] }, {});
    expect(s3Client).toHaveReceivedCommandWith(CopyObjectCommand, {
      Bucket: "bucket",
      CopySource: "bucket/uploaded/file.csv",
      Key: "processed/file.csv",
    });
    expect(s3Client).toHaveReceivedCommandWith(DeleteObjectCommand, {
      Bucket: "bucket",
      Key: "uploaded/file.csv",
    });
  });
});
