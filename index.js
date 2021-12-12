const { nativeTheme } = require("electron");

let _app;
let _unload;

function syncTheme() {
  const isDark = nativeTheme.shouldUseDarkColors;
  const { config, plugins } = _app;

  const { darkTheme, lightTheme } = config.getConfig();

  const enableTheme = isDark ? darkTheme : lightTheme;
  const disableTheme = !isDark ? darkTheme : lightTheme;

  let update = false;
  const { plugins: current } = config.getPlugins();
  if (!current.includes(enableTheme)) {
    current.push(enableTheme);
    update = true;
  }
  if (current.includes(disableTheme)) {
    current.splice(current.indexOf(disableTheme), 1);
    update = true;
  }
  if (update) {
    console.info("Syncing theme with color scheme", {
      isDark,
      plugins: current,
    });
    plugins.updatePlugins();
  }
}

exports.onApp = (app) => {
  _app = app;

  const { darkTheme, lightTheme } = app.config.getConfig();
  if (!darkTheme || !lightTheme) {
    throw new Error(
      "Need to specify `darkTheme` and `lightTheme` properties in config"
    );
  }

  syncTheme();
  const configUnsub = app.config.subscribe(syncTheme);
  nativeTheme.on("updated", syncTheme);

  _unload = () => {
    configUnsub();
    nativeTheme.off("updated", syncTheme);
  };
};

exports.onUnload = (app) => {
  _unload();
};
