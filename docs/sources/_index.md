# AWS IoT TwinMaker Application Plugin for Grafana

![dashboard](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/TwinMakerDashboard.png)

Create end-user 3D digital twin applications to monitor industrial operations with AWS IoT TwinMaker. AWS IoT TwinMaker is a service that makes it faster and easier for developers to create digital replicas of real-world systems, helping more customers realize the potential of digital twins to optimize operations.

The AWS IoT TwinMaker Application Grafana plugin provides custom panels, dashboard templates, and a datasource to connect to your digital twin data:

- [Scene Viewer panel](#aws-iot-twinmaker-scene-viewer-panel)
- [Video Player panel](#aws-iot-twinmaker-video-player-panel)
- [TwinMaker datasource](#aws-iot-twinmaker-datasource)
  - Getting started with a [GG Edge Connector for KVS](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/video-integration.html)
- [Pre-built dashboards](#aws-iot-twinmaker-dashboards)
- [Example dashboard](#example-dashboard)

## AWS IoT TwinMaker Scene Viewer Panel

![scene-viewer](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/SceneViewerPanel.png)

Image: TwinMaker Scene Viewer panel with an example scene of a cookie factory.

### Setup

![scene-viewer-edit](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/EditSceneViewer.png)

Image: edit panel page for the Scene Viewer

To set up your Scene Viewer panel (numbers reference the image above):

1. Create a new panel on your dashboard, then search for and select "AWS IoT TwinMaker Scene Viewer" on the Visualizations list.

2. Select the same TwinMaker datasource in the panel options and on the query editor. This ensures the data you query and the scene you load come from the same TwinMaker workspace.

3. Select a scene from your workspace.

4. Select the template variables that will store the entityId and componentName of the data bound to tags. When you select a tag in the scene the Scene Viewer will set these variables automatically. You can use these variables to dynamically configure queries on other panels.

5. In order to see tags change icons based on data, the Scene Viewer panel needs to get the property values. There are two ways to provide the data:
- 5.a Add Grafana query 
  - a. Add a "Get Property Value History by Entity" query to the panel for each data binding in your scene.
    - Note: The Scene Viewer only supports the "Get Property Value History by Component Type", "Get Property Value History by Entity" and "Get Alarms" queries
  - b. Select your component type and property, and optionally a filter on the property value.
  - c. Select Order = DESC to pass data from most recent to oldest to the Scene Viewer. This panel will parse the data and pull off the first value to match with a tag's rule. This assumes you have composed your scene with rules to change tag icons based on data value thresholds.
- 5.b Enable auto query
  - By switching on the "Enable auto query" toggle, the Scene Viewer panel will automatically construct the queries for all the data bindings exist in the scene, then fetch the data. Any Grafana query added to Scene Viewer panel will be ignored.

Click "Apply" then save your dashboard.

### Interact with your scene

When your scene loads you can navigate the 3D space with the following controls:

- Click & drag: rotate around a fixed point
- Right click & drag: pan on the 2D plane your camera is facing
- Click on an object: select the object
- Click on a tag: select the tag and set template variables on the dashboard
- Mouse scroll: zoom in and out

There is a collapsible "Hierarchy" panel to help find objects in your scene. This matches the hierarchy defined in the TwinMaker Console's scene editor page.

- Select a node on the hierarchy to move the camera to look towards the object
- Select a tag node to move the camera and trigger a tag click

## AWS IoT TwinMaker Video Player Panel

![video](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/VideoPlayerPanel.png)

Image: TwinMaker Video Player panel with an example video of a cookie factory.

### Setup

![video-edit](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/EditVideoPlayer.png)

Image: edit panel page for the Video Player

To set up your Video Player panel (numbers reference the image above):

1. Create a new panel on your dashboard, then search for and select "AWS IoT TwinMaker Video Player" on the Visualizations list.

2. Select an AWS IoT TwinMaker datasource in the panel options.

3. Enter an Amazon Kinesis video stream name

- If you skip step 4 then the Video Player will load available video from your stream but it will not have a custom time scrubber

4. Enter the entityId and componentName of an AWS IoT TwinMaker component with a video component

- You do not need to enter the Amazon Kinesis video stream name in step 3 since the Video Player can find the video stream name associated with your AWS IoT TwinMaker component

Click "Apply" then save your dashboard.

### Custom time scrubber

Available video:

- Time range highlighted in blue has video available for playback
- Selecting a time that is not blue will show an error screen that video is not available

Playback mode:

- Switch between LIVE and ON_DEMAND mode by clicking the "Live" button
- LIVE: live video will be requested from Amazon Kinesis Video Streams, will fail if no video is available. Ignores the Grafana time range
- ON_DEMAND: video will be requested from Amazon Kinesis Video Streams with the time range set on the dashboard
  - Limitation: cannot playback video for more than a 24 hour time range

### Request video upload

- Video may be stored on your edge connector but not yet uploaded to Amazon Kinesis Video Streams. To upload available video to Amazon Kinesis Video Streams you can select a time range and click the "Request Video" button. Refresh the dashboard after some time (~10 seconds) to see the video available for playback.

## AWS IoT TwinMaker Datasource

<img src="https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/docs/DatasourceConfig.png" />

1. Go to Configuration → Datasources and click “Add data source”

2. Find the AWS IoT TwinMaker Datasource under the “Industrial & IoT” section

3. On the datasource settings page choose your [authentication provider](https://grafana.com/docs/grafana/next/datasources/aws-cloudwatch/aws-authentication/)

   1. The credentials resolved from the auth provider are used to make AWS calls for queries in the backend plugin
   2. The same credentials are used on the browser for our custom panels, so make sure your permissions are scoped down
   3. EC2 users: you can use “AWS SDK Default” to resolve credentials from your instance IAM role. It is a security risk to expose these credentials on your browser so you MUST set an additional IAM role with scoped down permissions. See [here](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) for information on setting up permissions to assume roles.

4. You need to set an "Assume Role ARN" for any environment Grafana is running in. This is an [IAM role](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/dashboard-IAM-role.html) you create for your TwinMaker workspace.

   a. This plugin assumes the role provided with an inline session policy to ensure the desired permission scope is used on the browser. We will only use permissions that intersect with the inline policy.

5. (Optional) Set an External ID if your role is assumed from a separate account

6. (Optional) AWS developers may use a custom endpoint for testing

   a. Note: You cannot currently set an "Assume Role ARN" and a custom endpoint together

7. Select your region

8. Click "Save & test" to load your workspaces

   a. The error "Missing WorkspaceID configuration" is expected to appear

9. Select your TwinMaker workspace ID. Any query that uses this datasource instance will have access to resources within the workspace.

10. Click “Save & test”

## AWS IoT TwinMaker Dashboards

<img src="https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/docs/DashboardTab.png" />

1. Click “Import” to load a dashboard template

2. Select the dashboard name to navigate to that dashboard

3. Edit the dashboard as desired, then save it and click “Save As”

## Alarm Dashboard

<img src="https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/docs/AlarmDashboard.png" />

Prerequisites:

- Create entities with a component that inherits its type from the base alarm type: `com.amazon.iottwinmaker.alarm.basic`
- Create a scene in your workspace
- Create tags in the scene with a data binding to alarm components

Template variables:

- `sel_entity` and `sel_comp` are defined to manage the selections on the dashboard and fill in the query to show the history for the alarm property `alarm_status`

To set up your alarm dashboard (numbers reference the image above):

1. Edit the Scene Viewer panel:

   a. Select the scene in the panel options

   b. Select your alarm componentTypeId in the Query Editor

2. Select a time range where your alarms have data

3. There is an error on the panel because it is configured with a query that is empty until the template variables `sel_entity` and `sel_comp` have values. These template variables can be set by:

   a. Clicking on an alarm in the Alarms List

   OR

   b. Clicking on a tag in the scene that has a data binding with an alarm property

How do we dynamically set these template variables?

1. Alarm List: this Table panel visualization has a Transform attached called "Register links with AWS IoT TwinMaker". You can define rules to set the values of template variables based on the fields of the query response. When you click on a row of the table the template variables are set.

2. Scene Viewer: on the panel settings of the Scene Viewer you can specify which template variables will store the selected entityId and componentName when a tag is clicked in the scene.

## Example dashboard

Interact with a demo TwinMaker dashboard in Grafana Play. This dashboard monitors a cookie factory by visualizing a 3D factory, listing alarms, graphing temperature sensor history, and playing a video camera stream.

- [Cookie Factory Demo](https://play.grafana.org/d/y1FGfj57z/aws-iot-twinmaker-mixer-alarm-dashboard?orgId=1)

## License

- Apache License Version 2.0, see [LICENSE](https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/LICENSE).

## Plugin repository

You can request new features, report issues, or contribute code directly through the [IOT Twinmaker plugin Github repository](https://github.com/grafana/grafana-iot-twinmaker-app)

