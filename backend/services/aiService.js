const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const reviewCode = async (code) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are an expert software engineer and code reviewer."
      },
      {
        role: "user",
        content: `
Review the following code and provide a structured analysis.

Start with a concise overview organized under these sub-sections:

Summary:
<Brief overall assessment of the code>

Strengths:
<List the positive aspects of the code>

Areas for Improvement:
<List areas that need attention>

Key Findings:
<List the most critical findings>

Architecture & Design:
<Comment on code structure and design patterns>

Code Quality:
<Assess maintainability and readability>

Then provide detailed analysis under these headings:

1. Bugs
2. Security issues
3. Performance improvements
4. Best practices
5. Code smells
6. Optimization suggestions
7. Overall score out of 100.

End your response with this exact, standalone line (replace NN with a whole number from 0 to 100):
OVERALL_SCORE: NN

Then provide a complete corrected version of the code between these exact markers.
Do not omit working parts of the original code:
CORRECTED_CODE_START
<corrected code>
CORRECTED_CODE_END

Code:

${code}
        `
      }
    ],
    temperature: 0.2
  });

  const content = response.choices[0].message.content;

  // Prefer the explicit final marker so a list number such as "7. Overall score"
  // can never be mistaken for the actual score. Keep a fallback for older reviews.
  const scoreMatch =
    content.match(/^\s*OVERALL_SCORE\s*:\s*(\d{1,3})\s*$/im) ||
    content.match(/(?:overall\s*(?:code\s*)?(?:quality\s*)?score|score|rating)\s*(?:out\s*of\s*100)?\s*[:=-]\s*(\d{1,3})(?:\s*\/\s*100)?/i);

  const parsedScore = scoreMatch ? Number.parseInt(scoreMatch[1], 10) : null;
  const correctedCodeMatch = content.match(
    /CORRECTED_CODE_START\s*\n?([\s\S]*?)\n?\s*CORRECTED_CODE_END/i
  );
  const correctedCode = correctedCodeMatch
    ? correctedCodeMatch[1]
      .trim()
      .replace(/^```[^\n]*\n?/, "")
      .replace(/\n?```$/, "")
      .trim()
    : code;

  return {
    review: content,
    correctedCode,
    aiScore: Number.isInteger(parsedScore) && parsedScore >= 0 && parsedScore <= 100
      ? parsedScore
      : null,
  };
};

module.exports = reviewCode;