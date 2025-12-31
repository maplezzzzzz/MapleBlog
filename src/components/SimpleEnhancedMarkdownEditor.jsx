import React, { useState, useEffect, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";

const SimpleEnhancedMarkdownEditor = ({ value, onChange, inputId, height = 600, ...props }) => {
  const [innerValue, setInnerValue] = useState(value || "");
  const fileInputRef = useRef(null);

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
      // 在客户端环境中访问DOM
      if (typeof window !== 'undefined') {
        const input = document.getElementById(inputId);
        if (input) {
          input.value = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  };

  // 处理图片上传
  const handleImageUpload = async (file) => {
    if (!file) return null;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return null;
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      return null;
    }

    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`上传失败: ${error.error || '未知错误'}`);
        return null;
      }

      const result = await response.json();
      if (result.errno === 0) {
        return result.data.url; // 返回图片URL
      } else {
        alert(`上传失败: ${result.message || '未知错误'}`);
        return null;
      }
    } catch (error) {
      console.error('上传图片时出错:', error);
      alert('上传失败，请检查控制台错误信息');
      return null;
    }
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 处理文件选择
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await handleImageUpload(file);
      if (url) {
        // 插入图片到编辑器
        const currentValue = innerValue || '';
        const newValue = `${currentValue}![图片描述](${url})`;
        handleChange(newValue);
      }
    }
    // 重置文件输入，允许重复选择相同文件
    e.target.value = '';
  };

  return (
    <div className="markdown-editor-container" style={{ height: `${height}px` }}>
      <MDEditor
        value={innerValue}
        onChange={handleChange}
        height={height}
        {...props}
        preview="edit" // 默认显示编辑模式，可选 'live', 'edit', 'preview'
        textareaProps={{
          placeholder: "使用 Markdown 格式编写内容...",
        }}
        extraCommands={[
          // 自定义图片上传命令
          {
            name: 'image-upload',
            keyCommand: 'image-upload',
            value: 'image-upload',
            icon: (
              <button 
                type="button" 
                onClick={triggerFileSelect}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="上传图片"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1.5 13.5L5 8.5L6.5 10L9.5 6L14.5 13.5H1.5Z" fill="currentColor"/>
                  <path d="M4 3H1V1h14v2h-3v1h1.5a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 1 12.5v-7A2.5 2.5 0 0 1 3.5 3H4z" fill="currentColor"/>
                </svg>
              </button>
            )
          }
        ]}
      />
      {/* 隐藏的文件输入元素 */}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default SimpleEnhancedMarkdownEditor;