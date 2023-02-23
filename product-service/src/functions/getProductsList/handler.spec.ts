import { APIGatewayProxyResult } from "aws-lambda";
import { getProductsList } from "./handler";

describe("getProductsList", () => {
  it("should return products", async () => {
    const mockRequest = {};
    const result = (await getProductsList(
      mockRequest as any,
      null,
      null
    )) as APIGatewayProxyResult;
    expect(result.statusCode).toEqual(200);
    expect(result.body).toBeTruthy();
  });
});
