import { useState } from "react";
import api from "../services/api";

const FileUpload = () => {
  const [fileName, setFileName] =
    useState("");

  const handleChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append(
      "codeFile",
      file
    );

    try {
      const res =
        await api.post(
          "/reviews/upload",
          formData
        );

      setFileName(
        res.data.file.filename
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleChange}
        accept=".js,.py,.java,.cpp,.c"
      />

      {fileName && (
        <p className="mt-2">
          Uploaded: {fileName}
        </p>
      )}
    </div>
  );
};

export default FileUpload;