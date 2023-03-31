import type { AWS } from "@serverless/typescript";
import {
  getProductsById,
  getProductsList,
  postProduct,
  getProductsListAvailable,
  catalogBatchProcess,
} from "@functions/index";
import { REGION } from "./src/constants";
import { ProductsTable } from "./resources/dynamodb";
import { ImportQueue } from "./resources/sqs";
import { Notifications } from "./resources/notifications";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  plugins: ["serverless-auto-swagger", "serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    region: REGION,
    architecture: "arm64",
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
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["dynamodb:*"],
        Resource: [
          { "Fn::GetAtt": ["ProductsTable", "Arn"] },
          {
            "Fn::Join": [
              "",
              [{ "Fn::GetAtt": ["ProductsTable", "Arn"] }, "/index/*"],
            ],
          },
        ],
      },
      {
        Effect: "Allow",
        Action: ["sns:Publish"],
        Resource: [{ "Fn::GetAtt": ["Notifications", "TopicArn"] }],
      },
    ],
  },
  // import the function via paths
  functions: {
    getProductsList,
    getProductsById,
    postProduct,
    getProductsListAvailable,
    catalogBatchProcess,
  },
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
    autoswagger: {
      title: "products service",
      apiType: "httpApi",
    },
  },
  resources: {
    Resources: {
      ...ProductsTable,
      ...ImportQueue,
      ...Notifications,
    },
  },
};

module.exports = serverlessConfiguration;
