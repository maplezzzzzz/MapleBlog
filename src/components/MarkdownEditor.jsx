import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";

const MarkdownEditor = ({ value, onChange, inputId, ...props }) => {
  const [innerValue, setInnerValue] = useState(value || "");

  useEffect(() => {
    if (value !== innerValue && value !== undefined) {
      setInnerValue(value || "");
    }
  }, [value]);

  const handleChange = (newValue) => {
    const val = newValue || "";
    setInnerValue(val);
    if (onChange) {
      onChange(val);
    }
    
    // 同步到隐藏输入框
    if (inputId) {
      const input = document.getElementById(inputId);
      if (input) {
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  return (
    <div className="markdown-editor-container" style={{ height: "600px" }}>
      <MDEditor
        value={innerValue}
        onChange={handleChange}
        height={600}
        {...props}
        preview="edit" // 默认显示编辑模式，可选 'live', 'edit', 'preview'
        textareaProps={{
          placeholder: "使用 Markdown 格式编写内容...",
        }}
      />
    </div>
  );
};

export default MarkdownEditor;
