# AWS IoT TwinMaker Dashboards

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
