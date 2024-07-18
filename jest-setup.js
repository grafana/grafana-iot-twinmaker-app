// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';

import { TextEncoder } from 'util';

window.HTMLMediaElement.prototype.load = () => {};
window.HTMLMediaElement.prototype.play = () => {};
window.HTMLMediaElement.prototype.pause = () => {};
window.HTMLMediaElement.prototype.addTextTrack = () => {};

window.URL.createObjectURL = function () {};
global.TextEncoder = TextEncoder;

// Used by LinkButton -> Text component from grafana/ui
global.ResizeObserver = class ResizeObserver {
  //callback: ResizeObserverCallback;

  constructor(callback) {
    setTimeout(() => {
      callback(
        [
          {
            contentRect: {
              x: 1,
              y: 2,
              width: 500,
              height: 500,
              top: 100,
              bottom: 0,
              left: 100,
              right: 0,
            },
            target: {},
          },
        ],
        this
      );
    });
  }
  observe() {}
  disconnect() {}
  unobserve() {}
};
