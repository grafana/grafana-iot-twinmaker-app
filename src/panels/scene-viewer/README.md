# AWS IoT TwinMaker Scene Viewer Panel

<img src="https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/docs/SceneViewerPanel.png" />

Image: TwinMaker Scene Viewer panel with an example scene of a cookie factory.

## Setup

<img src="https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/docs/EditSceneViewer.png" />

Image: edit panel page for the Scene Viewer

To set up your Scene Viewer panel (numbers reference the image above):

1. Create a new panel on your dashboard, then search for and select "AWS IoT TwinMaker Scene Viewer" on the Visualizations list.

2. Select the same TwinMaker datasource in the panel options and on the query editor. This ensures the data you query and the scene you load come from the same TwinMaker workspace.

3. Select a scene from your workspace.

4. Select the template variables that will store the entityId and componentName of the data bound to tags. When you select a tag in the scene the Scene Viewer will set these variables automatically. You can use these variables to dynamically configure queries on other panels.

5. In order to see tags change icons based on data:
   a. Add a "Get Property Value History by Component Type" query to the panel
   b. Select your component type and property, and optionally a filter on the property value.
   c. Select Order = DESC to pass data from most recent to oldest to the Scene Viewer. This panel will parse the data and pull off the first value to match with a tag's rule. This assumes you have composed your scene with rules to change tag icons based on data value thresholds.
   - Note: The Scene Viewer only supports the "Get Property Value History by Component Type" query

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
