import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { getAllProducts } from "../../../src/repository/products";

import schema from "./schema";

export const getProductsList: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (_event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(await getAllProducts()),
  };
};

export const main = middyfy(getProductsList);
