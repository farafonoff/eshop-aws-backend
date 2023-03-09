import { middyfy } from "@libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import { queryProductById } from "../../../src/repository/products";

export const getProductsById = async (event: APIGatewayEvent) => {
  const productId = event.pathParameters.productId;
  console.log(`Invoke getProductById with ${productId}`);
  try {
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
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: "Internal error (logged)",
    };
  }
};

export const main = middyfy(getProductsById);
