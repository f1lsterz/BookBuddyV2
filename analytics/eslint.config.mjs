import { createNestEslintConfig } from "../tooling/eslint/nest.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));
export default createNestEslintConfig(tsconfigRootDir);
