import mockData from "./mockResponse.json";

export async function getAllProducts() {
  return mockData;
}

export async function queryProductById(productId: string) {
  return mockData.find((item) => item.id === productId);
}
