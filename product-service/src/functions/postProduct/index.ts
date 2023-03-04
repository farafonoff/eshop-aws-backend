//import schema from "./schema";
import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: "post",
        path: "/products",
        responseData: {
          200: {
            description: "Freshly inserted product",
            bodyType: "Product",
          },
        },
        bodyType: "CreateProductRequest",
      },
    },
  ],
};
