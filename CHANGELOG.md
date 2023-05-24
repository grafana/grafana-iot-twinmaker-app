# Changelog

## v1.6.2
- Setting up sticky video controls for Video Player
- Error handling for Matterport scenes
- Auto collapse sidebar for Scene Viewer
- Fix usage of repeat template variables for Scene Viewer and Video Player panels
- Other minor bug fixes in Scene Viewer and Video Player panels

## 1.6.1

- Update grafana-aws-sdk version.
- Security: Upgrade Go in build process to 1.20.4
- Update grafana-plugin-sdk-go version to 0.161.0 to avoid a potential http header problem. https://github.com/grafana/athena-datasource/issues/233

## v1.6.0

- Launch Matterport integration in the Scene Viewer
- Support tag resize settings in the Scene Viewer
- Support data overlay widgets in the Scene Viewer

## v1.5.0

- Update backend dependencies

## v1.4.0

- Support for GovCloud region us-gov-west-1 (PDT) in datasource

## v1.3.2

- Fix tiles render issue in Scene Viewer

## v1.3.1

- Bug fixes in Scene Viewer and Alarm Configuration panel
- Support property display name in queries

## v1.3.0

- Launch Alarm Configuration Panel
- Launch Query Editor Panel
- Support querying Athena tabular connector through TwinMaker with Get Property Value
- Launch Scene Viewer features: camera view, scene hierarchy search, opacity shader, and sub-model selection
- Bug fixes in Scene Viewer and Video Player panels
- Upgraded Go AWS SDK
- The minimum Grafana version is now >=8.4

## v1.2.1

- Fix for pagination issue that lead to partial data on the dashboard
- Fix minor bugs with the Scene Viewer and Video Player panels

## v1.2.0

- Live time series history streaming
- Set max number of alarms to retrieve data for in the Get Alarms query
- Set propertyName using a template variable
- Avoid unnecessary panel refreshes on the dashboard
- Show Motion Indicator in the scene viewer
- Fixed Model Shader functionality in the scene viewer

## v1.1.2

- Increase the size and brightness of the tag selection graphic
- Color the outer circle to be blue for tags
- Make video tag consistent with other tags
- Black icon issue for tags in FireFox

## v1.1.1

- Fix bug in GetPropertyValue query to display multiple LIST property types
- Assume Role ARN is required to configure an IoT TwinMaker datasource
- Optimize alarm lookup

## v1.1.0

- Upgrade Go AWS SDK.
- Update aws-iot-twinmaker-grafana-utils package.
- Fix minor bugs with the datasource configuration page.

## v1.0.1

- Update aws-iot-twinmaker-grafana-utils package.
- Fix broken link on datasource configuration page.

## v1.0.0

- Initial release.
