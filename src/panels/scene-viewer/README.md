# AWS IoT TwinMaker Scene Viewer Panel

![scene-viewer](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/SceneViewerPanel.png)

Image: TwinMaker Scene Viewer panel with an example scene of a cookie factory.

## Setup

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

## Interact with your scene

When your scene loads you can navigate the 3D space with the following controls:

- Click & drag: rotate around a fixed point
- Right click & drag: pan on the 2D plane your camera is facing
- Click on an object: select the object
- Click on a tag: select the tag and set template variables on the dashboard
- Mouse scroll: zoom in and out

There is a collapsible "Hierarchy" panel to help find objects in your scene. This matches the hierarchy defined in the TwinMaker Console's scene editor page.

- Select a node on the hierarchy to move the camera to look towards the object
- Select a tag node to move the camera and trigger a tag click
