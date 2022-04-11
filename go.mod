module github.com/grafana/grafana-iot-twinmaker-app

go 1.16

replace github.com/aws/aws-sdk-go => ./aws-sdk-go

require (
	github.com/aws/aws-sdk-go v1.42.16
	github.com/gorilla/mux v1.7.3
	github.com/grafana/grafana-aws-sdk v0.7.1-0.20210726232133-e3ac285039ee
	github.com/grafana/grafana-plugin-sdk-go v0.114.1-0.20220211221804-0b479b3788e2
	github.com/patrickmn/go-cache v2.1.0+incompatible
	github.com/stretchr/testify v1.7.0
	golang.org/x/net v0.0.0-20220127200216-cd36cc0744dd // indirect
)
