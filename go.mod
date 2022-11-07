module github.com/grafana/grafana-iot-twinmaker-app

go 1.16

replace github.com/aws/aws-sdk-go => ./aws-sdk-go

require (
	github.com/aws/aws-sdk-go v1.44.112
	github.com/google/uuid v1.3.0
	github.com/gorilla/mux v1.8.0
	github.com/grafana/grafana-aws-sdk v0.11.0
	github.com/grafana/grafana-plugin-sdk-go v0.140.0
	github.com/magefile/mage v1.13.0
	github.com/patrickmn/go-cache v2.1.0+incompatible
	github.com/stretchr/testify v1.7.2
)
