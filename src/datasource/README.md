# AWS IoT TwinMaker Datasource

<img src="https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/docs/DatasourceConfig.png" />

1. Go to Configuration → Datasources and click “Add data source”

2. Find the AWS IoT TwinMaker Datasource under the “Industrial & IoT” section

3. On the datasource settings page choose your [authentication provider](https://grafana.com/docs/grafana/next/datasources/aws-cloudwatch/aws-authentication/)

   1. The credentials resolved from the auth provider are used to make AWS calls for queries in the backend plugin
   2. The same credentials are used on the browser for our custom panels, so make sure your permissions are scoped down
   3. EC2 users: you can use “AWS SDK Default” to resolve credentials from your instance IAM role. It is a security risk to expose these credentials on your browser so you MUST set an additional IAM role with scoped down permissions. See [here](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) for information on setting up permissions to assume roles.

4. We recommend to set an Assume Role ARN for any environment Grafana is running in. You can create an IAM role and policies for your TwinMaker workspace.

   a. This plugin assumes the role provided with an inline session policy to ensure the desired permission scope is used on the browser. We will only use permissions that intersect with the inline policy.

5. (Optional) Set an External ID if your role is assumed from a separate account

6. (Optional) AWS developers may use a custom endpoint for testing

   a. Note: You cannot currently set an Assume Role ARN and a custom endpoint together

7. Select your region

8. Enter your TwinMaker workspace ID. Any query that uses this datasource instance will have access to resources within the workspace.

9. Click “Save & test”
