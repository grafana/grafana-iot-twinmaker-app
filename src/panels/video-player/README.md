# AWS IoT TwinMaker Video Player Panel

![video](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/VideoPlayerPanel.png)

Image: TwinMaker Video Player panel with an example video of a cookie factory.

## Setup

![video-edit](https://github.com/grafana/grafana-iot-twinmaker-app/raw/main/docs/EditVideoPlayer.png)

Image: edit panel page for the Video Player

To set up your Video Player panel (numbers reference the image above):

1. Create a new panel on your dashboard, then search for and select "AWS IoT TwinMaker Video Player" on the Visualizations list.

2. Select an AWS IoT TwinMaker datasource in the panel options.

3. Enter an Amazon Kinesis video stream name

- If you skip step 4 then the Video Player will load available video from your stream but it will not have a custom time scrubber

4. Enter the entityId and componentName of an AWS IoT TwinMaker component with a video component

- You do not need to enter the Amazon Kinesis video stream name in step 3 since the Video Player can find the video stream name associated with your AWS IoT TwinMaker component

Click "Apply" then save your dashboard.

## Custom time scubber

Available video:

- Time range highlighted in blue has video available for playback
- Selecting a time that is not blue will show an error screen that video is not available

Playback mode:

- Switch between LIVE and ON_DEMAND mode by clicking the "Live" button
- LIVE: live video will be requested from Amazon Kinesis Video Streams, will fail if no video is available. Ignores the Grafana time range
- ON_DEMAND: video will be requested from Amazon Kinesis Video Streams with the time range set on the dashboard
  - Limitation: cannot playback video for more than a 24 hour time range

## Request video upload

- Video may be stored on your edge connector but not yet uploaded to Amazon Kinesis Video Streams. To upload available video to Amazon Kinesis Video Streams you can select a time range and click the "Request Video" button. Refresh the dashboard after some time (~10 seconds) to see the video available for playback.
