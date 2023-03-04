import { middyfy } from "@libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import { getAllAvailableProducts } from "../../repository/products";

export const getProductsListAvailable = async (event: APIGatewayEvent) => {
  console.log(`Invoke getProductsListAvailable`);
  const count = Number(event?.pathParameters?.productId || 1);
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(await getAllAvailableProducts(count)),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: "Internal error (logged)",
    };
  }
};

export const main = middyfy(getProductsListAvailable);
