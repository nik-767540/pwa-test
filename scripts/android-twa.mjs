import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const {
  Config,
  ConsoleLog,
  DigitalAssetLinks,
  JdkHelper,
  KeyTool,
  TwaGenerator,
  TwaManifest,
} = require("@bubblewrap/core");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const androidDir = join(root, "android");
const manifestPath = join(androidDir, "twa-manifest.json");
const keystorePath = join(androidDir, "android.keystore");
const envPath = join(androidDir, ".keystore.env");
const webManifestUrl =
  "https://pwa-test-ochre-eight.vercel.app/manifest.webmanifest";
const packageId = "tech.mobifly.helloworldpwa";
const jdkPath = "/Library/Java/JavaVirtualMachines/zulu-17.jdk";
const androidSdkPath = [
  process.env.ANDROID_SDK_ROOT,
  process.env.ANDROID_HOME,
  "/Users/nikul/Library/Android/sdk",
].find((value) => value && existsSync(value));

if (!androidSdkPath) {
  throw new Error("Android SDK not found. Set ANDROID_HOME.");
}

function loadPasswords() {
  if (existsSync(envPath)) {
    const parsed = Object.fromEntries(
      readFileSync(envPath, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const index = line.indexOf("=");
          return [line.slice(0, index), line.slice(index + 1)];
        }),
    );
    return {
      password: parsed.BUBBLEWRAP_KEYSTORE_PASSWORD,
      keypassword: parsed.BUBBLEWRAP_KEY_PASSWORD,
    };
  }

  const password = randomBytes(18).toString("base64url");
  writeFileSync(
    envPath,
    `BUBBLEWRAP_KEYSTORE_PASSWORD=${password}\nBUBBLEWRAP_KEY_PASSWORD=${password}\n`,
    { mode: 0o600 },
  );
  return { password, keypassword: password };
}

function checksum(file) {
  return createHash("sha1").update(readFileSync(file)).digest("hex");
}

mkdirSync(androidDir, { recursive: true });
mkdirSync(join(root, "public/.well-known"), { recursive: true });

const twaManifest = await TwaManifest.fromWebManifest(webManifestUrl);
twaManifest.packageId = packageId;
twaManifest.signingKey = {
  path: "./android.keystore",
  alias: "android",
};

const invalid = twaManifest.validate();
if (invalid) {
  throw new Error(invalid);
}

await twaManifest.saveToFile(manifestPath);

const generator = new TwaGenerator();
const log = new ConsoleLog("android-twa");
await generator.createTwaProject(androidDir, twaManifest, log, () => {});
writeFileSync(join(androidDir, "manifest-checksum.txt"), checksum(manifestPath));

const config = new Config(jdkPath, androidSdkPath);
const keyTool = new KeyTool(new JdkHelper(process, config), log);
const passwords = loadPasswords();

if (!existsSync(keystorePath)) {
  await keyTool.createSigningKey({
    path: keystorePath,
    alias: "android",
    password: passwords.password,
    keypassword: passwords.keypassword,
    fullName: "Hello World PWA",
    organizationalUnit: "Engineering",
    organization: "Mobifly",
    country: "IN",
  });
}

const info = await keyTool.keyInfo({
  path: keystorePath,
  alias: "android",
  password: passwords.password,
  keypassword: passwords.keypassword,
});
const sha256 = info.fingerprints.get("SHA256");
if (!sha256) {
  throw new Error("Could not read the upload-key SHA-256 fingerprint");
}

twaManifest.fingerprints = [{ name: "upload", value: sha256 }];
await twaManifest.saveToFile(manifestPath);
writeFileSync(join(androidDir, "manifest-checksum.txt"), checksum(manifestPath));

const assetLinks = DigitalAssetLinks.generateAssetLinks(packageId, sha256);
writeFileSync(join(androidDir, "assetlinks.json"), assetLinks);
writeFileSync(join(root, "public/.well-known/assetlinks.json"), assetLinks);

console.log(`Package ID: ${packageId}`);
console.log(`Upload key SHA-256: ${sha256}`);
console.log("Wrote public/.well-known/assetlinks.json");
console.log("Keep android/.keystore.env and android/android.keystore private.");
