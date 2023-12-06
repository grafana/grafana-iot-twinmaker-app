# Changelog

## 1.10.1

- Fixed scene loading issue for Grafana version 9.x and below

## 1.10.0

- Config editor: Fix workspace loading in new form styling in [#258](https://github.com/grafana/grafana-iot-twinmaker-app/pull/258)
- Add ramda 0.27.2 to resolutions in [#256](https://github.com/grafana/grafana-iot-twinmaker-app/pull/256)
- Query editor: Migrate to new form styling under feature toggle in [#249](https://github.com/grafana/grafana-iot-twinmaker-app/pull/249)
- Config editor: Migrate to new form styling under feature toggle in [#244](https://github.com/grafana/grafana-iot-twinmaker-app/pull/244)

## 1.9.3

- Upgrade IotAppKit dependency from 9.2.0 to 9.6.0
  - Support Auto Query and Tag Occlusion in Scene Viewer panel
  - Fix toggle playback mode functionality and reflect time range changes in Video Player panel
  - Minor bug fixes related to tags, Custom styled tags, overlay and synced Matterport tags
- Upgrade three-stdlib dependency from 2.17.3 to 2.23.9
- Upgrade fast-xml-parser dependency from to 4.2.5

## 1.9.2

- Bump go.opentelemetry.io/contrib/instrumentation/net/http/httptrace/otelhttptrace from 0.42.0 to 0.44.0 by @dependabot in https://github.com/grafana/grafana-iot-twinmaker-app/pull/237
- Fix imported Alarm Dashboard's filter value from string to struct by @fridgepoet in https://github.com/grafana/grafana-iot-twinmaker-app/pull/240
- Bump @babel/traverse from 7.22.15 to 7.23.2 by @dependabot in https://github.com/grafana/grafana-iot-twinmaker-app/pull/241
- Bump google.golang.org/grpc from 1.58.2 to 1.58.3 by @dependabot in https://github.com/grafana/grafana-iot-twinmaker-app/pull/242

## 1.9.1

- Support for custom style for tags in the Scene Viewer panel
- Other minor bug fixes in the Scene Viewer panel

## 1.9.0

- Support for new regions ap-south-1 (BOM), ap-northeast-1 (NRT), & ap-northeast-2 (ICN) in datasource
- Fix to allow custom cell types to display images
- Fix to load a scene with Matterport space in the scene viewer

## 1.8.1

- Wrap QueryEditor panel plugin in CustomScrollbar to fix scrolling behavior in [#223](https://github.com/grafana/grafana-iot-twinmaker-app/pull/223)

## 1.8.0

- Upgrade plugin dependencies to React 18 and iot-app-kit@7 in [#212](https://github.com/grafana/grafana-iot-twinmaker-app/pull/212)
- Update grafana-aws-sdk to v0.19.2

## 1.7.1

- Update @grafana/aws-sdk frontend package to fix a bug with a future feature called temporary credentials
- Fix 'invalid url' when endpoint is empty string

## 1.7.0

- Update grafana-aws-sdk to v0.19.1

## v1.6.3

- fix visibility of data overlays on parent objects
- add entity binding support
- fix raycast issues
- add support for selection events on data overlays

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
