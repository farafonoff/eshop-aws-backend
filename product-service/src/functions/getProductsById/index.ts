//import schema from "./schema";
import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: "get",
        path: "/products/{productId}",
        responseData: {
          200: {
            description: "Product item",
            bodyType: "Product",
          },
          404: {
            description: "Product not found",
          },
        },
        /*request: {
          schemas: {
            "application/json": schema,
          },
        },*/
      },
    },
  ],
};
