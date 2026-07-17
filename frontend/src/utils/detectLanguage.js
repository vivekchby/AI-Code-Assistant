const languageDetectors = [
  { name: "typescript", weight: 0, patterns: [/interface\s+\w+/m, /type\s+\w+\s*=/m, /:\s*(string|number|boolean|void|any|never|unknown)\b/m, /as\s+(const|string|number|boolean|any)/m, /readonly\s+/m, /:\s*(Record|Partial|Pick|Omit|Exclude|Extract)</m ] },
  { name: "javascript", weight: 0, patterns: [/=>/m, /const\s+\w+\s*=\s*(require|import)/m, /export\s+(default\s+)?/m, /import\s+.*\s+from\s+['"]/m, /\.(map|filter|reduce|forEach)\(/m, /useState|useEffect|useContext|useReducer/m, /require\(['"]/m ] },
  { name: "python", weight: 0, patterns: [/def\s+\w+\s*\(/m, /import\s+\w+/m, /from\s+\w+\s+import/m, /class\s+\w+:/m, /if\s+__name__\s*==\s*['"]__main__['"]/m, /print\s*\(/m, /elif\s+/m, /except\s+(Exception|\w+)?\s*as/m ] },
  { name: "java", weight: 0, patterns: [/public\s+(class|static|void|int|String|boolean)/m, /System\.(out|err)\./m, /private\s+(static\s+)?(int|String|boolean|void|double)/m, /protected\s+/m, /@(Override|Deprecated|SuppressWarnings)/m, /class\s+\w+\s*\{/m ] },
  { name: "cpp", weight: 0, patterns: [/#include\s*[<"]/m, /int\s+main\s*\(/m, /std::/m, /cout\s*<{2}/m, /cin\s*>{2}/m, /::\w+/m, /template\s*<.*>/m ] },
  { name: "c", weight: 0, patterns: [/#include\s*[<"]/m, /int\s+main\s*\(/m, /printf\s*\(/m, /scanf\s*\(/m, /#define\s+/m, /#ifndef\s+/m, /\bstruct\s+\w+/m ] },
  { name: "csharp", weight: 0, patterns: [/using\s+System/m, /namespace\s+\w+/m, /Console\.(WriteLine|ReadLine|Write|Read)/m, /class\s+\w+\s*(:\s+\w+)?\s*\{/m, /async\s+\w+/, /\bvar\s+\w+\s*=\s*/m ] },
  { name: "go", weight: 0, patterns: [/package\s+main/m, /func\s+\w+/m, /import\s+\(/m, /fmt\.\w+/m, /:=/m, /defer\s+/m, /go\s+\w+\(/m ] },
  { name: "rust", weight: 0, patterns: [/fn\s+\w+/m, /let\s+mut/m, /println!|print!/m, /impl\s+\w+/m, /pub\s+(fn|struct|enum|trait)/m, /\w+::\w+\(/m, /match\s+\w+\s*\{/m ] },
  { name: "php", weight: 0, patterns: [/<\?php/m, /\$\w+/m, /echo\s+/m, /function\s+\w+\(/m, /namespace\s+\w+/m, /use\s+\w+\\/m, /->/m ] },
  { name: "ruby", weight: 0, patterns: [/def\s+\w+/m, /end\b/m, /require\s+['"]/m, /attr_accessor|attr_reader|attr_writer/m, /class\s+\w+/m, /gem\s+/m, /do\s+\|/m ] },
  { name: "swift", weight: 0, patterns: [/import\s+(UIKit|SwiftUI|Foundation)/m, /func\s+\w+/m, /var\s+\w+:\s*\w+/m, /let\s+\w+:\s*\w+/m, /struct\s+\w+/m, /guard\s+let/m, /#available/m ] },
  { name: "kotlin", weight: 0, patterns: [/fun\s+\w+/m, /val\s+\w+/m, /var\s+\w+/m, /class\s+\w+/m, /import\s+\w+\./m, /@Composable/m, /private\s+(fun|val|var)/m ] },
  { name: "html", weight: 0, patterns: [/<!DOCTYPE\s+html>/im, /<html[\s>]/im, /<head[\s>]/im, /<body[\s>]/im, /<div[\s>]/im, /<\/\w+>/m, /<[a-z]+[\s>][^<]*>/im ] },
  { name: "css", weight: 0, patterns: [/\.\w+\s*\{/m, /#\w+\s*\{/m, /@media/m, /display:\s+\w+/m, /margin:\s+\d/m, /padding:\s+\d/m, /color:\s+/m, /@import/m ] },
  { name: "sql", weight: 0, patterns: [/SELECT\s+.+\s+FROM/im, /INSERT\s+INTO/im, /CREATE\s+TABLE/im, /ALTER\s+TABLE/im, /DROP\s+TABLE/im, /WHERE\s+\w+/im, /JOIN\s+\w+/im ] },
  { name: "bash", weight: 0, patterns: [/^#!/m, /export\s+\w+=/m, /echo\s+/m, /\$\{?\w+}?/m, /\$\s*\(/m, /if\s+\[/m, /fi\b/m ] },
  { name: "dart", weight: 0, patterns: [/void\s+main/m, /import\s+'package:/m, /class\s+\w+\s*(extends|implements)?/m, /final\s+\w+\s*=/m, /@override/m, /Widget\s+/m ] },
  { name: "lua", weight: 0, patterns: [/function\s+\w+\(/m, /local\s+\w+/m, /end\b/m, /--\[\[/m, /\w+\.\w+\s*\(/m ] },
  { name: "r", weight: 0, patterns: [/library\(/m, /<-/m, /data\.frame/m, /ggplot/m, /#.*$/m, /summary\(/m, /plot\(/m ] },
  { name: "haskell", weight: 0, patterns: [/module\s+\w+/m, /main\s*=\s*do/m, /::/m, /data\s+\w+/m, /pure\s+/m, />>=/m ] },
  { name: "perl", weight: 0, patterns: [/use\s+strict/m, /my\s+\$\w+/m, /sub\s+\w+/m, /=~/m, /print\s+/m, /@_/m ] },
  { name: "scala", weight: 0, patterns: [/object\s+\w+/m, /def\s+\w+/m, /val\s+\w+/m, /var\s+\w+/m, /case\s+class/m, /extends\s+\w+/m ] },
  { name: "powershell", weight: 0, patterns: [/\$[\w@]/m, /Write-(Host|Output|Error)/m, /Get-|Set-/m, /foreach\s*\(/m, /Param\(/m ] },
  { name: "matlab", weight: 0, patterns: [/function\s+\w+/m, /clear\s+all/m, /clc;/m, /plot\(/m, /%{/m, /\.\^/m ] },
];

export function detectLanguage(code) {
  if (!code || !code.trim()) return "plaintext";

  // Only check the first 5000 characters for performance
  const sample = code.slice(0, 5000);

  let bestLanguage = "plaintext";
  let bestScore = 0;

  for (const lang of languageDetectors) {
    let score = 0;
    for (const pattern of lang.patterns) {
      if (pattern.test(sample)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestLanguage = lang.name;
    }
  }

  return bestLanguage;
}

export const SUPPORTED_LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "dart", label: "Dart" },
  { value: "lua", label: "Lua" },
  { value: "r", label: "R" },
  { value: "haskell", label: "Haskell" },
  { value: "perl", label: "Perl" },
  { value: "scala", label: "Scala" },
  { value: "powershell", label: "PowerShell" },
  { value: "matlab", label: "MATLAB" },
];