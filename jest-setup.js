// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';

window.HTMLMediaElement.prototype.load = () => {};
window.HTMLMediaElement.prototype.play = () => {};
window.HTMLMediaElement.prototype.pause = () => {};
window.HTMLMediaElement.prototype.addTextTrack = () => {};

window.URL.createObjectURL = function () {};
