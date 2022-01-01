"use babel";

import { CompositeDisposable } from "atom";

let helpers;
let path;

export function loadDeps() {
  if (!helpers) {
    helpers = require("atom-linter");
  }
  if (!path) {
    path = require("path");
  }
}

export default {
  activate(state) {
    this.idleCallbacks = new Set();
    let depsCallbackID;
    const installLinterDeps = () => {
      this.idleCallbacks.delete(depsCallbackID);
      if (!atom.inSpecMode()) {
        require("atom-package-deps").install("linter-tlint");
      }
      loadDeps();
    };
    depsCallbackID = window.requestIdleCallback(installLinterDeps);
    this.idleCallbacks.add(depsCallbackID);

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.config.observe("linter-tlint.executablePath", (value) => {
        this.executablePath = value;
      }),
      atom.config.observe("linter-tlint.autoExecutableSearch", (value) => {
        this.autoExecutableSearch = value;
      }),
      atom.config.observe("linter-tlint.disableWhenNoConfigFile", (value) => {
        this.disableWhenNoConfigFile = value;
      })
    );
  },

  deactivate() {
    this.idleCallbacks.forEach((callbackID) =>
      window.cancelIdleCallback(callbackID)
    );
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: "tlint",
      grammarScopes: ["text.html.php", "source.php"],
      scope: "file",
      lintsOnChange: false,
      lint: async (textEditor) => {
        const filePath = textEditor.getPath();
        const fileText = textEditor.getText();
        // project path? (for resolving config and executable)

        if (fileText === "" || !filePath) {
          // Empty file, empty results
          return [];
        }

        loadDeps();
        const fileDir = path.dirname(filePath);

        let executable = this.executablePath;
        // Check if a local tlint executable is available
        if (this.autoExecutableSearch === true) {
          const projExecutable = await helpers.findCachedAsync(fileDir, [
            "vendor/bin/tlint",
          ]);

          if (projExecutable !== null) {
            executable = projExecutable;
          }
        }

        // Check if we should stop linting when no config file could be
        // found
        if (
          this.disableWhenNoConfigFile &&
          !(await helpers.findAsync(fileDir, ["tlint.json"]))
        ) {
          return [];
        }

        // tlint cli parameters
        const parameters = ["lint", "--json", filePath];

        // PHPStan exec options
        const execOptions = {
          cwd: fileDir,
          timeout: 1000 * 60 * 2, // ms * s * m: 2 minutes
          throwOnStderr: true,
          ignoreExitCode: true,
        };

        // Execute tlint
        const results = await helpers.exec(executable, parameters, execOptions);

        if (results === null) {
          // Our specific spawn was terminated by a newer call, tell
          // Linter not to update messages
          return null;
        }

        if (textEditor.getText() !== fileText) {
          // Contents have changed, tell Linter not to update results
          return null;
        }

        return JSON.parse(results).errors.map((e) => ({
          severity: "error",
          location: {
            file: filePath,
            position: helpers.generateRange(textEditor, e.line - 1),
          },
          excerpt: `${e.source}${e.message}`,
        }));
      },
    };
  },
};
