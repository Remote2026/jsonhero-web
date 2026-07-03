/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildTarget: "node-cjs",
  serverBuildPath: "build/index.js",
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: [".*"],
};
