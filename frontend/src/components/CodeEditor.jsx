import Editor from "@monaco-editor/react";

const CodeEditor = ({
  code,
  setCode,
  language,
  readOnly = false,
}) => {
  return (
    <div className="rounded-3xl shadow-lg overflow-hidden border border-gray-200">
      <Editor
        height="500px"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={
          readOnly
            ? undefined
            : (value) => setCode(value || "")
        }
        options={{
          fontSize: 15,
          minimap: {
            enabled: false,
          },
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          readOnly,
          fontFamily:
            "'Fira Code', 'Cascadia Code', Consolas, monospace",
          lineNumbers: "on",
          roundedSelection: true,
          cursorBlinking: "smooth",
          smoothScrolling: true,
          padding: {
            top: 16,
            bottom: 16,
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;