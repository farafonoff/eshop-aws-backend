export const ImportQueue = {
  CatalogItemsQueue: {
    Type: "AWS::SQS::Queue",
    Properties: {
      RedrivePolicy: {
        maxReceiveCount: 2,
        deadLetterTargetArn: {
          "Fn::GetAtt": ["CatalogItemsQueueDLQ", "Arn"],
        },
      },
    },
  },
  CatalogItemsQueueDLQ: {
    Type: "AWS::SQS::Queue",
  },
  CatalogItemsQueuePath: {
    Type: "AWS::SSM::Parameter",
    Properties: {
      Name: "CatalogItemsQueue",
      Type: "String",
      Value: { "Fn::GetAtt": ["CatalogItemsQueue", "QueueUrl"] },
    },
  },
};
