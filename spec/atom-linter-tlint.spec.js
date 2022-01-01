"use babel";

import * as path from "path";
import linter, { loadDeps } from "../lib/main";

const { lint } = linter.provideLinter();

describe("The tlint provider for Linter", () => {
  beforeEach(async () => {
    atom.workspace.destroyActivePaneItem();
    await atom.packages.activatePackage("linter-tlint");
    await atom.packages.activatePackage("language-php");
    loadDeps();
  });

  it("should be in the packages list", () => {
    expect(atom.packages.isPackageLoaded("linter-tlint")).toBe(true);
  });

  it("should be an active package", () => {
    expect(atom.packages.isPackageActive("linter-tlint")).toBe(true);
  });

  describe("checks use.php and", () => {
    let editor = null;
    let usePath = path.join(__dirname, "fixtures", "use.php");
    beforeEach(async () => {
      editor = await atom.workspace.open(usePath);
    });

    it("verifies the results", async () => {
      const messages = await lint(editor);
      expect(messages.length).toBe(3);

      expect(messages[0].severity).toBe("error");
      expect(messages[0].description).not.toBeDefined();
      expect(messages[0].excerpt).toBe(
        "" +
          "AlphabeticalImports" +
          "! Imports should be ordered alphabetically."
      );
      expect(messages[0].location.file).toBe(usePath);
      expect(messages[0].location.position).toEqual([
        [2, 0],
        [2, 6],
      ]);

      expect(messages[1].severity).toBe("error");
      expect(messages[1].description).not.toBeDefined();
      expect(messages[1].excerpt).toBe(
        "" + "NoUnusedImports" + "! There should be no unused imports."
      );
      expect(messages[1].location.file).toBe(usePath);
      expect(messages[1].location.position).toEqual([
        [2, 0],
        [2, 6],
      ]);

      expect(messages[2].severity).toBe("error");
      expect(messages[2].description).not.toBeDefined();
      expect(messages[2].excerpt).toBe(
        "" + "NoUnusedImports" + "! There should be no unused imports."
      );
      expect(messages[2].location.file).toBe(usePath);
      expect(messages[2].location.position).toEqual([
        [3, 0],
        [3, 6],
      ]);
    });
  });
});
