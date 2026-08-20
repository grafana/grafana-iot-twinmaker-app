---
description: Create Grafana alert rules from AWS IoT TwinMaker queries to get notified when property values cross thresholds.
keywords:
  - grafana
  - aws iot twinmaker
  - twinmaker
  - alerting
  - alert rules
  - alarms
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Alerting
title: AWS IoT TwinMaker alerting
weight: 500
review_date: 2026-08-05
---

# AWS IoT TwinMaker alerting

The AWS IoT TwinMaker data source supports [Grafana Alerting](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/). Use alert rules to evaluate TwinMaker property data on a schedule and send notifications through contact points such as email, Slack, or PagerDuty.

## TwinMaker alarms compared to Grafana alert rules

AWS IoT TwinMaker workspaces can include alarm components that track equipment state in AWS. Grafana alert rules are separate: Grafana evaluates them on its own schedule and routes notifications through Grafana contact points.

The two work well together. Use the [Alarm Configuration panel](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/panels/#alarm-configuration-panel) and the pre-built dashboards to view and manage TwinMaker alarms, and use Grafana alert rules when you want Grafana to notify your team about the underlying data.

## Before you begin

- [Configure the AWS IoT TwinMaker data source](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/configure/) with a workspace selected.
- Understand the basics of [Grafana alert rules](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/fundamentals/).

## Choose a query type for alerting

Grafana alert conditions evaluate numeric data, which affects which queries you can alert on:

- **Get Property Value History by Entity** and **Get Property Value History by Component Type** queries work with alert rules when the selected properties are numeric, such as a temperature or RPM sensor value.
- **Get Alarms** queries return string fields, such as the alarm status, so you can't use them directly in an alert condition. To get notified about an alarm, create the alert rule against the numeric property that drives the alarm, using the same threshold as the TwinMaker alarm.

## Example: alert when a mixer overheats

This example uses the Cookie Factory sample workspace to create an alert rule that fires when the temperature of a mixer stays above `100` degrees. Substitute your own entity, component, property, and threshold.

1. Navigate to **Alerts & IRM** > **Alerting** > **Alert rules** and click **New alert rule**.
1. Enter a name for the rule, such as `Mixer 1 overheating`.
1. In the query section, select the AWS IoT TwinMaker data source and enter the query:

   | Field | Value |
   | --- | --- |
   | **Query Type** | Get Property Value History by Entity |
   | **Entity** | `Mixer_1` |
   | **Component Name** | `MixerComponent` |
   | **Selected Properties** | `Temperature` |

1. Toggle on **Advanced options** to show the expressions. New alert rules include a **Reduce** and a **Threshold** expression by default:

   - Set the **Reduce** function to `Last` to reduce the time series to its most recent value.
   - Set the **Threshold** condition to `IS ABOVE` `100`.

1. Add a folder and labels for the rule.
1. Set the evaluation behavior, such as evaluating every minute with a pending period of 5 minutes.
1. Configure notification settings, then click **Save rule and exit**.

Grafana evaluates the query on the schedule you set and fires the alert when the latest temperature value exceeds the threshold.

## Example: monitor every mixer with one rule

To alert on all entities that share a component type, use a **Get Property Value History by Component Type** query instead:

| Field | Value |
| --- | --- |
| **Query Type** | Get Property Value History by Component Type |
| **Component Type** | `com.example.cookiefactory.mixer` |
| **Selected Properties** | `Temperature` |

The query returns a separate series for each entity, labeled with its `entityId` and `componentName`, so Grafana evaluates the alert condition for each mixer and creates a separate alert instance for any mixer that exceeds the threshold. Use the same **Reduce** and **Threshold** expressions as the previous example.

## Considerations

Keep the following in mind when you create alert rules with the data source:

- Template variables aren't supported in alert rule queries. Replace variables such as `${sel_entity}` with concrete values.
- Streaming doesn't apply to alert rules. The **Stream** toggle in the query editor updates dashboard panels through Grafana Live, while alert rules evaluate queries on their own schedule.
- Alert rules run in the Grafana backend, so they keep evaluating even when no one has the dashboard open.

## Next steps

- [Grafana Alerting documentation](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/)
- [AWS IoT TwinMaker query editor](https://grafana.com/docs/plugins/grafana-iot-twinmaker-app/latest/query-editor/)
