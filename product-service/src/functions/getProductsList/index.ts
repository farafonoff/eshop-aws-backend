import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: "get",
        path: "/products",
        responseData: {
          200: {
            description: "Products List",
            bodyType: "Products",
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
