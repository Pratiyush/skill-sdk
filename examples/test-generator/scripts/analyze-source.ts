/**
 * Analyze a TypeScript/JavaScript source file and extract exported signatures.
 * Run with: deno run --allow-read analyze-source.ts <file>
 */

interface FunctionInfo {
  name: string;
  params: string[];
  returnType: string;
  async: boolean;
  exported: boolean;
}

interface ClassInfo {
  name: string;
  methods: string[];
  exported: boolean;
}

interface AnalysisResult {
  file: string;
  functions: FunctionInfo[];
  classes: ClassInfo[];
}

function analyzeFile(filePath: string): AnalysisResult {
  const content = Deno.readTextFileSync(filePath);
  const lines = content.split("\n");

  const functions: FunctionInfo[] = [];
  const classes: ClassInfo[] = [];

  // Match exported functions: export function name(params): returnType
  // Also: export async function, export const name = (params) =>
  const funcRegex =
    /^(export\s+)?(async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^\s{]+))?\s*\{/;
  const arrowRegex =
    /^(export\s+)?(const|let)\s+(\w+)\s*=\s*(async\s+)?\(([^)]*)\)(?:\s*:\s*([^\s=]+))?\s*=>/;

  // Match exported classes
  const classRegex = /^(export\s+)?class\s+(\w+)/;
  const methodRegex =
    /^\s+(async\s+)?(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^\s{]+))?\s*\{/;

  let currentClass: ClassInfo | null = null;
  let braceDepth = 0;
  let inClass = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;

    // Check for function declarations
    const funcMatch = trimmed.match(funcRegex);
    if (funcMatch) {
      functions.push({
        name: funcMatch[3],
        params: funcMatch[4]
          ? funcMatch[4].split(",").map((p: string) => p.trim()).filter(Boolean)
          : [],
        returnType: funcMatch[5] || "void",
        async: !!funcMatch[2],
        exported: !!funcMatch[1],
      });
      continue;
    }

    // Check for arrow functions
    const arrowMatch = trimmed.match(arrowRegex);
    if (arrowMatch) {
      functions.push({
        name: arrowMatch[3],
        params: arrowMatch[5]
          ? arrowMatch[5].split(",").map((p: string) => p.trim()).filter(Boolean)
          : [],
        returnType: arrowMatch[6] || "void",
        async: !!arrowMatch[4],
        exported: !!arrowMatch[1],
      });
      continue;
    }

    // Check for class declarations
    const classMatch = trimmed.match(classRegex);
    if (classMatch) {
      currentClass = {
        name: classMatch[2],
        methods: [],
        exported: !!classMatch[1],
      };
      inClass = true;
      braceDepth = 0;
    }

    // Track braces for class scope
    if (inClass) {
      for (const ch of trimmed) {
        if (ch === "{") braceDepth++;
        if (ch === "}") braceDepth--;
      }

      // Check for methods inside class
      const methodMatch = line.match(methodRegex);
      if (methodMatch && currentClass && braceDepth >= 1) {
        const methodName = methodMatch[2];
        if (methodName !== "constructor") {
          currentClass.methods.push(methodName);
        }
      }

      if (braceDepth <= 0 && currentClass) {
        classes.push(currentClass);
        currentClass = null;
        inClass = false;
      }
    }
  }

  return { file: filePath, functions, classes };
}

// Main
const args = Deno.args;
if (args.length === 0 || args[0] === "--help") {
  console.error("Usage: deno run --allow-read analyze-source.ts <file>");
  Deno.exit(args.length === 0 ? 1 : 0);
}

const result = analyzeFile(args[0]);
console.log(JSON.stringify(result, null, 2));
