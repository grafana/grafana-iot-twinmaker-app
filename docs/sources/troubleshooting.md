---
description: Troubleshoot common AWS IoT TwinMaker app and data source issues in Grafana, including configuration, connection, scene, video, and alerting errors.
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
weight: 700
review_date: 2026-08-05
---

# Troubleshoot AWS IoT TwinMaker issues

This document provides solutions to common issues you may encounter when configuring or using the AWS IoT TwinMaker app. The sections follow the order in which you set up and use the app: configuration, connection, queries, panels, and alert rules. For configuration instructions, refer to [Configure the AWS IoT TwinMaker app and data source](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/configure/).

## Configuration errors

These errors occur on the data source configuration page, and usually involve the workspace selection or the IAM role's Amazon Resource Name.

<!-- vale Grafana.AmazonProductNames = NO -->

### "Assume Role ARN is required"

<!-- vale Grafana.AmazonProductNames = YES -->

**Symptoms:**

- **Save & test** fails with `Assume Role ARN is required`.
- The configuration page shows an error alert titled **Assume Role ARN**.

**Cause:** The data source requires an IAM role to narrow its permission scope, because the resolved credentials are also used in the browser by the Scene Viewer and Video Player panels.

**Solution:** Create an [IAM role for your TwinMaker dashboard](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/dashboard-IAM-role.html) and enter its ARN in the **Assume Role ARN** field.

### "Missing WorkspaceID configuration"

**Symptoms:**

- **Save & test** fails with `Missing WorkspaceID configuration`.

**Cause:** The data source doesn't have a workspace selected. This error is expected on the first save, before you select a workspace.

**Solutions:**

1. Click **Save & test** to save the connection details.
1. Open the **Workspace** drop-down in the **Twinmaker Settings** section and select your workspace.
1. Click **Save & test** again.

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

## Query errors

These errors occur in the query editor or when a panel runs a query.

### Query fails with a "missing" parameter error

**Symptoms:**

- The query fails with one of the following errors: `missing entity parameter`, `missing component parameter`, `missing property`, or `missing entity id & component type id - either one required`.

**Cause:** The selected query type requires a field that isn't set. For example, **Get Property Value History by Entity** requires an **Entity** and **Component Name**, and the history query types require at least one property in **Selected Properties**.

**Solution:** Set the required fields for the query type. Refer to [AWS IoT TwinMaker query editor](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/query-editor/) for the fields each query type requires.

### List queries fail with an "error loading" message

**Symptoms:**

- A query or a query editor drop-down fails with an error such as `error loading workspaces`, `error loading scenes`, `error loading entities`, or `error loading componentTypes`.

**Possible causes and solutions:**

| Cause | Solution |
| --- | --- |
| The IAM role doesn't grant the required read permissions | Verify the [IAM role for your TwinMaker dashboard](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/dashboard-IAM-role.html) grants the list and get actions for your workspace. |
| The Region doesn't match the workspace | Verify the **Default Region** in the data source configuration matches the Region of your TwinMaker workspace. |
| The workspace was deleted or renamed | Reopen the data source configuration, select a valid workspace, and click **Save & test**. |

## Scene Viewer issues

These issues occur in the Scene Viewer panel.

### Scene Viewer panel fails to render on Grafana v13

**Symptoms:**

- The Scene Viewer panel stops rendering after an upgrade to Grafana v13.0 or later, while other panels on the dashboard keep working.

