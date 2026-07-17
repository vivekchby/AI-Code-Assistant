import Editor from "@monaco-editor/react";

const CodeEditor = ({
  code,
  setCode,
  language,
  readOnly = false,
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      <Editor
        height="500px"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={readOnly ? undefined : (value) => setCode(value || "")}
        options={{
          fontSize: 15,
          minimap: {
            enabled: false,
          },
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          readOnly,
        }}
      />
    </div>
  );
};

export default CodeEditor;
