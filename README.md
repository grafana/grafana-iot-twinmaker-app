# AWS IoT TwinMaker Application Development Guide

Please add feedback to the [issues](https://github.com/grafana/grafana-iot-twinmaker-app/issues) folder, and we will follow up shortly. Be sure to include version information for both Grafana and the installed plugin.

The production plugins can be downloaded from [the TwinMaker app plugin page](https://grafana.com/grafana/plugins/grafana-iot-twinmaker-app/).

For an overview of the plugin see [src/README.md](https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/src/README.md).

## Developer Guide

Pull down the git repo locally.

Installation requirements:

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://classic.yarnpkg.com/)
- [GoLang](https://golang.org/)
- [Mage](https://magefile.org/)

1. `yarn install --frozen-lockfile`
2. `yarn dev` — will build the frontend changes, `yarn watch` will build in watch mode
3. `mage build:backend` — will build the backend changes
   1. Troubleshooting: If you see `Plugin unavailable` when clicking “Save & test” for the TwinMaker datasource then run: `mage -v buildAll`. This builds the backend plugin for all platforms.
4. The compiled plugin should be in dist/ directory.
5. Run Grafana in [development](https://grafana.com/docs/grafana/latest/administration/configuration/#app_mode) mode, or configure Grafana to [load the unsigned plugin](https://grafana.com/docs/grafana/latest/plugins/plugin-signatures/#allow-unsigned-plugins).

For more information, please consult the [build a plugin docs page](https://grafana.com/docs/grafana/latest/developers/plugins/).

## Install

You can install by following the [install Grafana plugins docs page](https://grafana.com/docs/grafana/latest/plugins/installation/).

### Local Docker Setup

1. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. Run `aws configure` and enter your IAM user credentials
3. Run the following docker command:

```BASH
docker run -d -p 3000:3000 --name=grafana -v ~/.aws:/usr/share/grafana/.aws -e "GF_INSTALL_PLUGINS=grafana-iot-twinmaker-app" grafana/grafana
```

a. `-v ~/.aws:/usr/share/grafana/.aws` will mount a volume with the credentials you configured on your machine so you can use the “AWS SDK Default” authentication provider for the TwinMaker datasource

4. Access from http://localhost:3000 on your browser. First time login will be username:`admin` password:`admin`.
