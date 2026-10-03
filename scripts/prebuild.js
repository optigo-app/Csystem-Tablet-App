const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(__dirname, "../package.json");
const versionJsonPath = path.join(
  __dirname,
  "../src/components/AccountCenter/tabs/version.json",
);

try {
  // 1. Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // 2. Determine and increment version
  let currentVersion = packageJson.version || "4.0.0";
  // If version is 0.1.0, let's bump it directly to 4.0.0 for the start of this system
  if (currentVersion === "0.1.0") {
    currentVersion = "4.0.0";
  }

  let parts = currentVersion.split(".");
  if (parts.length === 3) {
    const patch = parseInt(parts[2], 10);
    parts[2] = isNaN(patch) ? 0 : patch + 1;
  } else {
    parts = ["4", "0", "0"];
  }
  const newVersion = parts.join(".");

  // Update package.json
  packageJson.version = newVersion;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, "\t") + "\n",
    "utf8",
  );

  // 3. Write version.json for SupportTab to import
  const versionData = {
    version: `v${newVersion}`,
  };
  const versionDir = path.dirname(versionJsonPath);
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true });
  }
  fs.writeFileSync(
    versionJsonPath,
    JSON.stringify(versionData, null, 2),
    "utf8",
  );

  console.log(`[Version Control] Bumped version to ${newVersion}`);
} catch (error) {
  console.error("[Version Control] Error running prebuild version bump:", error);
  process.exit(1);
}
