import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const androidDir = join(root, "android");
const envPath = join(androidDir, ".keystore.env");
const bubbleHome = join(root, ".bubblewrap-home");
const configDir = join(bubbleHome, ".bubblewrap");
const configPath = join(configDir, "config.json");

if (!existsSync(join(androidDir, "twa-manifest.json"))) {
  throw new Error("Run npm run android:generate first");
}

if (!existsSync(envPath)) {
  throw new Error("Missing android/.keystore.env. Run npm run android:generate first.");
}

const envFile = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const config = {
  jdkPath: "/Library/Java/JavaVirtualMachines/zulu-17.jdk",
  androidSdkPath: [
    process.env.ANDROID_SDK_ROOT,
    process.env.ANDROID_HOME,
    "/Users/nikul/Library/Android/sdk",
  ].find((value) => value && existsSync(value)),
};

if (!config.androidSdkPath) {
  throw new Error("Android SDK not found. Set ANDROID_HOME.");
}

const { mkdirSync, writeFileSync } = await import("node:fs");
mkdirSync(configDir, { recursive: true });
writeFileSync(configPath, JSON.stringify(config, null, 2));

const result = spawnSync(
  process.execPath,
  [
    join(root, "node_modules/@bubblewrap/cli/bin/bubblewrap.js"),
    "build",
    "--skipPwaValidation",
  ],
  {
    cwd: androidDir,
    stdio: "inherit",
    env: {
      ...process.env,
      HOME: bubbleHome,
      JAVA_HOME: "/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home",
      ANDROID_HOME: config.androidSdkPath,
      ANDROID_SDK_ROOT: config.androidSdkPath,
      BUBBLEWRAP_KEYSTORE_PASSWORD: envFile.BUBBLEWRAP_KEYSTORE_PASSWORD,
      BUBBLEWRAP_KEY_PASSWORD: envFile.BUBBLEWRAP_KEY_PASSWORD,
    },
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("Upload this file to Play Console:");
console.log(join(androidDir, "app-release-bundle.aab"));
