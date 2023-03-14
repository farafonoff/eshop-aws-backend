import { TABLE_NAME } from "../src/constants";
export const ProductsTable = {
  ProductsTable: {
    Type: "AWS::DynamoDB::Table",
    Properties: {
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
        {
          AttributeName: "count",
          AttributeType: "N",
        },
        {
          AttributeName: "price",
          AttributeType: "N",
        },
      ],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
        {
          AttributeName: "price",
          KeyType: "RANGE",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 2,
        WriteCapacityUnits: 2,
      },
      LocalSecondaryIndexes: [
        {
          IndexName: "AvailableProducts",
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
            {
              AttributeName: "count",
              KeyType: "RANGE",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
        },
      ],
    },
  },
};
