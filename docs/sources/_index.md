---
aliases:
  - /docs/plugins/grafana-iot-twinmaker-app/
description: Use the AWS IoT TwinMaker app for Grafana to monitor industrial operations with 3D digital twin scenes, video playback, alarms, and pre-built dashboards.
keywords:
  - grafana
  - aws iot twinmaker
  - twinmaker
  - digital twin
  - iot
  - aws
  - amazon
  - app plugin
  - data source
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: AWS IoT TwinMaker
title: AWS IoT TwinMaker app
weight: 10
review_date: 2026-08-05
---

# AWS IoT TwinMaker app

The AWS IoT TwinMaker app for Grafana lets you build end-user 3D digital twin applications to monitor industrial operations. [AWS IoT TwinMaker](https://aws.amazon.com/iot-twinmaker/) is a service that helps developers create digital replicas of real-world systems, such as factories and industrial equipment, so you can optimize operations using digital twins.

![An AWS IoT TwinMaker dashboard with a 3D scene, alarm list, and video player](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/TwinMakerDashboard.png)

{{< admonition type="note" >}}
Use Grafana version 10.4.0 or later with the AWS IoT TwinMaker app.
{{< /admonition >}}

## What's included

AWS IoT TwinMaker is an app plugin, not a standalone data source plugin. Installing the app adds all of the following components to your Grafana instance:

- **AWS IoT TwinMaker data source:** Queries entities, components, properties, and alarms from your TwinMaker workspace.
- **Scene Viewer panel:** Renders an interactive 3D scene from your workspace with data-bound tags.
- **Video Player panel:** Plays video from Amazon Kinesis Video Streams, including streams associated with TwinMaker video components.
- **Alarm Configuration panel:** Views and edits alarm thresholds and notification settings.
- **Query Editor panel:** Embeds the AWS IoT TwinMaker query builder to explore workspace data.
- **Pre-built dashboards:** A main dashboard and an alarm dashboard you can import from the data source configuration page.
- **Register links transformation:** Sets dashboard template variables when you click a row in a table panel.

The app is enabled automatically after installation, and the data source appears in the **Industrial & IoT** section when you add a new connection.

## Supported features

The following table lists the features available with the bundled data source.

| Feature | Supported |
| --- | --- |
| Metrics | Yes |
| Logs | No |
| Traces | No |
| Alerting | Yes |
| Annotations | No |
| Template variables | Yes |
| Streaming | Yes |
| Private data source connect (PDC) | Yes |

## Requirements

To use the AWS IoT TwinMaker app, you need:

- A Grafana instance running version 10.4.0 or later.
- An AWS account with an AWS IoT TwinMaker workspace.
- An [IAM role for your TwinMaker dashboard](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/dashboard-IAM-role.html) that the data source can assume. The data source requires this role's Amazon Resource Name.

## Get started

The following pages help you get started with the AWS IoT TwinMaker app.

- [Configure the AWS IoT TwinMaker app and data source](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/configure/)
- [AWS IoT TwinMaker query editor](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/query-editor/)
- [AWS IoT TwinMaker panels](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/panels/)
- [Template variables](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/template-variables/)
- [Alerting](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/alerting/)
- [Pre-built dashboards](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/dashboards/)
- [Troubleshooting](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/troubleshooting/)

## Additional features

After you configure the data source, you can use the following Grafana features.

- Use [Explore](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/explore/) to query data without building a dashboard.
- Add [Transformations](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/panels-visualizations/query-transform-data/transform-data/) to manipulate query results.
- Set up [Alerting](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/alerting/) rules to get notified when data changes.
- Configure and use [Template variables](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/) to build dynamic dashboards.

## Example dashboard

Interact with a demo TwinMaker dashboard in Grafana Play. The dashboard monitors a cookie factory by visualizing a 3D factory, listing alarms, graphing temperature sensor history, and playing a video camera stream.

- [Cookie Factory Demo](https://play.grafana.org/d/y1FGfj57z/aws-iot-twinmaker-mixer-alarm-dashboard?orgId=1)

## Plugin updates

Always ensure that your plugin version is up-to-date so you have access to all current features and improvements. Navigate to **Plugins and data** > **Plugins** to check for updates. Grafana recommends upgrading to the latest Grafana version, and this applies to plugins as well.

{{< admonition type="note" >}}
Plugins are automatically updated in Grafana Cloud.
{{< /admonition >}}

## Related resources

- [AWS IoT TwinMaker documentation](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/what-is-twinmaker.html)
- [Plugin repository on GitHub](https://github.com/grafana/grafana-iot-twinmaker-app), where you can request new features, report issues, or contribute code
- [Grafana community forum](https://community.grafana.com/)
