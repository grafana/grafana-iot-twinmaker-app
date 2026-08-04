---
description: Import and use the pre-built AWS IoT TwinMaker dashboards in Grafana, including the main dashboard and the alarm dashboard.
keywords:
  - grafana
  - aws iot twinmaker
  - twinmaker
  - dashboards
  - alarm dashboard
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Pre-built dashboards
title: AWS IoT TwinMaker pre-built dashboards
weight: 500
review_date: 2026-08-04
---

# AWS IoT TwinMaker pre-built dashboards

The AWS IoT TwinMaker data source ships with two dashboard templates you can import and adapt: a main dashboard and an alarm dashboard.

## Import a dashboard

![The Dashboards tab on the data source configuration page](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/DashboardTab.png)

To import a pre-built dashboard:

1. Open the AWS IoT TwinMaker data source configuration page and select the **Dashboards** tab.
1. Click **Import** next to the dashboard template you want to load.
1. Click the dashboard name to navigate to the imported dashboard.
1. Edit the dashboard as desired, then click **Save As** to save your own copy.

Each dashboard starts with a collapsible **Introduction** row that explains how to resolve the initial panel errors, which come from template variables that don't have values yet.

## Main dashboard

The main dashboard demonstrates the full set of TwinMaker components working together. It's built for the Cookie Factory example workspace, which you can set up from the [AWS IoT TwinMaker samples](https://github.com/aws-samples/aws-iot-twinmaker-samples) GitHub repository. The dashboard includes:

- A **Scene Viewer** panel that loads a scene and queries alarm data for its tags.
- An **Alarm List** table backed by a **Get Alarms** query, with the register links transformation attached.
- A **Selected Alarm History** state timeline and a **Selected Time Series History** panel, driven by the `sel_entity` and `sel_comp` variables.
- A **Video Player** panel driven by the `sel_video_entity`, `sel_video_comp`, and `kvs_stream_name` variables.

## Alarm dashboard

![The alarm dashboard with a scene viewer, alarm list, and alarm history](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/AlarmDashboard.png)

The alarm dashboard focuses on monitoring and inspecting alarms in your workspace.

### Prerequisites

Before using the alarm dashboard, ensure your workspace has:

- Entities with a component that inherits its type from the base alarm type `com.amazon.iottwinmaker.alarm.basic`.
- A scene in your workspace.
- Tags in the scene with a data binding to alarm components.

### Set up the alarm dashboard

The dashboard defines the `sel_entity` and `sel_comp` template variables to manage selections and fill in the query that shows the history of the alarm property `alarm_status`. It also defines an `active_camera` variable that stores the selected camera view from the Scene Viewer.

To set up the dashboard:

1. Edit the Scene Viewer panel: select your scene in the panel options and your alarm component type ID in the query editor.
1. Select a time range where your alarms have data.
1. Select an alarm to populate the history panel. The history panel shows an error until the `sel_entity` and `sel_comp` variables have values. Set them by either:
   - Clicking an alarm in the alarm list, or
   - Clicking a tag in the scene that has a data binding with an alarm property.

### How the dashboard sets template variables

The dashboard sets `sel_entity` and `sel_comp` dynamically in two ways:

- **Alarm list:** The table panel has a transformation attached named **Register links with AWS IoT TwinMaker**. It defines rules that set template variable values from fields of the query response when you click a row. Refer to [Register links transformation](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/template-variables/#register-links-transformation).
- **Scene Viewer:** The panel options specify which template variables store the selected entity ID and component name when a tag is clicked in the scene.

## Example dashboard in Grafana Play

Interact with a demo TwinMaker dashboard in [Grafana Play](https://play.grafana.org/d/y1FGfj57z/aws-iot-twinmaker-mixer-alarm-dashboard?orgId=1). The dashboard monitors a cookie factory by visualizing a 3D factory, listing alarms, graphing temperature sensor history, and playing a video camera stream.
