---
description: Use the AWS IoT TwinMaker panels in Grafana, including the Scene Viewer for 3D scenes, the Video Player, the Alarm Configuration panel, and the Query Editor panel.
keywords:
  - grafana
  - aws iot twinmaker
  - twinmaker
  - scene viewer
  - video player
  - alarm configuration
  - panels
  - 3d
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Panels
title: AWS IoT TwinMaker panels
weight: 300
review_date: 2026-08-20
---

# AWS IoT TwinMaker panels

The AWS IoT TwinMaker app includes four panel visualizations. This document explains how to set up and use each panel.

| Panel | Description |
| --- | --- |
| **Scene Viewer** | Renders an interactive 3D scene from your workspace with data-bound tags. |
| **Video Player** | Plays video from Amazon Kinesis Video Streams. |
| **Alarm Configuration** | Displays the configuration of a selected alarm and lets users edit the alarm threshold. |
| **Query Editor** | Embeds the AWS IoT TwinMaker query builder to explore workspace data. |

## Scene Viewer

The Scene Viewer panel renders a 3D scene from your TwinMaker workspace. Tags in the scene can change icons based on live property values, and clicking a tag sets dashboard template variables that other panels can use.

![The Scene Viewer panel showing an example scene of a cookie factory](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/SceneViewerPanel.png)

### Set up the Scene Viewer

![The edit panel page for the Scene Viewer](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/EditSceneViewer.png)

To set up your Scene Viewer panel, follow these steps. The numbers in the image correspond to the steps, and numbers 5.a and 5.b correspond to the two ways of providing data described after the steps.

1. Create a new panel on your dashboard, then search for and select **AWS IoT TwinMaker Scene Viewer** in the visualization list.
1. Select the same TwinMaker data source in the **Workspace** panel option and in the query editor. This ensures the data you query and the scene you load come from the same TwinMaker workspace.
1. Select a **Scene** from your workspace.
1. Select the template variables that store the entity ID and component name of the data bound to tags. When you select a tag in the scene, the Scene Viewer sets these variables automatically, so you can use them to dynamically configure queries on other panels.
1. Provide property values to the panel so tags can change icons based on data. There are two ways to provide the data, described in the following sections.

After configuring the panel, click **Apply** and save your dashboard.

### Add queries manually

To provide data with Grafana queries:

1. Add a **Get Property Value History by Entity** query to the panel for each data binding in your scene. The Scene Viewer only supports the **Get Property Value History by Component Type**, **Get Property Value History by Entity**, and **Get Alarms** query types.
1. Select your component type and property, and optionally a filter on the property value.
1. Set **Order** to `DESC` so data passes from most recent to oldest. The panel parses the data and takes the first value to match with a tag's rule. This assumes you composed your scene with rules that change tag icons based on data value thresholds.

### Enable auto query

Instead of adding queries manually, you can switch on the **Enable auto query** panel option. The Scene Viewer then automatically constructs queries for all data bindings in the scene and fetches the data. Any Grafana query added to the panel is ignored while auto query is enabled.

The **Query interval** option sets an interval in seconds for automatic data refresh. It defaults to `5` and only applies when the dashboard uses a relative time range.

### Panel options

| Option | Description |
| --- | --- |
| **Workspace** | The TwinMaker data source to load the scene from. |
| **Scene** | The scene in the workspace to render. |
| **Selected entity variable name** | The template variable that stores the entity ID of a clicked tag. |
| **Selected component variable name** | The template variable that stores the component name of a clicked tag. |
| **Selected property variable name** | The template variable that stores the property of a clicked tag. |
| **Active camera variable name** | The template variable that stores the active camera, so you can switch camera views defined in the scene. |
| **Enable auto query** | Automatically query all data bindings configured in the scene. Defaults to off. |
| **Query interval** | The auto-refresh interval in seconds when a relative time range is set. Defaults to `5`. |

### Interact with your scene

When your scene loads, you can navigate the 3D space with the following controls:

- **Click and drag:** Rotate around a fixed point.
- **Right-click and drag:** Pan on the 2D plane your camera is facing.
- **Click an object:** Select the object.
- **Click a tag:** Select the tag and set template variables on the dashboard.
- **Mouse scroll:** Zoom in and out.

