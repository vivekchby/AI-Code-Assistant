/**
 * Complexity Analysis Service
 *
 * Computes code complexity metrics including:
 * - Cyclomatic Complexity
 * - Function Complexity
 * - File Complexity
 * - Number of Functions
 * - Number of Classes
 * - Lines of Code
 *
 * Works for JavaScript/TypeScript with full analysis.
 * For other languages, provides basic line counts.
 */

// ─────────────────────────────────────────────
// Language support
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Tokenizer helpers
// ─────────────────────────────────────────────

/**
 * Remove string literals and template literals from code
 * so we don't count keywords inside strings.
 */
const removeStrings = (code) => {
  return code
    // Remove single-quoted strings
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, '""')
    // Remove double-quoted strings
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '""')
    // Remove template literals (backtick strings)
    .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, "``")
    // Remove regex literals
    .replace(/\/[^\/\\]*(?:\\.[^\/\\]*)*\/[gimsuy]*/g, "/regex/");
};

/**
 * Remove comments from code
 */
const removeComments = (code) => {
  return code
    // Remove single-line comments
    .replace(/\/\/.*$/gm, "")
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "");
};

/**
 * Clean code: remove strings, comments for analysis
 */
const cleanCode = (code) => {
  return removeStrings(removeComments(code));
};

// ─────────────────────────────────────────────
// Line counting
// ─────────────────────────────────────────────

const countLines = (code) => {
  const lines = code.split("\n");
  const totalLines = lines.length;

  // Count blank lines
  const blankLines = lines.filter((line) => line.trim() === "").length;

  // Count comment-only lines
  const commentLines = lines.filter((line) => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*/") ||
      trimmed.startsWith("#")
    );
  }).length;

  const codeLines = totalLines - blankLines - commentLines;

  return {
    totalLines,
    codeLines,
    blankLines,
    commentLines,
  };
};

// ─────────────────────────────────────────────
// Function detection
// ─────────────────────────────────────────────

