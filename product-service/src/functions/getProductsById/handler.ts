import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { queryProductById } from "../../../src/repository/products";

import schema from "./schema";

export const getProductsById: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const productId = event.pathParameters.productId;
  const result = await queryProductById(productId);
  if (result) {
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } else {
    return {
      statusCode: 404,
      body: "Product not found",
    };
  }
};

export const main = middyfy(getProductsById);
