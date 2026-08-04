---
description: Use the AWS IoT TwinMaker query editor to query property value history, alarms, entities, scenes, and workspaces, including streaming and tabular queries.
keywords:
  - grafana
  - aws iot twinmaker
  - twinmaker
  - query editor
  - property value history
  - alarms
  - streaming
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Query editor
title: AWS IoT TwinMaker query editor
weight: 200
review_date: 2026-08-04
---

# AWS IoT TwinMaker query editor

This document explains how to use the AWS IoT TwinMaker query editor to query data from your TwinMaker workspace in dashboard panels and Explore.

## Before you begin

- Ensure you have [configured the AWS IoT TwinMaker data source](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/configure/) with a workspace selected.
- Verify the data source's IAM role has read access to your workspace.

## Key concepts

If you're new to AWS IoT TwinMaker, these terms are used throughout the query editor.

| Term | Description |
| --- | --- |
| **Entity** | A digital representation of a real-world object, such as a piece of equipment. |
| **Component** | A named part of an entity that provides data, such as a sensor or an alarm. |
| **Component type** | A reusable definition that components inherit from, such as the base alarm type `com.amazon.iottwinmaker.alarm.basic`. |
| **Property** | A data field on a component, which can be a time series or a single value. |
| **Scene** | A 3D visualization of your workspace, composed in the AWS IoT TwinMaker console. |

## Query types

Select a query type from the **Query Type** drop-down. The editor supports the following query types.

| Query type | Description |
| --- | --- |
| **Get Property Value History by Entity** | Gets the history of a component's property for a specific entity. |
| **Get Property Value History by Component Type** | Gets the history of a property within a component of a specific component type. |
| **Get Alarms** | Gets the alarms within a workspace. |
| **Get Property Value** | Gets the value of a non-time series property within a component. |
| **List Workspaces** | Retrieves the list of workspaces. |
| **List Scenes** | Retrieves the list of scenes associated with a workspace. |
| **List Entities** | Retrieves the list of entities associated with a workspace. |
| **Get Entity** | Gets an entity within a workspace. |

## Get Property Value History by Entity

Use this query type to graph time series property values for a single entity.

| Field | Description |
| --- | --- |
| **Entity** | The entity to query. Select from the list, type an entity ID, or use a template variable. |
| **Component Name** | The component on the entity that contains the properties. |
| **Selected Properties** | One or more time series properties to return. |
| **Filter** | Optional property filters. Each filter has a property name, an operator, and a value. |
| **Order** | Sort results in `ASC` or `DESC` time order. |

<!-- vale Grafana.Headings = NO -->

## Get Property Value History by Component Type

<!-- vale Grafana.Headings = YES -->

Use this query type to graph time series property values across all entities that share a component type. The **Component Type** drop-down only lists component types with time series properties.

| Field | Description |
| --- | --- |
| **Component Type** | The component type to query. When the type has a single time series property, the editor selects it automatically. |
| **Selected Properties** | One or more time series properties to return. |
| **Filter** | Optional property filters. |
| **Order** | Sort results in `ASC` or `DESC` time order. |

## Get Alarms

Use this query type to list alarms in the workspace, typically in a table panel. When you switch to this query type, the editor adds a default filter of `alarm_status = ACTIVE`.

| Field | Description |
| --- | --- |
| **Filter** | Filter alarms by status: `ACTIVE`, `SNOOZE_DISABLED`, `ACKNOWLEDGED`, or `NORMAL`. Clear the filter to return alarms with any status. |
| **Max. Alarms** | The maximum number of alarms to return. Defaults to `50`. Leave the field blank to return all results. |

## Get Property Value

Use this query type to read the current value of non-time series properties.

| Field | Description |
| --- | --- |
| **Entity** | The entity to query. |
| **Component Name** | The component that contains the properties. |
| **Selected Properties** | One or more properties to return. |

### Query tabular data from an Athena connector

If the selected component uses the Athena tabular data connector, the editor shows additional fields for tabular queries.

| Field | Description |
| --- | --- |
| **Property Group** | The property group defined on the component. Select a group to load its properties. |
| **Filter** | Tabular property filters applied as query conditions. |
| **Order By** | Sort the tabular results by one or more properties in ascending or descending order. |

## List and get queries

The remaining query types return workspace metadata, which is useful in table panels and for exploring your workspace.

- **List Workspaces** and **List Scenes** require no additional fields.
- **List Entities** accepts an optional **Component Type** filter to list only entities that include a component of that type.
- **Get Entity** requires an **Entity** and returns its full definition, including its components.

## Stream data with Grafana Live

The history and alarm query types support streaming updates through Grafana Live. The streaming fields only appear when your Grafana instance has Grafana Live enabled and connected.

| Field | Description |
| --- | --- |
| **Stream** | Toggle on to poll for new data on an interval and push updates to the panel. |
| **Interval** | The polling interval in seconds. The minimum is `5` and the default is `30`. |

## Next steps

- [Use template variables in queries](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/template-variables/)
- [Visualize scenes, video, and alarms with the TwinMaker panels](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/panels/)
