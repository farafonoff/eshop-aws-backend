import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { putProduct } from "../../repository/products";
import { v4 as uuidv4 } from "uuid";
import schema from "./schema";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import httpErrorHandler from "@middy/http-error-handler";

export const postProduct = async (event) => {
  console.log(`Invoke postProduct with body ${event.body}`);
  const newId = uuidv4();
  const item = {
    ...event.body,
    id: newId,
  };
  try {
    await putProduct(item);
    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: "Internal error (logged)",
    };
  }
};

const requestSchema = transpileSchema(schema, {
  verbose: true,
});
export const main = middyfy(postProduct)
  .use(middyJsonBodyParser())
  .use(validator({ eventSchema: requestSchema }))
  .use(httpErrorHandler());
