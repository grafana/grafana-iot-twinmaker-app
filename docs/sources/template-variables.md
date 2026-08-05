---
description: Use template variables with the AWS IoT TwinMaker data source, including variable queries and the register links transformation for dynamic dashboards.
keywords:
  - grafana
  - aws iot twinmaker
  - twinmaker
  - template variables
  - variables
  - transformations
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Template variables
title: AWS IoT TwinMaker template variables
weight: 400
review_date: 2026-08-04
---

# AWS IoT TwinMaker template variables

Use template variables to create dynamic, reusable dashboards. The AWS IoT TwinMaker app uses variables in two ways:

- **Query variables** populate a drop-down with values from your workspace, such as entities or component types.
- **Selection variables** are plain text box variables that the Scene Viewer panel and the register links transformation fill in when users click tags or table rows.

## Before you begin

- [Configure the AWS IoT TwinMaker data source](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/configure/).
- Understand [Grafana template variables](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/).

## Create a query variable

To create a query variable backed by the data source:

1. Navigate to **Dashboard settings** > **Variables**.
1. Click **Add variable**.
1. Select **Query** as the variable type.
1. Select the AWS IoT TwinMaker data source.
1. Select a **Query Type**.

The variable query editor supports the following query types.

| Query type | Description |
| --- | --- |
| **List entities** | Lists all entities in the workspace. |
| **List component types** | Lists all component types in the workspace. |
| **List component names** | Lists the component names in an entity. Requires an **Entity** selection, which can be another variable. |

### Example: filter a dashboard by entity and component

This example creates two chained variables: an entity drop-down, and a component drop-down that updates based on the selected entity.

1. Create a query variable named `entity` with the **List entities** query type.
1. Create a second query variable named `component` with the **List component names** query type, and select `${entity}` in the **Entity** field.
1. In your panel queries, select `${entity}` in the **Entity** drop-down and `${component}` in the **Component Name** drop-down.

When a user changes the entity, the component list refreshes and the panel queries re-run.

## Use variables in queries

Reference variables in the query editor by selecting them in the **Entity**, **Component Name**, or **Component Type** drop-downs, which list your dashboard variables alongside workspace values. You can also use variables in the **Selected Properties** field.

The pre-built dashboards use this pattern: the `sel_entity` and `sel_comp` variables fill in a **Get Property Value History by Entity** query, so the history panel always shows data for the currently selected alarm.

## Set variables from panel selections

Two components in the app set variable values in response to user clicks. In both cases, first create the variables that receive the selection. The pre-built dashboards use hidden **Text box** variables for this, such as `sel_entity` and `sel_comp`, which start empty and are filled in when the user makes a selection.

### Scene Viewer tag selection

In the Scene Viewer panel options, specify which template variables store the selected entity ID, component name, and property. When a user clicks a tag in the 3D scene, the panel sets those variables, and any query that references them re-runs. Refer to [Scene Viewer panel options](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/panels/#panel-options).

### Register links transformation

The app registers a transformation named **Register links with AWS IoT TwinMaker** that defines selection behavior from the results of a TwinMaker query. Attach it to a table panel, such as an alarm list, and define rules that map fields of the query response to template variables. When a user clicks a row in the table, the transformation sets the variable values.

The transformation is supported for the table panel visualization, and its rules can only map string fields from the query response.

| Option | Description |
| --- | --- |
| **Workspace** | The TwinMaker data source used by the query you're transforming. |
| **Title** | The name of the link shown in the table, such as `Selected Alarm`. |
| **Show selection** | Toggle on to show the current selection in a separate table column. |
| **Set** and **Field** | A rule that assigns the value of a response field to a template variable. Click **Add variable** to add more rules. |

### Example: select an alarm from a table

This example reproduces the alarm selection behavior of the pre-built dashboards.

1. Create two hidden **Text box** variables named `sel_entity` and `sel_comp`, and leave their values empty.
1. Create a table panel with a **Get Alarms** query.
1. Open the **Transform data** tab and add the **Register links with AWS IoT TwinMaker** transformation.
1. Add two rules: **Set** `sel_entity` to the **Field** `entityId`, and **Set** `sel_comp` to the **Field** `alarmName`.
1. In another panel, add a **Get Property Value History by Entity** query with **Entity** set to `${sel_entity}` and **Component Name** set to `${sel_comp}`.

When a user clicks an alarm row in the table, the history panel updates to show that alarm. Refer to [Pre-built dashboards](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/dashboards/) for the complete working example.
