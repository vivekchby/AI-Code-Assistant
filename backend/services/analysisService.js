const { ESLint } = require("eslint");

const JS_LANGUAGES = [
  "javascript",
  "typescript",
  "js",
  "ts",
  "jsx",
  "tsx",
  "node",
];

const SUPPORTED_LANGUAGES = [
  ...JS_LANGUAGES,
  "plaintext",
  "java",
  "python",
  "py",
  "c",
  "cpp",
  "c++",
  "csharp",
  "c#",
  "go",
  "php",
];

const createIssue = (
  line,
  severity,
  ruleId,
  message,
  column = 1
) => ({
  line,
  column,
  severity,
  ruleId,
  message,
});

const basicAnalysis = (
  code,
  language
) => {
  const issues = [];
  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const lineNo = index + 1;
    const trimmed = line.trim();

    // Long line
    if (line.length > 120) {
      issues.push(
        createIssue(
          lineNo,
          1,
          "long-line",
          "Line exceeds 120 characters."
        )
      );
    }

    // TODO
    if (/TODO|FIXME/i.test(trimmed)) {
      issues.push(
        createIssue(
          lineNo,
          1,
          "todo-comment",
          "TODO/FIXME comment found."
        )
      );
    }

    // Tabs
    if (line.includes("\t")) {
      issues.push(
        createIssue(
          lineNo,
          1,
          "tab-indentation",
          "Tab indentation detected."
        )
      );
    }

    const TRAILING_WHITESPACE_LANGUAGES = [
  "javascript",
  "typescript",
  "js",
  "ts",
  "jsx",
  "tsx",
  "python",
  "py",
  "go",
  "php"
];

if (
  TRAILING_WHITESPACE_LANGUAGES.includes(language) &&
  /\s+$/.test(line) &&
  trimmed !== ""
) {
  issues.push(
    createIssue(
      lineNo,
      0,
      "trailing-whitespace",
      "Trailing whitespace detected."
    )
  );
}


    // Empty line spam
    if (
      trimmed === "" &&
      lines[index + 1]?.trim() === ""
    ) {
      issues.push(
        createIssue(
          lineNo,
          0,
          "multiple-blank-lines",
          "Multiple consecutive blank lines."
        )
      );
    }

    // Explicit boolean comparisons
    if (
      /==\s*true|==\s*false|!=\s*true|!=\s*false/.test(
        trimmed
      )
    ) {
      issues.push(
        createIssue(
          lineNo,
          1,
          "boolean-comparison",
          "Avoid explicit comparison with true/false."
        )
      );
    }

    // Empty catch block
    if (
      trimmed.includes("catch") &&
      lines[index + 1]?.trim() === "}"
    ) {
      issues.push(
        createIssue(
          lineNo,
          2,
          "empty-catch",
          "Empty catch block."
        )
      );
    }

    // Console logs
    if (
      [
        "javascript",
        "typescript",
        "js",
        "ts",
        "jsx",
        "tsx",
      ].includes(language)
    ) {
      if (trimmed.includes("console.log")) {
        issues.push(
          createIssue(
            lineNo,
            1,
            "console-log",
            "console.log statement found."
          )
        );
      }
    }

    // Java/C/C++
    if (
      [
        "java",
        "c",
        "cpp",
        "c++",
        "csharp",
        "c#",
      ].includes(language)
    ) {
      if (
        trimmed.includes(
          "System.out.println"
        ) ||
        trimmed.includes("printf(")
      ) {
        issues.push(
          createIssue(
            lineNo,
            1,
            "debug-print",
            "Debug print statement found."
          )
        );
      }
    }

    // Python
    if (
      ["python", "py"].includes(
        language
      )
    ) {
      if (trimmed.includes("print(")) {
        issues.push(
          createIssue(
            lineNo,
            1,
            "debug-print",
            "Debug print statement found."
          )
        );
      }
    }

    // Go
    if (language === "go") {
      if (
        trimmed.includes(
          "fmt.Println"
        )
      ) {
        issues.push(
          createIssue(
            lineNo,
            1,
            "debug-print",
            "Debug print statement found."
          )
        );
      }
    }

    // PHP
    if (language === "php") {
      if (
        trimmed.includes("var_dump(") ||
        trimmed.includes("print_r(")
      ) {
        issues.push(
          createIssue(
            lineNo,
            1,
            "debug-print",
            "Debug print statement found."
          )
        );
      }
    }
  });

  return issues;
};

// Cache the ESLint instance to avoid re-creating it on every request.
const eslint = new ESLint();

const analyzeCode = async (
  code,
  language = "javascript"
) => {
  const lang =
    language?.toLowerCase() ||
    "plaintext";

  if (
    !SUPPORTED_LANGUAGES.includes(
      lang
    )
  ) {
    return [];
  }

  // JavaScript / TypeScript
  if (
    JS_LANGUAGES.includes(lang)
  ) {
    try {
      const results =
        await eslint.lintText(code);

      const eslintIssues =
        (
          results[0]?.messages ||
          []
        )
          .filter(
            (msg) => !msg.fatal
          )
          .map((msg) => ({
            line: msg.line,
            column: msg.column,
            endLine: msg.endLine,
            endColumn:
              msg.endColumn,
            severity:
              msg.severity,
            ruleId:
              msg.ruleId ||
              "eslint",
            message:
              msg.message,
          }));

      const customIssues =
        basicAnalysis(
          code,
          lang
        );

      return [
        ...eslintIssues,
        ...customIssues,
      ];
    } catch (err) {
      console.log(
        "ESLint Error:",
        err.message
      );

      return basicAnalysis(
        code,
        lang
      );
    }
  }

  // Other languages
  return basicAnalysis(
    code,
    lang
  );
};

module.exports = analyzeCode;