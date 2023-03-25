import type { AWS } from "@serverless/typescript";

import importProductsFile from "@functions/importProductsFile";
import importFileParser from "@functions/importFileParser";

import { REGION, UPLOAD_BUCKET_NAME } from "./constants";

const serverlessConfiguration: AWS = {
  service: "import-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    region: REGION,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
    httpApi: {
      cors: {
        allowedOrigins: [
          "http://localhost:5555",
          "http://db27n60o60d5z.cloudfront.net",
          "https://db27n60o60d5z.cloudfront.net",
        ],
        allowedMethods: ["GET", "POST"],
        allowCredentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      },
      authorizers: {
        myBasicAuthorizer: {
          type: "request",
          functionArn:
            "${cf:authorization-service-${sls:stage}.BasicAuthorizerLambdaFunctionQualifiedArn}",
        },
      },
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["s3:*"],
        Resource: `arn:aws:s3:::${UPLOAD_BUCKET_NAME}/*`,
      },
      {
        Effect: "Allow",
        Action: ["s3:*"],
        Resource: `arn:aws:s3:::${UPLOAD_BUCKET_NAME}`,
      },
      {
        Effect: "Allow",
        Action: [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
        ],
        Resource: {
          "Fn::Join": [
            ":",
            [
              "arn",
              "aws",
              "ssm",
              { Ref: "AWS::Region" },
              { Ref: "AWS::AccountId" },
              "parameter/CatalogItemsQueue",
            ],
          ],
        },
      },
      {
        Effect: "Allow",
        Action: ["sqs:*"],
        Resource: "*",
      },
    ],
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node18",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      S3BucketFarafonoffimportserviceupload: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: UPLOAD_BUCKET_NAME,
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders: ["*"],
                AllowedMethods: ["PUT"],
                AllowedOrigins: ["*"],
                ExposedHeaders: [],
                Id: "Allow Upload",
                MaxAge: 3600,
              },
            ],
          },
        },
      },
      UploadBucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          Bucket: {
            Ref: "S3BucketFarafonoffimportserviceupload",
          },
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Action: "s3:PutObject",
                Effect: "Allow",
                Principal: "*",
                Resource: {
                  "Fn::Join": [
                    "",
                    [
                      "arn:aws:s3:::",
                      {
                        Ref: "S3BucketFarafonoffimportserviceupload",
                      },
                      "/*",
                    ],
                  ],
                },
              },
            ],
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
