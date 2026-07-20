## Developer Guide

Pull down the git repo locally.

Installation requirements:

- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com)
- [GoLang](https://golang.org/)
- [Mage](https://magefile.org/)

1. `npm ci`
2. `npm run dev` — will build the frontend changes, `npm run watch` will build in watch mode
3. `mage build:backend` — will build the backend changes
   1. Troubleshooting: If you see `Plugin unavailable` when clicking “Save & test” for the TwinMaker datasource then run: `mage -v buildAll`. This builds the backend plugin for all platforms.
4. The compiled plugin should be in dist/ directory.
5. Run Grafana in [development](https://grafana.com/docs/grafana/latest/administration/configuration/#app_mode) mode, or configure Grafana to [load the unsigned plugin](https://grafana.com/docs/grafana/latest/plugins/plugin-signatures/#allow-unsigned-plugins).

For more information, please consult the [build a plugin docs page](https://grafana.com/docs/grafana/latest/developers/plugins/).

### Build a release

You need to have commit rights to the GitHub repository to publish a release.

1. Update the version number in the `package.json` file.
2. Update the `CHANGELOG.md` by copy and pasting the relevant PRs from [Github's Release drafter interface](https://github.com/grafana/grafana-iot-twinmaker-app/releases/new) or by running `npm run generate-release-notes`.
3. PR the changes.
4. Let the AWS TwinMaker team know that you are planning a release so they can test it first. You can do this by tagging them in the release PR.
5. Once merged, follow the release process that you can find [here](https://enghub.grafana-ops.net/docs/default/component/grafana-plugins-platform/plugins-ci-github-actions/010-plugins-ci-github-actions/#cd_1)

## Install

You can install by following the [install Grafana plugins docs page](https://grafana.com/docs/grafana/latest/plugins/installation/).

### Local Docker Setup

1. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. Run `aws configure` and enter your IAM user credentials
3. Run the following docker command:

```BASH
docker compose up -d
```

a. This container will mount the volume `~/.aws:/usr/share/grafana/.aws` with the credentials you configured on your machine so you can use the “AWS SDK Default” authentication provider for the TwinMaker datasource

1. Access from http://localhost:3000 on your browser. First time login will be username:`admin` password:`admin`.

## Development Mode

By default, the webpack mode is set to `production` to work with the released Grafana production build.

To build the plugin with `development` mode, change the mode in [webpack.config.js](https://github.com/grafana/grafana-iot-twinmaker-app/blob/main/webpack.config.js) file to be `development`, and start the development mode local Grafana server following [Grafana Developer Guide](https://github.com/grafana/grafana/blob/main/contribute/developer-guide.md#build-grafana)

## E2E tests

1. `npx playwright install --with-deps`
1. `npm run server`
1. `npm run e2e`

## Dependency notes

- Do not remove the `@react-three/*` and `@matterport/*` overrides/dependencies until AMG upgrades to Grafana v10 - see PR#259.
  (This note previously lived as an inert `_comment` key inside the yarn `resolutions` block; npm's `overrides` field
  rejects non-package-name keys, so it's been moved here instead.)
