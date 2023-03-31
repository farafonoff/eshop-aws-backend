# Creating service

yarn create-service <service-name>

# authorization_service/.env file contents example

farafonoff=TEST_PASSWORD

# deployment order

1. authorization service
2. products service
3. import service (depends on authorization lambda and products import queue)
