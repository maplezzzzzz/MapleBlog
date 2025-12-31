import React, { useState, useEffect } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import '@wangeditor/editor/dist/css/style.css';

const WangEditor = ({ value, onChange, inputId, height = 500 }) => {
  const [editor, setEditor] = useState(null);
  const [html, setHtml] = useState(value || '');

  useEffect(() => {
    // 如果外部传入的 value 变化，且不等于当前编辑器内容，则更新编辑器内容
    if (value !== undefined && value !== html) {
      setHtml(value);
    }
  }, [value]);

  // 工具栏配置
  const toolbarConfig = {
    // 可以排除某些菜单
    // excludeKeys: []
  };

  // 编辑器配置
  const editorConfig = {
    placeholder: '请输入内容...',
    MENU_CONF: {
      uploadImage: {
        // 使用 Base64 格式保存图片，不进行网络上传
        base64LimitType: 10 * 1024 * 1024, // 10MB 以下图片全部转为 Base64
      }
    }
  };

  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  const handleChange = (editor) => {
    const newHtml = editor.getHtml();
    setHtml(newHtml);
    
    // 如果传入了 onChange 回调
    if (onChange) {
      onChange(newHtml);
    }

    // 如果传入了 inputId，同步更新隐藏域
    if (inputId) {
      const input = document.getElementById(inputId);
      if (input) {
        input.value = newHtml;
        // 触发 input 事件，以便监听器捕获
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #ccc' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={html}
        onCreated={setEditor}
        onChange={handleChange}
        mode="default"
        style={{ height: `${height}px`, overflowY: 'hidden' }}
      />
    </div>
  );
};

export default WangEditor;
