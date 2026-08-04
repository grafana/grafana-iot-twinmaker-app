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

Use template variables to create dynamic, reusable dashboards. The AWS IoT TwinMaker app uses variables in two ways: the data source can populate variables with query results, and the Scene Viewer panel and register links transformation can set variable values when users click tags or table rows.

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
| **List component names** | Lists the component names in an entity. Requires an **Entity** selection. |

## Use variables in queries

Reference variables in the query editor by selecting them in the **Entity**, **Component Name**, or **Component Type** drop-downs, which list your dashboard variables alongside workspace values. You can also use variables in the **Selected Properties** field.

The pre-built dashboards use this pattern: the `sel_entity` and `sel_comp` variables fill in a **Get Property Value History by Entity** query, so the history panel always shows data for the currently selected alarm.

## Set variables from panel selections

Two components in the app set variable values in response to user clicks.

### Scene Viewer tag selection

In the Scene Viewer panel options, specify which template variables store the selected entity ID, component name, and property. When a user clicks a tag in the 3D scene, the panel sets those variables, and any query that references them re-runs. Refer to [Scene Viewer panel options](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/panels/#panel-options).

### Register links transformation

The app registers a transformation named **Register links with AWS IoT TwinMaker** that defines selection behavior from the results of a TwinMaker query. Attach it to a table panel, such as an alarm list, and define rules that map fields of the query response to template variables. When a user clicks a row in the table, the transformation sets the variable values.

To add the transformation:

1. Edit the table panel and open the **Transform data** tab.
1. Add the **Register links with AWS IoT TwinMaker** transformation.
1. Add a rule for each variable, mapping a field name from the query response, such as `entityId`, to a dashboard variable, such as `sel_entity`.

The pre-built alarm dashboard uses this transformation to set `sel_entity` and `sel_comp` when you click an alarm in the alarm list. Refer to [Pre-built dashboards](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/dashboards/).
