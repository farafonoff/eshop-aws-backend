import { APIGatewayProxyResult } from "aws-lambda";
import { getProductsById } from "./handler";

describe("getProductById", () => {
  it("should return product for good id", async () => {
    const mockRequest = {
      pathParameters: { productId: "7567ec4b-b10c-48c5-9345-fc73c48a80a3" },
    };
    const result = (await getProductsById(
      mockRequest as any,
      null,
      null
    )) as APIGatewayProxyResult;
    expect(result.statusCode).toEqual(200);
    expect(result.body).toBeTruthy();
  });

  it("should return 404 for missing id", async () => {
    const mockRequest = {
      pathParameters: { productId: "missing" },
    };
    const result = (await getProductsById(
      mockRequest as any,
      null,
      null
    )) as APIGatewayProxyResult;
    expect(result.statusCode).toEqual(404);
  });
});
