# Changelog

## 2.1.0
- Add PDC support in [#386](https://github.com/grafana/grafana-iot-twinmaker-app/pull/386)
- Update to aws-sdk-go-v2 and grafana-aws-sdk new style authentication in [#373](https://github.com/grafana/grafana-iot-twinmaker-app/pull/373)
- Dependency updates:
  - Bump the all-node-dependencies group across 1 directory with 30 updates in [#406](https://github.com/grafana/grafana-iot-twinmaker-app/pull/406)
  - Bump the all-go-dependencies group across 1 directory with 4 updates [#405](https://github.com/grafana/grafana-iot-twinmaker-app/pull/405)

## 2.0.2

- Dependency updates:
  - Bump the all-node-dependencies group with 10 updates in [#394](https://github.com/grafana/grafana-iot-twinmaker-app/pull/394)
  - Bump github.com/grafana/grafana-plugin-sdk-go from 0.277.0 to 0.277.1 in the all-go-dependencies group in [#393](https://github.com/grafana/grafana-iot-twinmaker-app/pull/393)
  - Bump the all-node-dependencies group across 1 directory with 31 updates in [#389](https://github.com/grafana/grafana-iot-twinmaker-app/pull/389)
  - Bump golang.org/x/net from 0.36.0 to 0.38.0 in the go_modules group in [#381](https://github.com/grafana/grafana-iot-twinmaker-app/pull/381)
  - Bump the all-go-dependencies group across 1 directory with 3 updates in [#387](https://github.com/grafana/grafana-iot-twinmaker-app/pull/387)

## 2.0.1

- Chore: add label to external contributions in [#358](https://github.com/grafana/grafana-iot-twinmaker-app/pull/358)
- Migrate dashboard utils to Scenes in [#383](https://github.com/grafana/grafana-iot-twinmaker-app/pull/383)
- Remove TwinmakerPanel query code in [#382](https://github.com/grafana/grafana-iot-twinmaker-app/pull/382)
- Update pr-commands.yml in [#391](https://github.com/grafana/grafana-iot-twinmaker-app/pull/391)
- Use vault to generate token in [#390](https://github.com/grafana/grafana-iot-twinmaker-app/pull/390)
- Update github actions files in [#388](https://github.com/grafana/grafana-iot-twinmaker-app/pull/388)
- Dependency updates:
  - Bump node dependencies in [#365](https://github.com/grafana/grafana-iot-twinmaker-app/pull/365), [#371](https://github.com/grafana/grafana-iot-twinmaker-app/pull/371), [#372](https://github.com/grafana/grafana-iot-twinmaker-app/pull/372), [#363](https://github.com/grafana/grafana-iot-twinmaker-app/pull/363), [#360](https://github.com/grafana/grafana-iot-twinmaker-app/pull/360), [#353](https://github.com/grafana/grafana-iot-twinmaker-app/pull/353)
  - Bump go dependencies in [#351](https://github.com/grafana/grafana-iot-twinmaker-app/pull/351), [#354](https://github.com/grafana/grafana-iot-twinmaker-app/pull/354), [#359](https://github.com/grafana/grafana-iot-twinmaker-app/pull/359), [#362](https://github.com/grafana/grafana-iot-twinmaker-app/pull/362), [#364](https://github.com/grafana/grafana-iot-twinmaker-app/pull/364), [#368](https://github.com/grafana/grafana-iot-twinmaker-app/pull/368), [#374](https://github.com/grafana/grafana-iot-twinmaker-app/pull/374)

## 2.0.0

- Migrate to plugin-ui from grafana/experimental in [#344](https://github.com/grafana/grafana-iot-twinmaker-app/pull/344)
- Dependabot config: Ignore react and react-dom major updates in [#331](https://github.com/grafana/grafana-iot-twinmaker-app/pull/331)
- Add e2e smoke tests in [#336](https://github.com/grafana/grafana-iot-twinmaker-app/pull/336)
- Dependency updates:
  - Bump github.com/grafana/grafana-plugin-sdk-go from 0.260.3 to 0.261.0 in the all-go-dependencies group in [#346](https://github.com/grafana/grafana-iot-twinmaker-app/pull/346)
  - Bumps the all-node-dependencies group with 21 updates in [#341](https://github.com/grafana/grafana-iot-twinmaker-app/pull/341)
  - Bump the npm_and_yarn group with 2 updates in [#330](https://github.com/grafana/grafana-iot-twinmaker-app/pull/330)
  - Bump golang.org/x/crypto from 0.29.0 to 0.31.0 in the go_modules group in [#329](https://github.com/grafana/grafana-iot-twinmaker-app/pull/329)
  - Bump the all-go-dependencies group across 1 directory with 2 updates in [#338](https://github.com/grafana/grafana-iot-twinmaker-app/pull/338)
  - Bump dompurify to 3.2.3 in [#349](https://github.com/grafana/grafana-iot-twinmaker-app/pull/349)

## 1.18.3

- Dependency updates:
  - Node in [#325](https://github.com/grafana/grafana-iot-twinmaker-app/pull/325), [#326](https://github.com/grafana/grafana-iot-twinmaker-app/pull/326), [#315](https://github.com/grafana/grafana-iot-twinmaker-app/pull/315), [#316](https://github.com/grafana/grafana-iot-twinmaker-app/pull/316), [#312](https://github.com/grafana/grafana-iot-twinmaker-app/pull/312):
    - actions/checkout@v3 to actions/checkout@v4
    - actions actions/setup-node@v3 to actions/setup-node@v4
    - Bump ws from 8.13.0 to 8.18.0
    - Bump micromatch from 4.0.5 to 4.0.8
    - Bump webpack from 5.93.0 to 5.94.0
    - @emotion/css from 11.11.2 to 11.13.5
    - @grafana/aws-sdk from 0.4.1 to 0.5.0
    - @grafana/data from 10.4.5 to 11.4.0
    - @grafana/experimental from 1.7.12 to 2.1.4
    - @grafana/runtime from 10.4.5 to 11.4.0
    - @grafana/schema from 10.4.5 to 11.4.0
    - @grafana/ui from 10.4.5 to 11.4.0
    - aws-sdk from 2.1450 to .0 2.1692.0
    - cytoscape from 3.26.0 to 3.30.4
    - react from 18.2.0 to 18.3.1
    - react-dom from 18.2.0 to 18.3.1
    - react-router-dom from 5.3.4 to 7.0.2
    - react-use from 17.5.0 to 17.5.1
    - tslib from 2.6.3 to 2.8.1
    - uuid from 8.3.2 to 11.0.3
    - @babel/core from 7.24.9 to 7.26.0
    - @grafana/eslint-config from 7.0.0 to 8.0.0
    - @grafana/tsconfig from 1.3.0- to rc1 2.0.0
    - @swc/core from 1.6.13 to 1.10.1
    - @swc/helpers from 0.5.12 to 0.5.15
    - @swc/jest from 0.2.36 to 0.2.37
    - @testing-library/dom from 10.3.2 to 10.4.0
    - @testing-library/jest-dom from 6.4.6 to 6.6.3
    - @types/testing-library\_\_jest-dom from 5.14.9 to 6.0.0
    - @testing-library/react from 16.0.0 to 16.1.0
    - @types/jest from 29.5.1 to 2 29.5.14
    - @types/node from 20.14. to 10 22.10.1
    - @types/three from 0.139. to 0 0.170.0
    - @types/three from 0.139. to 0 0.170.0
    - @types/uuid from 8.3.4 to 10.0.0
    - cspell from 8.11.0 to 8.16.1
    - eslint-plugin-prettier from 5.1.3 to 5.2.1
    - prettier from 3.3.3 to 3.4.2
    - sass from 1.77.8 to 1.82.0
    - sass-loader from 14.2.1 to 16.0.4
    - typescript from 5.5.3 to 5.7.2
    - webpack from 5.94.0 to 5.97.1
    - webpack-shell-plugin-next from 2.3.1 to 2.3.2
    - @types/lodash from 4.17.10 to 4.17.13
    - @grafana/plugin-sdk-go from v0.260.1 to v0.260.2
  - Go in [#324](https://github.com/grafana/grafana-iot-twinmaker-app/pull/324), [#327](https://github.com/grafana/grafana-iot-twinmaker-app/pull/327)
    - Updates github.com/aws/aws-sdk-go from 1.44.323 to 1.55.5
    - Updates github.com/grafana/grafana-aws-sdk from 0.20.0 to 0.31.4
    - Updates github.com/grafana/grafana-plugin-sdk-go from 0.240.0 to 0.258.0
    - Updates github.com/stretchr/testify from 1.9.0 to 1.10.0
    - Bump github.com/grafana/grafana-plugin-sdk-go from 0.258.0 to 0.260.1

## 1.18.2

- Upgrade IotAppKit dependency from [10.11.0 to 10.13.1](https://github.com/awslabs/iot-app-kit/compare/ts-config-v10.11.0...ts-config-v10.13.1)
- Adding basis universal transcoder to support DRACO compressed tiles [#321](https://github.com/grafana/grafana-iot-twinmaker-app/pull/321)
- Remove unused alarm panel [#307](https://github.com/grafana/grafana-iot-twinmaker-app/pull/307)
- Remove unused merge dashboard flow [#306](https://github.com/grafana/grafana-iot-twinmaker-app/pull/306)

## 1.18.1

- Bump fast-xml-parser dependency from [4.2.5 to 4.5.0](https://github.com/NaturalIntelligence/fast-xml-parser/compare/v4.2.5...v4.5.0)
- Resolve path-to-regexp dependency to [1.9.0](https://github.com/pillarjs/path-to-regexp/releases/tag/v1.9.0)

## 1.18.0

- Upgrade IotAppKit dependency from [10.8.1 to 10.11.0](https://github.com/awslabs/iot-app-kit/compare/root-v10.8.1...root-v10.11.0)

## 1.17.2

- Fix incorrect path for alarm configuration panel [#300](https://github.com/grafana/grafana-iot-twinmaker-app/pull/300)

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
