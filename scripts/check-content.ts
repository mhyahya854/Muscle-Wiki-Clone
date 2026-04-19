import fs from "fs";
import path from "path";

// List of corrupted text markers commonly seen due to UTF-8 mojibake
const BAD_GLYPHS = ["Â", "â†’", "Ã", "ï¿½", "â€œ", "â€", "â€™"];

const TARGET_DIR = path.join(process.cwd(), "src/data/generated");

function checkContent(filePath: string) {
  let errors = 0;
  const content = fs.readFileSync(filePath, "utf-8");

  // Split into lines for better reporting
  const lines = content.split("\n");
  lines.forEach((line, index) => {
    BAD_GLYPHS.forEach((glyph) => {
      if (line.includes(glyph)) {
        console.error(`- [ERROR] Corrupted text found in: ${path.basename(filePath)}`);
        console.error(`  Line ${index + 1}: Contains bad glyph '${glyph}'`);
        errors++;
      }
    });
  });

  return errors;
}

function runCheck() {
  if (!fs.existsSync(TARGET_DIR)) {
    console.warn(
      `[WARNING] No generated data dir found at ${TARGET_DIR}. Did you run "npm run generate"?`,
    );
    process.exit(0);
  }

  let totalErrors = 0;
  const files = fs.readdirSync(TARGET_DIR).filter((file) => file.endsWith(".json"));

  console.log(`Scanning ${files.length} artifacts for content hygiene...`);

  for (const file of files) {
    totalErrors += checkContent(path.join(TARGET_DIR, file));
  }

  if (totalErrors > 0) {
    console.error(
      `\n[FAIL] Content check failed with ${totalErrors} errors. Clean the raw data and re-run "npm run generate".`,
    );
    process.exit(1); // Fail CI
  } else {
    console.log("\n[PASS] No bad glyphs or mojibake detected.");
    process.exit(0);
  }
}

runCheck();
