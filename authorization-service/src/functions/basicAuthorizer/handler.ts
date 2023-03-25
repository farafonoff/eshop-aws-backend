import { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";

const basicAuthorizer = async (event: APIGatewayRequestAuthorizerEventV2) => {
  console.log(event);
  try {
    const authHeader = event.headers["Authorization"];
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }
    if (!authHeader.startsWith("Basic ")) {
      throw new Error("Basic Authorization header required");
    }

    const token = authHeader.split(" ")[1];

    const decodedCredentials = Buffer.from(token, "base64").toString();

    const [username, password] = decodedCredentials.split(":");

    return {
      principalId: username,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: event.routeArn,
          },
        ],
      },
    };
  } catch (error) {
    return {
      principalId: "denied_demo",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: event.routeArn,
          },
        ],
      },
    };
  }
};

export const main = basicAuthorizer;
