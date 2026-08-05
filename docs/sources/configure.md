---
description: Configure the AWS IoT TwinMaker app and data source in Grafana, including authentication, write permissions, private data source connect, provisioning, and Terraform.
keywords:
  - grafana
  - aws iot twinmaker
  - twinmaker
  - configure
  - authentication
  - iam
  - assume role
  - private data source connect
  - provisioning
  - terraform
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Configure
title: Configure the AWS IoT TwinMaker app and data source
weight: 100
review_date: 2026-08-05
---

# Configure the AWS IoT TwinMaker app and data source

This document explains how to install the AWS IoT TwinMaker app and configure the bundled data source.

## Before you begin

Before you configure the data source, ensure you have:

- **Grafana permissions:** The `Organization administrator` role. Only organization administrators can install plugins and add data sources.
- **An AWS account** with an AWS IoT TwinMaker workspace.
- **An IAM role for your workspace:** Follow the [AWS IoT TwinMaker dashboard IAM role guide](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/dashboard-IAM-role.html) to create policies and a role with minimal permissions for your TwinMaker workspace. The data source requires this role's Amazon Resource Name.

## Key concepts

If you're new to AWS, these terms are used throughout the configuration.

| Term | Description |
| --- | --- |
| **IAM policy** | A JSON document attached to an identity that grants AWS API permissions. |
| **Assume role** | An AWS mechanism that lets one identity take on temporary credentials for another IAM role, often used to narrow permissions or enable cross-account access. |
| **External ID** | An optional identifier that a role in another account requires when you assume it, which adds a layer of protection for cross-account access. |
| **Workspace** | The top-level AWS IoT TwinMaker container for your entities, components, and scenes. |
| **Region** | The AWS Region, such as `us-east-1`, where your TwinMaker workspace is located. |
| **Private data source connect (PDC)** | A Grafana Cloud feature that connects your Grafana Cloud stack to data sources in a private network through a SOCKS proxy. |

## Install the app plugin

To install the AWS IoT TwinMaker app:

1. Navigate to **Administration** > **Plugins and data** > **Plugins**.
1. Search for **AWS IoT TwinMaker App**.
1. Click **Install**.

The app is enabled automatically after installation, which registers the data source, the four panels, and the transformation. On self-managed Grafana, you can also install the plugin with the CLI:

```bash
grafana cli plugins install grafana-iot-twinmaker-app
```

Restart Grafana after a CLI installation.

## Add the data source

To add the AWS IoT TwinMaker data source:

1. Click **Connections** in the left-side menu.
1. Click **Add new connection**.
1. Type `AWS IoT TwinMaker` in the search bar. The data source is listed in the **Industrial & IoT** section.
1. Select **AWS IoT TwinMaker**.
1. Click **Add new data source**.

## Configure connection details

The **Connection Details** section uses the standard Grafana AWS authentication settings. For details about each authentication provider, refer to [AWS authentication](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/datasources/aws-cloudwatch/aws-authentication/).

| Setting | Description |
| --- | --- |
| **Authentication Provider** | How the data source resolves base AWS credentials. Options include **AWS SDK Default**, **Credentials file**, and **Access & secret key**. On Grafana Cloud, **Grafana Assume Role** is also available where it's enabled. The available options are controlled by the `allowed_auth_providers` server setting on self-managed Grafana. |
| **Credentials Profile Name** | The profile in your AWS credentials file. Shown when you select **Credentials file**. |
| **Access Key ID** and **Secret Access Key** | Static credentials stored encrypted in the Grafana database. Shown when you select **Access & secret key**. |
| **Assume Role ARN** | Required. The Amazon Resource Name of the IAM role you created for your TwinMaker workspace. The configuration page shows an error until you provide it. |
| **External ID** | Optional. Provide an external ID if the role is assumed from a separate AWS account. |
| **Endpoint** | Optional. A custom endpoint for the AWS IoT TwinMaker service, typically used by AWS developers for testing. You can't set an **Assume Role ARN** and a custom endpoint together. |
| **Default Region** | The AWS Region of your workspace. Defaults to `us-east-1`. Supported Regions include `ap-south-1`, `ap-northeast-1`, `ap-northeast-2`, `ap-southeast-1`, `ap-southeast-2`, `eu-central-1`, `eu-west-1`, `us-east-1`, `us-west-2`, `us-gov-west-1`, and `cn-north-1`. |

### Why an assume role is required

The credentials resolved from the authentication provider are used for AWS calls made by the backend plugin. The same credentials are also used in the browser by the Scene Viewer and Video Player panels, so the plugin assumes the role you provide with an inline session policy to ensure a narrow permission scope. Only permissions that intersect with the inline policy are used.

{{< admonition type="caution" >}}
If Grafana runs on Amazon EC2 and you use **AWS SDK Default** to resolve credentials from the instance IAM role, you must still set an **Assume Role ARN** with scoped-down permissions. Exposing the instance role's credentials to the browser is a security risk. Refer to the [AWS AssumeRole documentation](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) for information about setting up permissions to assume roles.
{{< /admonition >}}

## Configure TwinMaker settings

