# AWS IoT TwinMaker Application Plugin for Grafana

<img src="https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/docs/TwinMakerDashboard.png" />

## Summary

- Introduction
- Getting Started
- Documentation
- Development
- License

## Introduction

Create end-user 3D digital twin applications to monitor industrial operations with AWS IoT TwinMaker. AWS IoT TwinMaker is a service that makes it faster and easier for developers to create digital replicas of real-world systems, helping more customers realize the potential of digital twins to optimize operations.

The AWS IoT TwinMaker Application Grafana plugin provides custom panels, dashboard templates, and a datasource to connect to your digital twin data.

### Custom Panels

- Scene Viewer
- Video Player

### Dashboard Templates

- Alarm Dashboard

Import a dashboard from the TwinMaker datasource configuration page. See the “Dashboard” tab.

<img src="https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/docs/DashboardTab.png" />

### Requirements

- Grafana 8.2.0+

## Getting Started

### Quick Start

Interact with a demo TwinMaker dashboard in Grafana Play. This dashboard monitors a cookie factory by visualizing a 3D factory, listing alarms, graphing temperature sensor history, and playing a video camera stream.

- [Cookie Factory Demo](https://play.grafana.org/d/y1FGfj57z/aws-iot-twinmaker-mixer-alarm-dashboard?orgId=1)

### Installation

#### Local Installation

Use the [grafana-cli](https://grafana.com/docs/grafana/latest/administration/cli/#plugins-commands) tool to install from the command line:

```BASH
grafana-cli plugins install grafana-iot-twinmaker-app
```

#### Local Docker Setup

1. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. Run `aws configure` and enter your IAM user credentials
3. Run the following docker command:

```BASH
docker run -d -p 3000:3000 --name=grafana -v ~/.aws:/usr/share/grafana/.aws -e "GF_INSTALL_PLUGINS=grafana-iot-twinmaker-app" grafana/grafana
```

a. `-v ~/.aws:/usr/share/grafana/.aws` will mount a volume with the credentials you configured on your machine so you can use the “AWS SDK Default” authentication provider for the TwinMaker datasource

4. Access from http://localhost:3000 on your browser. First time login will be username:`admin` password:`admin`.

### Enable the Application plugin

Navigate to Grafana in your browser and log in. Go to the plugin list and search for AWS IoT TwinMaker Application and enable the plugin.

<img src="https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/docs/TwinMakerAppPlugin.png" />

Configure your [TwinMaker datasources](https://github.com/grafana/grafana-iot-twinmaker-app/tree/main/src/datasource/README.md).

Import a dashboard and start using the Scene Viewer and Video Player panels.

## Documentation

You can find documentation on:

- [TwinMaker datasource](https://github.com/grafana/grafana-iot-twinmaker-app/tree/main/src/datasource/README.md)
- [Dashboard templates](https://github.com/grafana/grafana-iot-twinmaker-app/tree/main/src/datasource/dashboards/README.md)
- [Scene Viewer panel](https://github.com/grafana/grafana-iot-twinmaker-app/tree/main/src/panels/scene-viewer/README.md)
- [Video Player panel](https://github.com/grafana/grafana-iot-twinmaker-app/tree/main/src/panels/video-player/README.md)
  - Getting started with a [GG Edge Connector for KVS](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/video-integration.html)

## Development

If you are interested in developing and contributing to this project, find instructions on the git repo [here](https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/README.md).

## License

- Apache License Version 2.0, see [LICENSE](https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/LICENSE).
