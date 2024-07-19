# Changelog

## 1.17.1

- Chore: update dependencies [#293](https://github.com/grafana/grafana-iot-twinmaker-app/pull/293)

## 1.17.0

- fix(scene-viewer): Upgrade AppKit and UxSDK bundle for compatibility fix with Grafana runtime env [#291](https://github.com/grafana/grafana-iot-twinmaker-app/pull/291)
- Upgrade IotAppKit dependency from [10.6.1 to 10.8.1](https://github.com/awslabs/iot-app-kit/compare/root-v10.6.1...root-v10.8.1)
- [10.8.1](https://github.com/awslabs/iot-app-kit/compare/root-v10.8.0...root-v10.8.1) (2024-07-01)
- [10.8.0](https://github.com/awslabs/iot-app-kit/compare/root-v10.7.0...root-v10.8.0) (2024-06-24)
- [10.7.0](https://github.com/awslabs/iot-app-kit/compare/root-v10.6.1...root-v10.7.0) (2024-06-18)


## 1.16.0

- Use Grafana theme for config editor width in [#290](https://github.com/grafana/grafana-iot-twinmaker-app/pull/290)
- Migrate to new form styling in config and query editors in [#289](https://github.com/grafana/grafana-iot-twinmaker-app/pull/289)
- add nested plugin to app includes in [#288](https://github.com/grafana/grafana-iot-twinmaker-app/pull/288)
- Remove relative path info from executable field in [#282](https://github.com/grafana/grafana-iot-twinmaker-app/pull/282)

## 1.15.0

  - Support for [Dynamic Scenes](https://docs.aws.amazon.com/iot-twinmaker/latest/guide/dynamic-scenes.html)
  - Remove dummy cypress test and dependencies
  - Upgrade IotAppKit dependency from [10.2.0 to 10.6.1](https://github.com/awslabs/iot-app-kit/compare/root-v10.2.0...root-v10.6.1)
  - [10.6.1](https://github.com/awslabs/iot-app-kit/compare/root-v10.6.0...root-v10.6.1) (2024-06-13)
  - [10.6.0](https://github.com/awslabs/iot-app-kit/compare/root-v10.5.0...root-v10.6.0) (2024-06-06)
  - [10.5.0](https://github.com/awslabs/iot-app-kit/compare/root-v10.4.0...root-v10.5.0) (2024-05-30)
  - [10.4.0](https://github.com/awslabs/iot-app-kit/compare/root-v10.3.0...root-v10.4.0) (2024-05-20)
  - [10.3.0](https://github.com/awslabs/iot-app-kit/compare/root-v10.2.0...root-v10.3.0) (2024-05-10)

## 1.14.0

- New build for [security fixes in go 1.21.8](https://groups.google.com/g/golang-announce/c/5pwGVUPoMbg)

## 1.13.0

- Upgrade IotAppKit dependency from [9.6.0 to 10.2.0](https://github.com/awslabs/iot-app-kit/compare/root-v9.6.0...root-v10.2.0)
  - [10.2.0](https://github.com/awslabs/iot-app-kit/compare/root-v10.1.0...root-v10.2.0) (2024-03-29)
  - [10.1.0](https://github.com/awslabs/iot-app-kit/compare/root-v10.0.0...root-v10.1.0) (2024-03-21)
  - [10.0.0](https://github.com/awslabs/iot-app-kit/compare/root-v9.15.0...root-v10.0.0) (2024-02-28)
  - [9.15.0](https://github.com/awslabs/iot-app-kit/compare/root-v9.14.0...root-v9.15.0) (2024-02-01)
  - [9.14.0](https://github.com/awslabs/iot-app-kit/compare/root-v9.13.0...root-v9.14.0) (2024-01-18)
  - [9.13.0](https://github.com/awslabs/iot-app-kit/compare/root-v9.12.0...root-v9.13.0) (2024-01-05)
  - [9.12.0](https://github.com/awslabs/iot-app-kit/compare/root-v9.11.0...root-v9.12.0) (2023-12-18)
  - [9.11.0](https://github.com/awslabs/iot-app-kit/compare/root-v9.10.0...root-v9.11.0) (2023-12-07)
  - [9.10.0](https://github.com/awslabs/iot-app-kit/compare/root-v9.9.1...root-v9.10.0) (2023-12-07)
  - [9.9.1](https://github.com/awslabs/iot-app-kit/compare/root-v9.9.0...root-v9.9.1) (2023-12-06)
  - [9.9.0](https://github.com/awslabs/iot-app-kit/compare/root-v9.8.0...root-v9.9.0) (2023-12-05)
  - [9.8.0](https://github.com/awslabs/iot-app-kit/compare/root-v9.7.0...root-v9.8.0) (2023-11-25)
  - [9.7.0](https://github.com/awslabs/iot-app-kit/compare/root-v9.6.0...root-v9.7.0) (2023-11-21)

## 1.12.0

- Update grafana/aws-sdk-go to 0.20.0 in [#273](https://github.com/grafana/grafana-iot-twinmaker-app/pull/273)
- Upgrade UxSDK to add path query feature for query editor in [#272](https://github.com/grafana/grafana-iot-twinmaker-app/pull/272)

## 1.11.1

- Query Editor: Disable delete if only one filter, fix tooltip (new form styling) in [#268](https://github.com/grafana/grafana-iot-twinmaker-app/pull/268)
- GetPropertyValueHistory: Convert time objects to strings with nanosecond precision [#264](https://github.com/grafana/grafana-iot-twinmaker-app/pull/264)

## 1.11.0

- Support for new region cn-north-1 (BJS) in datasource

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
