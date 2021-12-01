# AWS IoT TwinMaker Dashboard Layout Panel

<img src="https://grafana-priv.s3.amazonaws.com/temp/DashboardLayoutPanel.png" />

Image: TwinMaker dashboard with the Dashboard Layout panel in the corner

## Setup

<img src="https://grafana-priv.s3.amazonaws.com/temp/EditDashboardLayout.png" />

Image: edit panel page for the Dashboard Layout panel

To set up your Dashboard Layout panel (numbers reference the image above):

1. Create a new panel on your dashboard, then search for and select "Dashboard Layout" on the Visualizations list.

2. Select a TwinMaker datasource in the panel options.

3. Select the template variables that store the most recently selected entityId and componentName on your dashboard. Template variables can be automatically set by the [Scene Viewer panel](https://github.com/grafana/grafana-iot-twinmaker-app/tree/main/src/panels/scene-viewer/README.md).

4. Define rules that perform an action when a componentTypeId is matched with the selected entityId and componentName.
   a. Set the value of tempate variables
   b. Merge the panels of another Grafana dashboard with the current dashboard

## Panel visuals

This panel only shows debug information based on a selected entityId, componentName, and componentTypeId. Choose the level of info by toggling between "Entity name", "Component type", and "Debug".

## Rule Definitions

When a TwinMaker datasource is selected the Dashboard Layout panel loads all entities and components associated with the TwinMaker workspace. This enables the panel to match an entityId and componentName with a componentTypeId.

Rules are matched against a single componentTypeId. When a selected id matches then the actions are performed on the dashboard.

## Dashboard Merge

With Grafana 8.2+ and the TwinMaker plugin you can merge panels from one dashboard into another to enhance your monitoring experience. In order to merge a dashboard it must also have the Dashboard Layout panel added somewhere on it.

When another dashboard is merged into the current one, all panels except for the Dashboard Layout are replaced with the panels on the other dashboard. Keep this in mind when crafting your dashboards! Our recommendation is to start with a TwinMaker [dashboard template](https://github.com/grafana/grafana-iot-twinmaker-app/tree/main/src/datasource/dashboards/README.md), then "Save As" and create new dashboards with the same template as a starting off point.
