import { middyfy } from "@libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import { getAllProducts } from "../../../src/repository/products";

export const getProductsList = async (_event: APIGatewayEvent) => {
  console.log(`Invoke getProductsList`);
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(await getAllProducts()),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: "Internal error (logged)",
    };
  }
};

export const main = middyfy(getProductsList);
