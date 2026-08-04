---
description: Troubleshoot common AWS IoT TwinMaker app and data source issues in Grafana, including configuration, connection, scene, and video errors.
keywords:
  - grafana
  - aws iot twinmaker
  - twinmaker
  - troubleshooting
  - errors
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Troubleshooting
title: Troubleshoot AWS IoT TwinMaker issues
weight: 600
review_date: 2026-08-04
---

# Troubleshoot AWS IoT TwinMaker issues

This document provides solutions to common issues you may encounter when configuring or using the AWS IoT TwinMaker app. For configuration instructions, refer to [Configure the AWS IoT TwinMaker app and data source](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/configure/).

## Configuration errors

These errors occur on the data source configuration page, and usually involve the workspace selection or the IAM role's Amazon Resource Name.

### "Missing WorkspaceID configuration"

**Symptoms:**

- **Save & test** fails with `Missing WorkspaceID configuration`.

**Cause:** The data source doesn't have a workspace selected. This error is expected on the first save, before you select a workspace.

**Solutions:**

1. Click **Save & test** to save the connection details.
1. Open the **Workspace** drop-down in the **Twinmaker Settings** section and select your workspace.
1. Click **Save & test** again.

<!-- vale Grafana.AmazonProductNames = NO -->

### "Assume Role ARN is required"

<!-- vale Grafana.AmazonProductNames = YES -->

**Symptoms:**

- **Save & test** fails with `Assume Role ARN is required`.
- The configuration page shows an error alert titled **Assume Role ARN**.

**Cause:** The data source requires an IAM role to narrow its permission scope, because the resolved credentials are also used in the browser by the Scene Viewer and Video Player panels.

**Solution:** Create an [IAM role for your TwinMaker dashboard](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/dashboard-IAM-role.html) and enter its ARN in the **Assume Role ARN** field.

<!-- vale Grafana.Spelling = NO -->
<!-- vale Grafana.WordList = NO -->

### "Save the datasource first to load workspaces"

<!-- vale Grafana.WordList = YES -->
<!-- vale Grafana.Spelling = YES -->

**Symptoms:**

- The **Workspace** drop-down shows this message instead of your workspaces.

**Cause:** The workspace list is fetched through the saved data source, so unsaved connection details can't be used.

**Solution:** Click **Save & test**, then reopen the **Workspace** drop-down. If the drop-down shows `Error listing workspaces`, verify your credentials, Region, and IAM role permissions include `iottwinmaker:ListWorkspaces`.

## Connection errors

These errors occur when Grafana can't reach AWS endpoints.

### Connection timeouts from Grafana Cloud

**Symptoms:**

- **Save & test** times out or fails with network errors on a Grafana Cloud stack.

**Possible causes and solutions:**

| Cause | Solution |
| --- | --- |
| AWS endpoints are only reachable from a private network | Configure [private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/) and enable **Secure Socks Proxy** on the data source. |
| The PDC agent isn't running or can't reach AWS | Check the PDC agent logs and verify outbound HTTPS access to the AWS IoT TwinMaker endpoints for your Region. |
| Wrong Region selected | Verify the **Default Region** matches the Region of your TwinMaker workspace. |

### Custom endpoint conflicts

**Symptoms:**

- The connection fails when both a custom endpoint and an **Assume Role ARN** are configured.

**Cause:** You can't currently set an **Assume Role ARN** and a custom **Endpoint** together.

**Solution:** Remove the custom endpoint unless you're an AWS developer testing against a non-production endpoint.

## Scene Viewer issues

These issues occur in the Scene Viewer panel.

### Tags don't change icons based on data

**Symptoms:**

- The scene loads, but tag icons don't reflect property values.

**Possible causes and solutions:**

| Cause | Solution |
| --- | --- |
| No data is provided for the scene's data bindings | Add a query for each data binding, or switch on **Enable auto query** in the panel options. |
| Query order passes oldest data first | Set **Order** to `DESC` so the panel matches the most recent value against tag rules. |
| The scene and queries use different workspaces | Select the same TwinMaker data source in the panel options and in the query editor. |

### Scene doesn't load

**Symptoms:**

- The panel stays blank or shows a loading error.

**Solutions:**

1. Verify the selected data source and scene belong to the same workspace.
1. Verify the IAM role grants read access to the Amazon S3 bucket for the workspace, where scene assets are stored.
1. Check the browser console for errors from blocked network requests to Amazon S3.

## Video Player issues

These issues occur in the Video Player panel.

### Video not available

**Symptoms:**

- The player shows an error screen that video isn't available for the selected time.

**Possible causes and solutions:**

| Cause | Solution |
| --- | --- |
| The selected time isn't highlighted blue in the scrubber | Select a time range where video is available. |
| Video is on the edge connector but not uploaded | Select a time range and click **Request Video**, then refresh the dashboard after roughly 10 seconds. |
| The time range exceeds 24 hours in `ON_DEMAND` mode | Narrow the dashboard time range to 24 hours or less. |
| No live video is being produced in `LIVE` mode | Verify the camera is streaming to Amazon Kinesis Video Streams. |

## Enable debug logging

To capture detailed error information for troubleshooting on self-managed Grafana:

1. Set the Grafana log level to `debug` in the configuration file:

   ```ini
   [log]
   level = debug
   ```

1. Review the logs for entries from the `grafana-iot-twinmaker-datasource` backend plugin.
1. Reset the log level to `info` after troubleshooting to avoid excessive log volume.

## Get additional help

If you've tried these solutions and still encounter issues:

1. Search the [Grafana community forum](https://community.grafana.com/) for similar issues.
1. Review the [plugin's GitHub issues](https://github.com/grafana/grafana-iot-twinmaker-app/issues) for known bugs, or open a new issue.
1. Consult the [AWS IoT TwinMaker documentation](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/what-is-twinmaker.html) for service-specific guidance.
1. When reporting issues, include your Grafana version, plugin version, error messages with sensitive information redacted, and steps to reproduce.
