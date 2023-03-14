export const ImportQueue = {
  CatalogItemsQueue: {
    Type: "AWS::SQS::Queue",
  },
  CatalogItemsQueuePath: {
    Type: "AWS::SSM::Parameter",
    Properties: {
      Name: "CatalogItemsQueue",
      Type: "String",
      Value: { "Fn::GetAtt": ["CatalogItemsQueue", "Arn"] },
    },
  },
};
