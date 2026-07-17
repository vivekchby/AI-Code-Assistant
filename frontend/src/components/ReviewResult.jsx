import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBug,
  FaRobot,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaChevronRight,
  FaCode,
  FaHashtag,
  FaFileAlt,
  FaShieldAlt,
  FaLightbulb,
  FaLock,
  FaRocket,
  FaTools,
  FaFlask,
  FaGavel,
  FaChartBar,
  FaCodeBranch,
  FaLayerGroup,
  FaBookOpen,
  FaCube,
} from "react-icons/fa";

// ─────────────────────────────────────────────
// Severity config
// ─────────────────────────────────────────────
const SEVERITY = {
  2: {
    label: "Error",
    color: "red",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
    ring: "ring-red-200",
    icon: FaTimesCircle,
    bar: "bg-red-500",
  },
  1: {
    label: "Warning",
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700",
    ring: "ring-amber-200",
    icon: FaExclamationTriangle,
    bar: "bg-amber-400",
  },
  0: {
    label: "Info",
    color: "gray",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-600",
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-600",
    ring: "ring-gray-200",
    icon: FaBug,
    bar: "bg-gray-400",
  },
};

const SEVERITY_ORDER = [2, 1, 0];

// ─────────────────────────────────────────────
// Score ring component (pure SVG)
// ─────────────────────────────────────────────
const ScoreRing = ({ score, size = 140 }) => {
  const normalizedScore = Math.min(Math.max(Number(score) || 0, 0), 100);
  const r = 56;
  const circ = 2 * Math.PI * r;
  const filled = (normalizedScore / 100) * circ;
  const strokeColor =
    normalizedScore >= 80 ? "#10B981" : normalizedScore >= 50 ? "#F59E0B" : "#EF4444";
  const label = normalizedScore >= 80 ? "Excellent" : normalizedScore >= 50 ? "Needs work" : "Poor";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 140 140" className="transform -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#F3F4F6" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: strokeColor }}>{normalizedScore}</span>
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Horizontal bar segment (pure CSS)
// ─────────────────────────────────────────────
const SeverityBar = ({ counts }) => {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  const segments = SEVERITY_ORDER
    .map((sev) => ({ ...SEVERITY[sev], count: counts[sev] || 0 }))
    .filter((s) => s.count > 0);

  return (
    <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
      {segments.map((s) => (
        <div
          key={s.label}
          className={s.bar}
          style={{ width: `${(s.count / total) * 100}%` }}
          title={`${s.label}: ${s.count}`}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// AI Review Section – Parses markdown into cards
// ─────────────────────────────────────────────
// Single source of truth for all section types
const SECTION_DEFS = [
  // Overview sub-sections (appear before numbered items)
  { key: "summary",    icon: FaBookOpen,            label: "Summary",              keywords: ["summary", "overview", "introduction", "general"],                bg: "bg-indigo-50",   border: "border-indigo-200",   iconColor: "text-indigo-500",   iconBg: "bg-indigo-100",   dotColor: "bg-indigo-400" },
  { key: "strengths",  icon: FaRocket,              label: "Strengths",            keywords: ["strength", "positive", "good", "well done"],                      bg: "bg-emerald-50",  border: "border-emerald-200",  iconColor: "text-emerald-500",  iconBg: "bg-emerald-100",  dotColor: "bg-emerald-400" },
  { key: "weaknesses",  icon: FaExclamationTriangle, label: "Areas for Improvement", keywords: ["weakness", "concern", "area for improvement", "improvement area"], bg: "bg-rose-50",     border: "border-rose-200",     iconColor: "text-rose-500",     iconBg: "bg-rose-100",     dotColor: "bg-rose-400" },
  { key: "findings",   icon: FaSearch,              label: "Key Findings",         keywords: ["key finding", "finding", "main finding", "critical finding"],       bg: "bg-sky-50",      border: "border-sky-200",      iconColor: "text-sky-500",      iconBg: "bg-sky-100",     dotColor: "bg-sky-400" },
  { key: "architecture", icon: FaCodeBranch,        label: "Architecture & Design", keywords: ["architecture", "structure", "design", "pattern"],                  bg: "bg-violet-50",   border: "border-violet-200",   iconColor: "text-violet-500",   iconBg: "bg-violet-100",  dotColor: "bg-violet-400" },
  { key: "quality",    icon: FaCheckCircle,         label: "Code Quality",         keywords: ["code quality", "quality", "maintainability", "readability"],        bg: "bg-emerald-50",  border: "border-emerald-200",  iconColor: "text-emerald-500",  iconBg: "bg-emerald-100",  dotColor: "bg-emerald-400" },
  // Review sections (numbered 1-7)
  { key: "bug",          icon: FaBug,             label: "Bugs",               keywords: ["bug"],                                        bg: "bg-red-50",     border: "border-red-200",     iconColor: "text-red-500",     iconBg: "bg-red-100",     dotColor: "bg-red-400" },
  { key: "security",     icon: FaLock,            label: "Security Issues",    keywords: ["security", "vulnerability"],                  bg: "bg-orange-50",  border: "border-orange-200",  iconColor: "text-orange-500",  iconBg: "bg-orange-100",  dotColor: "bg-orange-400" },
  { key: "performance",  icon: FaRocket,          label: "Performance",        keywords: ["performance", "speed", "slow"],               bg: "bg-blue-50",    border: "border-blue-200",    iconColor: "text-blue-500",    iconBg: "bg-blue-100",    dotColor: "bg-blue-400" },
  { key: "practice",     icon: FaGavel,           label: "Best Practices",     keywords: ["best practice", "best practice"],              bg: "bg-purple-50",  border: "border-purple-200",  iconColor: "text-purple-500",  iconBg: "bg-purple-100",  dotColor: "bg-purple-400" },
  { key: "smell",        icon: FaFlask,           label: "Code Smells",        keywords: ["code smell", "smell"],                         bg: "bg-rose-50",    border: "border-rose-200",    iconColor: "text-rose-500",    iconBg: "bg-rose-100",    dotColor: "bg-rose-400" },
  { key: "optimization", icon: FaTools,           label: "Optimizations",      keywords: ["optimization", "optimize", "optimisation"],    bg: "bg-cyan-50",    border: "border-cyan-200",    iconColor: "text-cyan-500",    iconBg: "bg-cyan-100",    dotColor: "bg-cyan-400" },
  { key: "suggestion",   icon: FaLightbulb,       label: "Suggestions",        keywords: ["suggestion", "recommend", "improve"],          bg: "bg-teal-50",    border: "border-teal-200",    iconColor: "text-teal-500",    iconBg: "bg-teal-100",    dotColor: "bg-teal-400" },
  { key: "score",        icon: FaCheckCircle,     label: "Score",              keywords: ["score", "rating"],                             bg: "bg-emerald-50", border: "border-emerald-200", iconColor: "text-emerald-500", iconBg: "bg-emerald-100", dotColor: "bg-emerald-400" },
];

const cleanItemText = (text) =>
  text
    .replace(/^#+\s*/, "")
    .replace(/^[-*•]\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .replace(/`/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .trim();

const findSectionDef = (heading) => {
  const lower = heading.toLowerCase();
  return SECTION_DEFS.find((def) => def.keywords.some((kw) => lower.includes(kw)));
};

const AIReviewSection = ({ review, complexity }) => {
  const sections = useMemo(() => {
    if (!review) return [];

    const cleaned = review
      .replace(/CORRECTED_CODE_START[\s\S]*?CORRECTED_CODE_END/i, "")
      .replace(/^\s*OVERALL_SCORE\s*:\s*\d{1,3}\s*$/im, "")
      .trim();

    const lines = cleaned.split("\n");
    const parsed = [];
    let current = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (current) current.content += "\n";
        continue;
      }

      const hMatch = trimmed.match(
        /^(?:#+\s*)?(?:\d+[.)]\s*)?\*{0,2}([A-Za-z][A-Za-z\s/]+?)\*{0,2}:?\s*$/i
      );
      if (hMatch) {
        const def = findSectionDef(hMatch[1].trim());
        if (def) {
          if (current) parsed.push(current);
          current = { key: def.key, label: def.label, content: "" };
          continue;
        }
      }

      const iMatch = trimmed.match(/^(\d+)[.)]\s+\*{0,2}([A-Za-z][A-Za-z\s/]+?)\*{0,2}:?/i);
      if (iMatch) {
        const def = findSectionDef(iMatch[2].trim());
        if (def) {
          if (current) parsed.push(current);
          current = {
            key: def.key,
            label: def.label,
            content: trimmed.slice(iMatch[0].length).trim() || "",
          };
          continue;
        }
      }

      if (current) {
        current.content += trimmed + "\n";
      } else {
        if (!parsed.length || parsed[0].key !== "summary") {
          parsed.unshift({ key: "summary", label: "Summary", content: trimmed + "\n" });
        } else {
          parsed[0].content += trimmed + "\n";
        }
      }
    }

    if (current) parsed.push(current);

    const result = parsed
      .filter((s) => s.content.trim())
      .map((s) => ({ ...s, content: s.content.trim() }));

    // Inject complexity metrics as a dedicated section card
    if (complexity) {
      const { linesOfCode, functionCount, classCount, cyclomaticComplexity, averageFunctionComplexity, highestFunctionComplexity, complexityRating } = complexity;
      const lines = [];
      if (linesOfCode) lines.push(`Total Lines: ${linesOfCode.totalLines || 0} (Code: ${linesOfCode.codeLines || 0}, Blank: ${linesOfCode.blankLines || 0}, Comments: ${linesOfCode.commentLines || 0})`);
      lines.push(`Functions: ${functionCount || 0} | Classes: ${classCount || 0}`);
      lines.push(`Cyclomatic Complexity: ${cyclomaticComplexity || 0} (${complexityRating || "N/A"})`);
      lines.push(`Avg Function Complexity: ${averageFunctionComplexity || 0} | Highest: ${highestFunctionComplexity || 0}`);
      result.unshift({
        key: "complexity",
        label: "Complexity Analysis",
        content: lines.join("\n"),
      });
    }

    return result;
  }, [review, complexity]);

  if (sections.length === 0) return null;

  const complexityDef = { key: "complexity", icon: FaLayerGroup, label: "Complexity Analysis", bg: "bg-violet-50", iconBg: "bg-violet-100", iconColor: "text-violet-500", dotColor: "bg-violet-400" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
          <FaRobot className="text-white" size={12} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">AI Code Review</h3>
          <p className="text-[11px] text-gray-400">{sections.length} section{sections.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {sections.map((section, idx) => {
          const def = section.key === "complexity" ? complexityDef : (SECTION_DEFS.find((d) => d.key === section.key) || SECTION_DEFS.find((d) => d.key === "suggestion"));
          const Icon = def.icon;
          const items = section.content.split("\n").map(cleanItemText).filter(Boolean);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className={`px-5 py-4 ${def.bg}`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${def.iconBg}`}>
                  <Icon className={def.iconColor} size={13} />
                </div>
                <h4 className="text-sm font-semibold text-gray-800">{section.label}</h4>
              </div>
              <div className="ml-9 space-y-2">
                {items.length <= 1 ? (
                  <p className="text-sm text-gray-600 leading-relaxed">{items[0] || section.content}</p>
                ) : (
                  items
                    .filter((item) => item.length > 2)
                    .slice(0, 15)
                    .map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${def.dotColor}`} />
                        <p className="text-sm text-gray-600 leading-relaxed">{item}</p>
                      </div>
                    ))
                )}
              </div>
              {items.length > 1 && (
                <div className="ml-9 mt-2">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {items.filter((i) => i.length > 2).length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Complexity Analysis Section
// ─────────────────────────────────────────────
const ComplexitySection = ({ complexity }) => {
  if (!complexity) return null;

  const {
    linesOfCode,
    functionCount,
    classCount,
    cyclomaticComplexity,
    averageFunctionComplexity,
    highestFunctionComplexity,
    complexityRating,
    functionComplexities,
  } = complexity;

  // Color for complexity rating
  const ratingColors = {
    Low: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-400" },
    Moderate: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", badge: "bg-blue-100 text-blue-700", bar: "bg-blue-400" },
    High: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", badge: "bg-amber-100 text-amber-700", bar: "bg-amber-400" },
    "Very High": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", badge: "bg-orange-100 text-orange-700", bar: "bg-orange-400" },
    Extreme: { bg: "bg-red-50", border: "border-red-200", text: "text-red-600", badge: "bg-red-100 text-red-700", bar: "bg-red-500" },
    "N/A": { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500", badge: "bg-gray-100 text-gray-500", bar: "bg-gray-300" },
  };

  const ratingStyle = ratingColors[complexityRating] || ratingColors["N/A"];

  // Gauge-like visualization for cyclomatic complexity
  const complexityPercent = Math.min((cyclomaticComplexity / 60) * 100, 100);

  // Complexity bar color
  const getComplexityBarColor = (value) => {
    if (value <= 5) return "bg-emerald-400";
    if (value <= 10) return "bg-blue-400";
    if (value <= 20) return "bg-amber-400";
    if (value <= 30) return "bg-orange-400";
    return "bg-red-500";
  };

  // Format function type for display
  const formatType = (type) => {
    switch (type) {
      case "declaration": return "fn";
      case "arrow": return "=>";
      case "method": return "method";
      case "anonymous": return "anon";
      default: return type;
    }
  };

  // Sort function complexities by complexity (highest first)
  const sortedFunctions = [...(functionComplexities || [])].sort(
    (a, b) => b.complexity - a.complexity
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-sm">
          <FaChartBar className="text-white" size={12} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Complexity Analysis</h3>
          <p className="text-[11px] text-gray-400">
            Cyclomatic complexity & code structure metrics
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Metric cards row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Lines of Code */}
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <FaBookOpen className="mx-auto text-gray-400 mb-1" size={14} />
            <p className="text-lg font-bold text-gray-700">{linesOfCode?.totalLines || 0}</p>
            <p className="text-[10px] text-gray-400 font-medium">Total Lines</p>
          </div>

          {/* Code Lines */}
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <FaCode className="mx-auto text-gray-400 mb-1" size={14} />
            <p className="text-lg font-bold text-gray-700">{linesOfCode?.codeLines || 0}</p>
            <p className="text-[10px] text-gray-400 font-medium">Code Lines</p>
          </div>

          {/* Functions */}
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <FaCodeBranch className="mx-auto text-gray-400 mb-1" size={14} />
            <p className="text-lg font-bold text-gray-700">{functionCount}</p>
            <p className="text-[10px] text-gray-400 font-medium">Functions</p>
          </div>

          {/* Classes */}
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <FaCube className="mx-auto text-gray-400 mb-1" size={14} />
            <p className="text-lg font-bold text-gray-700">{classCount}</p>
            <p className="text-[10px] text-gray-400 font-medium">Classes</p>
          </div>

          {/* Cyclomatic Complexity */}
          <div className={`rounded-xl p-3 text-center border ${ratingStyle.border} ${ratingStyle.bg}`}>
            <FaLayerGroup className={`mx-auto mb-1 ${ratingStyle.text}`} size={14} />
            <p className={`text-lg font-bold ${ratingStyle.text}`}>{cyclomaticComplexity}</p>
            <p className="text-[10px] font-medium">Complexity</p>
          </div>

          {/* Rating Badge */}
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100 flex flex-col items-center justify-center">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${ratingStyle.badge}`}>
              {complexityRating}
            </span>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Rating</p>
          </div>
        </div>

        {/* ── Line breakdown ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center border border-emerald-100">
            <p className="text-sm font-bold text-emerald-600">{linesOfCode?.codeLines || 0}</p>
            <p className="text-[10px] text-emerald-500 font-medium">Code</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-2 text-center border border-gray-100">
            <p className="text-sm font-bold text-gray-600">{linesOfCode?.blankLines || 0}</p>
            <p className="text-[10px] text-gray-400 font-medium">Blank</p>
          </div>
          <div className="bg-blue-50 rounded-xl px-3 py-2 text-center border border-blue-100">
            <p className="text-sm font-bold text-blue-600">{linesOfCode?.commentLines || 0}</p>
            <p className="text-[10px] text-blue-500 font-medium">Comments</p>
          </div>
        </div>

        {/* ── Cyclomatic Complexity Gauge ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <FaLayerGroup className="text-gray-400" size={12} />
              <span className="text-xs font-semibold text-gray-600">Cyclomatic Complexity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-gray-700">{cyclomaticComplexity}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ratingStyle.badge}`}>
                {complexityRating}
              </span>
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getComplexityBarColor(cyclomaticComplexity)}`}
              style={{ width: `${complexityPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-400">
            <span>Low (1)</span>
            <span>Moderate (10)</span>
            <span>High (20)</span>
            <span>Extreme (60+)</span>
          </div>
        </div>

        {/* ── Function complexity breakdown ── */}
        {sortedFunctions.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <FaCodeBranch className="text-gray-400" size={12} />
              <span className="text-xs font-semibold text-gray-600">
                Function Complexity
                <span className="text-gray-400 font-normal ml-1">
                  (avg {averageFunctionComplexity}, max {highestFunctionComplexity})
                </span>
              </span>
            </div>

            <div className="space-y-2">
              {sortedFunctions.slice(0, 10).map((func, idx) => {
                const maxComplexity = Math.max(...sortedFunctions.map((f) => f.complexity), 1);
                const barWidth = (func.complexity / Math.max(maxComplexity, 10)) * 100;
                const barColor = getComplexityBarColor(func.complexity);
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500 w-2 text-right">{idx + 1}</span>
                    <code className="text-[11px] font-mono text-gray-600 truncate flex-1 min-w-0" title={func.name}>
                      {func.name}
                    </code>
                    <span className={`text-[9px] font-mono px-1 py-0.5 rounded bg-gray-100 text-gray-500`}>
                      {formatType(func.type)}
                    </span>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${Math.min(barWidth, 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-gray-600 w-5 text-right">
                      {func.complexity}
                    </span>
                  </div>
                );
              })}
              {sortedFunctions.length > 10 && (
                <p className="text-[10px] text-gray-400 text-center pt-1">
                  +{sortedFunctions.length - 10} more function{sortedFunctions.length - 10 !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── McCabe scale reference ── */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-[10px] text-gray-400 font-medium mb-1.5">McCabe Complexity Scale</p>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { label: "1-10: Low", color: "bg-emerald-100 text-emerald-700" },
              { label: "11-20: Moderate", color: "bg-blue-100 text-blue-700" },
              { label: "21-40: High", color: "bg-amber-100 text-amber-700" },
              { label: "41-60: Very High", color: "bg-orange-100 text-orange-700" },
              { label: "60+: Extreme", color: "bg-red-100 text-red-700" },
            ].map((item, i) => (
              <span key={i} className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${item.color}`}>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
const ReviewResult = ({ issues, aiReview, score, complexity }) => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  // ── Derived data ──
  const stats = useMemo(() => {
    const counts = { 2: 0, 1: 0, 0: 0 };
    const byRule = {};
    const byLine = {}; 

    issues.forEach((i) => {
      counts[i.severity] = (counts[i.severity] || 0) + 1;
      const rule = i.ruleId || "unknown";
      if (!byRule[rule]) byRule[rule] = { count: 0, severity: i.severity };
      byRule[rule].count += 1;
      if (i.severity > byRule[rule].severity) byRule[rule].severity = i.severity;

      const line = i.line || 0;
      if (!byLine[line]) byLine[line] = { count: 0, severity: 0 };
      byLine[line].count += 1;
      if (i.severity > byLine[line].severity) byLine[line].severity = i.severity;
    });

    const topRules = Object.entries(byRule)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 6);

    const lineEntries = Object.entries(byLine)
      .sort(([a], [b]) => Number(a) - Number(b));

    return { counts, topRules, lineEntries, total: issues.length };
  }, [issues]);

  const filtered = useMemo(() => {
    if (!search) return issues;
    const q = search.toLowerCase();
    return issues.filter(
      (i) =>
        (i.message || "").toLowerCase().includes(q) ||
        (i.ruleId || "").toLowerCase().includes(q)
    );
  }, [issues, search]);

  const toggleExpand = (idx) => setExpanded(expanded === idx ? null : idx);

  return (
    <div className="mt-8 space-y-6">
      {/* ── Header: Score + Summary ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ScoreRing score={score} />

          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
              <p className="text-2xl font-bold text-red-600">{stats.counts[2]}</p>
              <p className="text-xs text-red-500 font-medium">Errors</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
              <p className="text-2xl font-bold text-amber-600">{stats.counts[1]}</p>
              <p className="text-xs text-amber-500 font-medium">Warnings</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-2xl font-bold text-gray-600">{stats.counts[0]}</p>
              <p className="text-xs text-gray-500 font-medium">Info</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-xs text-blue-500 font-medium">Total</p>
            </div>
          </div>
        </div>

        {stats.total > 0 && (
          <div className="mt-5">
            <SeverityBar counts={stats.counts} />
            <div className="flex justify-between mt-1.5 text-[11px] text-gray-400">
              <span>0%</span>
              <span className="flex gap-3">
                {SEVERITY_ORDER.map((s) => {
                  const sev = SEVERITY[s];
                  const count = stats.counts[s] || 0;
                  return count > 0 ? (
                    <span key={s} className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                      {sev.label} ({count})
                    </span>
                  ) : null;
                })}
              </span>
              <span>100%</span>
            </div>
          </div>
        )}
      </motion.div>

      {stats.total > 0 && (
        <>
          {/* ── Two-column insight row ── */}
          <div className="grid grid-cols-1 gap-5">
            {stats.topRules.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FaCode className="text-gray-400" size={14} />
                  <h3 className="text-sm font-semibold text-gray-700">Most violated rules</h3>
                </div>
                <div className="space-y-2.5">
                  {stats.topRules.map(([rule, data]) => {
                    const maxCount = stats.topRules[0][1].count;
                    const pct = (data.count / maxCount) * 100;
                    const sev = SEVERITY[data.severity] || SEVERITY[0];
                    return (
                      <div key={rule}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono text-gray-600 truncate max-w-[70%]">{rule}</span>
                          <span className="font-semibold text-gray-500">{data.count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${sev.bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {stats.lineEntries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FaHashtag className="text-gray-400" size={14} />
                  <h3 className="text-sm font-semibold text-gray-700">Issue density by line</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {stats.lineEntries.map(([line, data]) => {
                    const sev = SEVERITY[data.severity] || SEVERITY[0];
                    const intensity = Math.min(data.count / 3, 1);
                    const opacity = 0.3 + intensity * 0.7;
                    return (
                      <div
                        key={line}
                        className={`px-2 py-1 rounded-lg text-xs font-mono border ${sev.border} ${sev.bg}`}
                        style={{ opacity }}
                        title={`Line ${line}: ${data.count} issue${data.count > 1 ? "s" : ""}`}
                      >
                        <span className={sev.text}>{line}</span>
                        {data.count > 1 && (
                          <span className={`ml-1 font-bold ${sev.text}`}>×{data.count}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Issues list ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaShieldAlt className="text-gray-400" size={13} />
                Issues
                <span className="text-gray-400 font-normal">({filtered.length})</span>
              </div>
              <div className="relative w-56">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12} />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 bg-gray-50"
                />
              </div>
            </div>

            <AnimatePresence>
              {filtered.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">
                  No issues match your search.
                </div>
              ) : (
                filtered.map((issue, idx) => {
                  const sev = SEVERITY[issue.severity] || SEVERITY[0];
                  const Icon = sev.icon;
                  const isExpanded = expanded === idx;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.015 }}
                    >
                      <button
                        onClick={() => toggleExpand(idx)}
                        className={`w-full text-left px-5 py-3 flex items-start gap-3 transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-0 ${sev.bg} ${isExpanded ? "bg-opacity-60" : "bg-opacity-0"}`}
                      >
                        <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${sev.badge}`}>
                          <Icon size={11} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium leading-snug ${sev.text}`}>
                              {issue.message}
                            </p>
                            <FaChevronRight
                              size={10}
                              className={`text-gray-300 mt-1 flex-shrink-0 transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${sev.badge}`}>
                              {sev.label}
                            </span>
                            {issue.ruleId && (
                              <code className="text-[11px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                {issue.ruleId}
                              </code>
                            )}
                            {issue.line && (
                              <span className="text-[11px] font-mono text-gray-400">
                                Line {issue.line}{issue.column ? `:${issue.column}` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                              <div className="flex items-start gap-3">
                                <FaFileAlt className="text-gray-300 mt-0.5" size={12} />
                                <div className="text-xs text-gray-500 space-y-1.5">
                                  <div>
                                    <span className="font-medium text-gray-600">Rule: </span>
                                    <code className="font-mono text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                                      {issue.ruleId || "—"}
                                    </code>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600">Location: </span>
                                    <span className="font-mono">
                                      Line {issue.line || "—"}, Column {issue.column || "—"}
                                    </span>
                                  </div>
                                  {issue.endLine && (
                                    <div>
                                      <span className="font-medium text-gray-600">Ends at: </span>
                                      <span className="font-mono">
                                        Line {issue.endLine}, Column {issue.endColumn || "—"}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium text-gray-600">Severity: </span>
                                    <span className={`font-semibold ${sev.text}`}>{sev.label}</span>
                                    <span className={`ml-2 inline-block w-2 h-2 rounded-full ${sev.dot}`} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {/* ── Complexity Analysis ── */}
      {complexity && <ComplexitySection complexity={complexity} />}

      {/* ── AI Review ── */}
      {aiReview && <AIReviewSection review={aiReview} complexity={null} />}
    </div>
  );
};

export default ReviewResult;