The **Twinmaker Settings** section selects the workspace and optionally enables write access for the Alarm Configuration panel.

| Setting | Description |
| --- | --- |
| **Workspace** | The TwinMaker workspace this data source queries. Save the data source first, then open the drop-down to load your workspaces. You can also type a custom workspace ID. |
| **Define write permissions for Alarm Configuration Panel** | Toggle this on to configure a separate write role for editing alarms. |
| **Assume Role ARN Write** | The Amazon Resource Name of a role to assume when writing property values, such as alarm thresholds, in AWS IoT TwinMaker. Shown when write permissions are enabled. |

To configure the workspace:

1. Click **Save & test**. The first save returns the error `Missing WorkspaceID configuration`, which is expected because you haven't selected a workspace yet.
1. Open the **Workspace** drop-down and select your workspace. Any query that uses this data source has access to resources within the selected workspace.
1. Click **Save & test** again.

## Verify the connection

When the connection succeeds, **Save & test** returns the message `TwinMaker datasource successfully configured` followed by your workspace name. If the health check fails, refer to [Troubleshooting](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/troubleshooting/) for common errors such as `Assume Role ARN is required`.

## Private data source connect

Private data source connect (PDC) lets Grafana Cloud reach AWS endpoints in a private network through a secure SOCKS proxy.

When PDC is enabled for your Grafana instance, the configuration page shows a **Secure Socks Proxy** section. Toggle **Enable Secure Socks Proxy** to route data source traffic through the PDC agent.

For setup instructions, refer to [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/) and [Configure Grafana private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/configure-pdc/).

## Provision the data source

You can define the data source in YAML files as part of the Grafana provisioning system. For more information, refer to [Provisioning Grafana data sources](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/administration/provisioning/#data-sources).

```yaml
apiVersion: 1

datasources:
  - name: AWS IoT TwinMaker
    type: grafana-iot-twinmaker-datasource
    jsonData:
      authType: default
      defaultRegion: us-east-1
      assumeRoleArn: arn:aws:iam::<ACCOUNT_ID>:role/<DASHBOARD_ROLE>
      workspaceId: <WORKSPACE_ID>
      # Optional settings:
      # externalId: <EXTERNAL_ID>
      # assumeRoleArnWriter: arn:aws:iam::<ACCOUNT_ID>:role/<WRITE_ROLE>
      # enableSecureSocksProxy: true
```

To provision static credentials instead of the default SDK credential chain, set `authType: keys` and provide the keys in `secureJsonData`:

```yaml
    secureJsonData:
      accessKey: <ACCESS_KEY_ID>
      secretKey: <SECRET_ACCESS_KEY>
```

## Provision with Terraform

You can use the [Grafana Terraform provider](https://registry.terraform.io/providers/grafana/grafana/latest/docs) to provision the AWS IoT TwinMaker data source as code. The following examples use the `grafana_data_source` resource.

### Assume role with Terraform

This example uses the default SDK credential chain and assumes the IAM role you created for your TwinMaker workspace.

```hcl
resource "grafana_data_source" "twinmaker" {
  type = "grafana-iot-twinmaker-datasource"
  name = "AWS IoT TwinMaker"

  json_data_encoded = jsonencode({
    authType      = "default"
    defaultRegion = "us-east-1"
    assumeRoleArn = "arn:aws:iam::123456789012:role/grafana-twinmaker-dashboard"
    workspaceId   = var.twinmaker_workspace_id
  })
}
```

To enable writes for the Alarm Configuration panel or route traffic through private data source connect, add the optional keys to `json_data_encoded`:

```hcl
  json_data_encoded = jsonencode({
    authType               = "default"
    defaultRegion          = "us-east-1"
    assumeRoleArn          = "arn:aws:iam::123456789012:role/grafana-twinmaker-dashboard"
    workspaceId            = var.twinmaker_workspace_id
    externalId             = var.external_id
    assumeRoleArnWriter    = "arn:aws:iam::123456789012:role/grafana-twinmaker-writer"
    enableSecureSocksProxy = true
  })
```

### Access and secret key with Terraform

This example uses static credentials, which Grafana stores encrypted in secure JSON data.

```hcl
resource "grafana_data_source" "twinmaker" {
  type = "grafana-iot-twinmaker-datasource"
  name = "AWS IoT TwinMaker"

  json_data_encoded = jsonencode({
    authType      = "keys"
    defaultRegion = "us-east-1"
    assumeRoleArn = "arn:aws:iam::123456789012:role/grafana-twinmaker-dashboard"
    workspaceId   = var.twinmaker_workspace_id
  })

  secure_json_data_encoded = jsonencode({
    accessKey = var.aws_access_key
    secretKey = var.aws_secret_key
  })
}
```

For more information, refer to the [`grafana_data_source` resource](https://registry.terraform.io/providers/grafana/grafana/latest/docs/resources/data_source) in the Grafana Terraform provider documentation.

## Next steps

- [Build queries with the query editor](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/query-editor/)
- [Set up the Scene Viewer and other panels](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/panels/)
- [Import the pre-built dashboards](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/dashboards/)