const detectFunctions = (code) => {
  const cleaned = cleanCode(code);
  const functions = [];

  // Match function declarations: function name(params) {
  const funcDeclRegex = /function\s+([a-zA-Z_$][\w$]*)\s*\(/g;
  let match;
  while ((match = funcDeclRegex.exec(cleaned)) !== null) {
    functions.push({
      name: match[1],
      type: "declaration",
      startLine: getLineNumber(code, match.index),
    });
  }

  // Match arrow functions assigned to variables/const: const name = (params) => {
  const arrowFuncRegex = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*{/g;
  while ((match = arrowFuncRegex.exec(cleaned)) !== null) {
    functions.push({
      name: match[1],
      type: "arrow",
      startLine: getLineNumber(code, match.index),
    });
  }

  // Match arrow functions with single param without parens: const name = param => {
  const arrowFuncNoParensRegex = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:async\s*)?([a-zA-Z_$][\w$]*)\s*=>\s*{/g;
  while ((match = arrowFuncNoParensRegex.exec(cleaned)) !== null) {
    // Avoid double-counting
    const alreadyExists = functions.some(
      (f) => f.name === match[1] && f.type === "arrow"
    );
    if (!alreadyExists) {
      functions.push({
        name: match[1],
        type: "arrow",
        startLine: getLineNumber(code, match.index),
      });
    }
  }

  // Match method definitions in classes/objects: methodName(params) {
  // Collect all already-detected function names to avoid duplicates
  const detectedNames = new Set(
    functions
      .filter((f) => f.type !== "anonymous")
      .map((f) => `${f.name}:${f.startLine}`)
  );

  const methodRegex = /([a-zA-Z_$][\w$]*)\s*\([^)]*\)\s*{/g;
  while ((match = methodRegex.exec(cleaned)) !== null) {
    // Exclude keywords that look like methods
    const keywords = [
      "if", "else", "for", "while", "do", "switch", "catch",
      "function", "return", "typeof", "instanceof", "void",
      "delete", "throw", "import", "export", "default",
      "async", "await", "yield", "new", "this", "super",
    ];
    if (!keywords.includes(match[1])) {
      // Check if this is likely a method (preceded by something that makes it a method)
      const before = cleaned.slice(Math.max(0, match.index - 40), match.index);
      const isMethod =
        /[\.\s]\s*$/.test(before) &&
        !/\bfunction\s+$/.test(before); // avoid matching function declarations

      if (isMethod) {
        // Skip if this name+line already detected as a function declaration
        const key = `${match[1]}:${getLineNumber(code, match.index)}`;
        if (!detectedNames.has(key)) {
          functions.push({
            name: match[1],
            type: "method",
            startLine: getLineNumber(code, match.index),
          });
        }
      }
    }
  }

  // Match anonymous functions: function(params) {
  const anonFuncRegex = /function\s*\([^)]*\)\s*{/g;
  while ((match = anonFuncRegex.exec(cleaned)) !== null) {
    functions.push({
      name: "(anonymous)",
      type: "anonymous",
      startLine: getLineNumber(code, match.index),
    });
  }

  // Match exported functions: export function name
  const exportFuncRegex = /export\s+(?:default\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/g;
  while ((match = exportFuncRegex.exec(cleaned)) !== null) {
    const alreadyExists = functions.some(
      (f) => f.name === match[1] && f.type === "declaration"
    );
    if (!alreadyExists) {
      functions.push({
        name: match[1],
        type: "declaration",
        startLine: getLineNumber(code, match.index),
      });
    }
  }

  // Match arrow functions as exports: export const name = (params) => {
  const exportArrowRegex = /export\s+(?:default\s+)?(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:async\s*)?\(/g;
  while ((match = exportArrowRegex.exec(cleaned)) !== null) {
    const alreadyExists = functions.some(
      (f) => f.name === match[1] && (f.type === "arrow" || f.type === "declaration")
    );
    if (!alreadyExists) {
      functions.push({
        name: match[1],
        type: "arrow",
        startLine: getLineNumber(code, match.index),
      });
    }
  }

  return functions;
};

// ─────────────────────────────────────────────
// Class detection
// ─────────────────────────────────────────────

const detectClasses = (code) => {
  const cleaned = cleanCode(code);
  const classes = [];

  // Match class declarations: class Name {
  const classRegex = /class\s+([a-zA-Z_$][\w$]*)/g;
  let match;
  while ((match = classRegex.exec(cleaned)) !== null) {
    classes.push({
      name: match[1],
      startLine: getLineNumber(code, match.index),
    });
  }

  // Match class expressions: const Name = class {
  const classExprRegex = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*class\b/g;
  while ((match = classExprRegex.exec(cleaned)) !== null) {
    classes.push({
      name: match[1],
      startLine: getLineNumber(code, match.index),
    });
  }

  // Match export class: export class Name {
  const exportClassRegex = /export\s+(?:default\s+)?class\s+([a-zA-Z_$][\w$]*)/g;
  while ((match = exportClassRegex.exec(cleaned)) !== null) {
    const alreadyExists = classes.some((c) => c.name === match[1]);
    if (!alreadyExists) {
      classes.push({
        name: match[1],
        startLine: getLineNumber(code, match.index),
      });
    }
  }

  return classes;
};

// ─────────────────────────────────────────────
// Cyclomatic complexity calculation
// ─────────────────────────────────────────────

const calculateCyclomaticComplexity = (code) => {
  const cleaned = cleanCode(code);
  let complexity = 1; // Base complexity

  // Count decision points

  // if statements (including else if)
  const ifMatches = cleaned.match(/\bif\s*\(/g);
  if (ifMatches) complexity += ifMatches.length;

  // else if counts as an additional branch (already counted by 'if' above)
  // but 'else' without 'if' also adds a branch
  const elseMatches = cleaned.match(/\belse\s*[^{]/g);
  if (elseMatches) complexity += elseMatches.length;

  // for loops
  const forMatches = cleaned.match(/\bfor\s*\(/g);
  if (forMatches) complexity += forMatches.length;

  // while loops
  const whileMatches = cleaned.match(/\bwhile\s*\(/g);
  if (whileMatches) complexity += whileMatches.length;

  // do-while loops
  const doMatches = cleaned.match(/\bdo\s*{/g);
  if (doMatches) complexity += doMatches.length;

  // switch cases (each case adds a branch)
  const caseMatches = cleaned.match(/\bcase\s+/g);
  if (caseMatches) complexity += caseMatches.length;

  // catch blocks
  const catchMatches = cleaned.match(/\bcatch\s*\(/g);
  if (catchMatches) complexity += catchMatches.length;

  // ternary operators
  const ternaryMatches = cleaned.match(/\?\s*[^:;]+\s*:/g);
  if (ternaryMatches) complexity += ternaryMatches.length;

  // Logical operators && and || (each adds a path)
  const andMatches = cleaned.match(/&&/g);
  if (andMatches) complexity += andMatches.length;

  const orMatches = cleaned.match(/\|\|/g);
  if (orMatches) complexity += orMatches.length;

  return complexity;
};

// ─────────────────────────────────────────────
// Per-function complexity analysis
// ─────────────────────────────────────────────

const analyzeFunctionComplexity = (code) => {
  const functions = detectFunctions(code);
  const lines = code.split("\n");

  return functions.map((func) => {
    // Extract the function body to calculate its complexity
    // We'll use a simpler approach: get a slice of code around the function
    const startIdx = getCodeIndex(code, func.startLine);
    if (startIdx === -1) {
      return {
        ...func,
        complexity: 1,
        lines: 0,
      };
    }

    // Find the function body by looking for the opening brace
    const funcCode = code.slice(startIdx);
    const braceMatch = funcCode.match(/{/);
    if (!braceMatch) {
      return {
        ...func,
        complexity: 1,
        lines: 0,
      };
    }

    // Extract a reasonable chunk for complexity analysis
    // (up to 200 lines or until we hit a matching closing brace)
    const bodyStart = startIdx + braceMatch.index;
    let depth = 0;
    let bodyEnd = bodyStart;
    let inString = false;
    let stringChar = null;

    for (let i = bodyStart; i < code.length && i - bodyStart < 10000; i++) {
      const ch = code[i];

      if (inString) {
        if (ch === "\\") {
          i++; // skip escaped char
          continue;
        }
        if (ch === stringChar) {
          inString = false;
        }
        continue;
      }

      if (ch === '"' || ch === "'" || ch === "`") {
        inString = true;
        stringChar = ch;
        continue;
      }

      if (ch === "{") {
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0) {
          bodyEnd = i + 1;
          break;
        }
      }
    }

    const bodyCode = code.slice(bodyStart, bodyEnd);
    const bodyLines = bodyCode.split("\n").filter((l) => l.trim()).length;

    return {
      ...func,
      complexity: calculateCyclomaticComplexity(bodyCode),
      lines: bodyLines,
    };
  });
};

// ─────────────────────────────────────────────
// Helper: get line number from index
// ─────────────────────────────────────────────

const getLineNumber = (code, index) => {
  return code.slice(0, index).split("\n").length;
};

const getCodeIndex = (code, lineNumber) => {
  const lines = code.split("\n");
  let idx = 0;
  for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
    idx += lines[i].length + 1; // +1 for newline
  }
  return idx;
};

const getFunctionRegex = (language) => {
  switch (language) {
    case "java":
      return /(public|private|protected)?\s*(static\s+)?[\w<>\[\]]+\s+\w+\s*\([^)]*\)\s*\{/g;

    case "python":
    case "py":
      return /def\s+\w+\s*\([^)]*\)\s*:/g;

    case "c":
    case "cpp":
    case "c++":
      return /\b(?:int|void|float|double|char|bool|string)\s+\w+\s*\([^)]*\)\s*\{/g;

    case "csharp":
    case "c#":
      return /(public|private|protected)?\s*(static\s+)?[\w<>\[\]]+\s+\w+\s*\([^)]*\)\s*\{/g;

    case "go":
      return /func\s+\w+\s*\([^)]*\)/g;

    case "php":
      return /function\s+\w+\s*\([^)]*\)/g;

    default:
      return /function\s+\w+\s*\(/g;
  }
};

const getClassRegex = (language) => {
  switch (language) {
    case "python":
    case "py":
      return /class\s+\w+\s*(\(|:)/g;

    case "go":
      return /type\s+\w+\s+struct/g;

    default:
      return /\bclass\s+\w+/g;
  }
};

const JS_LANGUAGES = [
  "javascript",
  "typescript",
  "js",
  "ts",
  "jsx",
  "tsx",
  "node",
];

// ─────────────────────────────────────────────
// Main analysis function
// ─────────────────────────────────────────────

const analyzeComplexity = (code, language = "javascript") => {
  const isJS = JS_LANGUAGES.includes(language?.toLowerCase());

  const lang = language?.toLowerCase() || "javascript";

  // Basic line counts (always available)
  const lineCounts = countLines(code);

  if (!isJS) {
    const functionRegex = getFunctionRegex(lang);

    const classRegex = getClassRegex(lang);

    const functions = code.match(functionRegex) || [];

    const classes = code.match(classRegex) || [];

    const fileComplexity = calculateCyclomaticComplexity(code);

    return {
      linesOfCode: lineCounts,
      functions,
      classes,
      functionCount: functions.length,
      classCount: classes.length,
      cyclomaticComplexity: fileComplexity,
      averageFunctionComplexity:
        functions.length > 0
          ? Math.round(fileComplexity / functions.length)
          : fileComplexity,
      highestFunctionComplexity: fileComplexity,
      fileComplexity,
      complexityRating: getComplexityRating(fileComplexity, functions.length),
      functionComplexities: [],
    };
  }

  // Full analysis for JS/TS
  const functions = detectFunctions(code);
  const classes = detectClasses(code);
  const functionComplexities = analyzeFunctionComplexity(code, functions);
  const fileComplexity = calculateCyclomaticComplexity(code);

  // Calculate function metrics
  const complexities = functionComplexities.map((f) => f.complexity);
  const avgComplexity =
    complexities.length > 0
      ? Math.round(
          (complexities.reduce((a, b) => a + b, 0) / complexities.length) * 10
        ) / 10
      : 0;
  const maxComplexity = complexities.length > 0 ? Math.max(...complexities) : 0;

  // Determine complexity rating
  const rating = getComplexityRating(fileComplexity, functions.length);

  return {
    linesOfCode: lineCounts,
    functions,
    classes,
    functionCount: functions.length,
    classCount: classes.length,
    cyclomaticComplexity: fileComplexity,
    averageFunctionComplexity: avgComplexity,
    highestFunctionComplexity: maxComplexity,
    fileComplexity,
    complexityRating: rating,
    functionComplexities,
  };
};

// ─────────────────────────────────────────────
// Complexity rating
// ─────────────────────────────────────────────

const getComplexityRating = (complexity, functionCount) => {
  // Based on McCabe's thresholds and function count
  if (complexity <= 10 && functionCount <= 10) return "Low";
  if (complexity <= 20 && functionCount <= 20) return "Moderate";
  if (complexity <= 40 && functionCount <= 30) return "High";
  if (complexity <= 60) return "Very High";
  return "Extreme";
};

module.exports = analyzeComplexity;