The collapsible **Hierarchy** panel helps you find objects in your scene. It matches the hierarchy defined on the scene editor page in the AWS IoT TwinMaker console.

- Select a node in the hierarchy to move the camera to look toward the object.
- Select a tag node to move the camera and trigger a tag click.

<!-- vale Grafana.Spelling = NO -->

### Matterport scenes

The Scene Viewer supports scenes that include [Matterport](https://matterport.com/) spaces. Compose the Matterport integration in the AWS IoT TwinMaker console, and the Scene Viewer renders the Matterport space with your TwinMaker tags and data bindings.

<!-- vale Grafana.Spelling = YES -->

## Video Player

The Video Player panel plays video from Amazon Kinesis Video Streams, including streams associated with TwinMaker video components. To get started with edge video, refer to the [video integration guide for Amazon Kinesis Video Streams](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/video-integration.html).

![The Video Player panel showing an example video of a cookie factory](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/VideoPlayerPanel.png)

### Set up the Video Player

![The edit panel page for the Video Player](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/EditVideoPlayer.png)

To set up your Video Player panel, follow these steps. The numbers in the image correspond to the steps.

1. Create a new panel on your dashboard, then search for and select **AWS IoT TwinMaker Video Player** in the visualization list.
1. Select your TwinMaker data source in the **Workspace** panel option.
1. Enter a stream name in the **Kinesis video stream name** option. If you only provide the stream name, the Video Player loads available video from the stream but doesn't show a custom time scrubber.
1. In the **Entity** and **Component name** options, enter an AWS IoT TwinMaker entity with a video component. When you provide the entity and component, you can skip the stream name because the Video Player finds the stream associated with the component.

After configuring the panel, click **Apply** and save your dashboard.

### Use the time scrubber

The custom time scrubber shows video availability and controls playback:

- **Available video:** Time ranges highlighted in blue have video available for playback. Selecting a time that isn't blue shows an error screen because video isn't available.
- **Playback mode:** Switch between `LIVE` and `ON_DEMAND` mode by clicking the **Live** button.
  - `LIVE` requests live video from Amazon Kinesis Video Streams and ignores the Grafana time range. It fails if no live video is available.
  - `ON_DEMAND` requests video for the time range set on the dashboard. Playback is limited to a 24-hour time range.

### Request video upload

Video may be stored on your edge connector but not yet uploaded to Amazon Kinesis Video Streams. To upload available video, select a time range and click the **Request Video** button. Refresh the dashboard after roughly 10 seconds to see the video available for playback.

## Alarm Configuration

The Alarm Configuration panel displays the **Alarm ID**, **Threshold**, and **Notifications** of a selected alarm, and lets dashboard users edit the alarm threshold without leaving Grafana.

To use the panel:

1. Configure a write role on the data source. On the data source configuration page, switch on **Define write permissions for Alarm Configuration Panel** and provide an **Assume Role ARN Write**. Refer to [Configure TwinMaker settings](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/configure/#configure-twinmaker-settings).
1. Create a new panel, then search for and select **AWS IoT TwinMaker Alarm Configuration** in the visualization list.
1. Select your TwinMaker data source in the **Workspace** panel option.
1. Add a query that returns the alarm properties for the selected entity and component, typically using template variables set by an alarm list table or the Scene Viewer.

Click **Edit Alarm** in the panel to change the alarm threshold. The panel writes the new numeric value to the `alarm_threshold` property in AWS IoT TwinMaker using the write role you configured, then refreshes the other panels on the dashboard.

## Query Editor panel

The Query Editor panel embeds the AWS IoT TwinMaker query builder in a dashboard, so you can explore entities, components, and relationships in your workspace, including path queries across entity relationships.

To use the panel:

1. Create a new panel, then search for and select **AWS IoT TwinMaker Query Editor** in the visualization list.
1. Select your TwinMaker data source in the **Workspace** panel option.
1. Build and run queries directly in the panel. The panel doesn't use Grafana queries.

## Next steps

- [Set template variables from panel selections](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/template-variables/)
- [Import the pre-built dashboards](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/dashboards/)
