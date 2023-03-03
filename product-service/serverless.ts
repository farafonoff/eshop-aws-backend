import type { AWS } from "@serverless/typescript";
import { getProductsById, getProductsList } from "@functions/index";
import { REGION, TABLE_NAME } from "src/constants";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  plugins: ["serverless-auto-swagger", "serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
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
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["dynamodb:*"],
        Resource: [{ "Fn::GetAtt": ["ProductsTable", "Arn"] }],
      },
    ],
  },
  // import the function via paths
  functions: { getProductsList, getProductsById },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
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
      ProductsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: TABLE_NAME,
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 2,
            WriteCapacityUnits: 2,
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