**Cause:** Grafana v13.0 upgraded the core application from React 18 to React 19, and the Scene Viewer panel depends on React APIs that were removed in React 19. This is a [known breaking change in Grafana v13.0](https://grafana.com/docs/grafana/latest/whatsnew/whats-new-in-v13-0/), not a configuration problem.

**Solutions:**

- On self-managed Grafana, remain on Grafana v12.x until a compatible version of the app is released, then upgrade both together.
- On Grafana Cloud, where you can't roll back the Grafana version, track the status of a fix in the [React 19 compatibility issue](https://github.com/grafana/grafana-iot-twinmaker-app/issues/696) and update the app when a compatible release is available.

### Scene doesn't load

**Symptoms:**

- The panel stays blank or shows a loading error.

**Solutions:**

1. Verify the selected data source and scene belong to the same workspace.
1. Verify the IAM role grants read access to the Amazon S3 bucket for the workspace, where scene assets are stored.
1. Check the browser console for errors from blocked network requests to Amazon S3.

### Tags don't change icons based on data

**Symptoms:**

- The scene loads, but tag icons don't reflect property values.

**Possible causes and solutions:**

| Cause | Solution |
| --- | --- |
| No data is provided for the scene's data bindings | Add a query for each data binding, or switch on **Enable auto query** in the panel options. |
| Query order passes oldest data first | Set **Order** to `DESC` so the panel matches the most recent value against tag rules. |
| The scene and queries use different workspaces | Select the same TwinMaker data source in the panel options and in the query editor. |

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

## Alarm Configuration panel issues

These issues occur in the Alarm Configuration panel.

### Panel shows warnings instead of alarm details

**Symptoms:**

- The panel shows `TwinMaker Data Source Connected` followed by a `Warnings:` line instead of the alarm ID, threshold, and notifications.

**Possible causes and solutions:**

| Warning | Cause | Solution |
| --- | --- | --- |
| `No query to parse` | The panel has no query. | Add a query that selects the entity and its alarm component. |
| `Missing data` | The query returned no results. | Verify the entity and alarm component exist, and widen the dashboard time range to include data points. |
| `Frame had no length` | The query returned empty results for the time range. | Widen the dashboard time range to include data points. |
| `Unknown frame type` | The query results don't contain alarm fields. | Query the alarm component's properties: `alarm_status`, `alarm_threshold`, or `alarm_notification_recipients`. |

### Can't edit the alarm threshold

**Symptoms:**

<!-- vale Grafana.AmazonProductNames = NO -->
<!-- vale Grafana.Spelling = NO -->
<!-- vale Grafana.WordList = NO -->

- Saving a new threshold in the **Edit Alarm** dialog box has no effect, or the logs show `writer role not configured` or `assume role ARN Write is missing in datasource configuration`.

<!-- vale Grafana.WordList = YES -->
<!-- vale Grafana.Spelling = YES -->
<!-- vale Grafana.AmazonProductNames = YES -->

**Cause:** Alarm edits write to your workspace with the `BatchPutPropertyValues` API, which requires a separate write role that isn't configured on the data source.

**Solution:** In the data source configuration, switch on **Define write permissions for Alarm Configuration Panel** and enter the IAM role in the **Assume Role ARN Write** field. The role must grant the `iottwinmaker:BatchPutPropertyValues` action. Refer to [Configure the AWS IoT TwinMaker app and data source](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/configure/).

## Alert rule errors

These errors occur when you use the data source in alert rules.

### Alert rule fails to evaluate a query that works in a panel

**Symptoms:**

- A query returns data in a dashboard panel, but the same query fails with a data format error when you use it in an alert rule.

**Cause:** Alert conditions can only evaluate numeric data. Queries that return string values, such as a **Get Alarms** query or a property history query for a string property like `alarm_status`, can't be reduced to a number for the alert condition.

**Solution:** Create the alert rule against a numeric property instead, such as the sensor value that drives the alarm. Refer to [AWS IoT TwinMaker alerting](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/alerting/) for query guidelines and examples.

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

If you continue to experience issues after following this troubleshooting guide:

1. Check the [AWS IoT TwinMaker documentation](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/what-is-twinmaker.html) for service-specific guidance.
1. Review the [Grafana community forums](https://community.grafana.com/) for similar issues.
1. Review the [plugin's GitHub issues](https://github.com/grafana/grafana-iot-twinmaker-app/issues) for known bugs, or open a new issue.
1. Contact Grafana Support if you are a Cloud Pro, Cloud Contracted, or Enterprise user.
1. When reporting issues, include:

   - Grafana version
   - Plugin version
   - Error messages (redact sensitive information)
   - Steps to reproduce
   - Relevant configuration, such as the authentication provider, Region, and IAM role setup (redact account IDs, role identifiers, and other credentials)
