import { pathToFileURL } from "node:url";
import { ENV_SPEC } from "./env-spec.mjs";

/**
 * Reports which environment variables are missing for a given build stage.
 * Values are never printed, only names.
 */
export function checkEnv(env, stage = 0, spec = ENV_SPEC) {
  const missing = [];
  const optionalMissing = [];

  for (const variable of spec) {
    if (variable.stage > stage) continue;

    const value = env[variable.name];
    if (typeof value === "string" && value.trim() !== "") continue;

    const isRequired =
      typeof variable.required === "function"
        ? variable.required(env, stage)
        : variable.required;
    (isRequired ? missing : optionalMissing).push(variable);
  }

  return { ok: missing.length === 0, missing, optionalMissing };
}

function parseStage(argv) {
  const index = argv.indexOf("--stage");
  if (index === -1) return 0;
  const stage = Number(argv[index + 1]);
  if (!Number.isInteger(stage) || stage < 0 || stage > 11) {
    console.error("--stage must be a whole number from 0 to 11.");
    process.exit(2);
  }
  return stage;
}

function printGroup(title, variables) {
  if (variables.length === 0) return;
  console.log(`\n${title}`);
  for (const v of variables) {
    const tag = v.secret ? " (secret)" : "";
    console.log(`  ${v.name}${tag}\n    ${v.description}`);
  }
}

function main() {
  const stage = parseStage(process.argv.slice(2));
  const result = checkEnv(process.env, stage);

  console.log(`Environment check for stage ${stage}`);
  printGroup("Missing and required:", result.missing);
  printGroup("Missing but optional:", result.optionalMissing);

  if (result.ok) {
    console.log("\nAll required variables for this stage are set.");
    return;
  }
  console.error(
    `\n${result.missing.length} required variable(s) missing. Copy .env.example to .env.local and fill them in.`,
  );
  process.exit(1);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
