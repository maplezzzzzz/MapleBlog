import React, { useState, useEffect, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from 'rehype-external-links';
import rehypeRaw from 'rehype-raw';
import CustomPreview from './CustomPreview';

const EnhancedMarkdownEditorWithPreview = ({ value, onChange, inputId, height = 600, ...props }) => {
  const [innerValue, setInnerValue] = useState(value || "");
  const [previewMode, setPreviewMode] = useState("edit"); // 'edit', 'preview', 'split'
  const fileInputRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState([]);

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
        const imageUrl = result.data.url;
        // 添加到已上传图片列表
        setUploadedImages(prev => [...prev, {
          name: file.name,
          url: imageUrl,
          uploadTime: new Date().toISOString()
        }]);
        return imageUrl; // 返回图片URL
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
        const newValue = `${currentValue}![图片描述](${url})\n`;
        handleChange(newValue);
      }
    }
    // 重置文件输入，允许重复选择相同文件
    e.target.value = '';
  };

  // 复制图片URL到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('URL已复制到剪贴板！');
    }).catch(err => {
      console.error('复制失败:', err);
      // 降级处理：使用旧方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('URL已复制到剪贴板！');
    });
  };

  // 预览切换
  const togglePreview = (mode) => {
    setPreviewMode(mode);
  };

  // 渲染上传的图片列表
  const renderUploadedImages = () => {
    if (uploadedImages.length === 0) {
      return <p>暂无上传的图片</p>;
    }

    return (
      <div className="uploaded-images-container">
        <h4>已上传的图片</h4>
        <div className="uploaded-images-grid">
          {uploadedImages.map((img, index) => (
            <div key={index} className="uploaded-image-item">
              <div className="image-preview">
                <img 
                  src={img.url} 
                  alt={img.name} 
                  style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'cover' }} 
                />
              </div>
              <div className="image-info">
                <p className="image-name">{img.name}</p>
                <p className="image-url">{img.url}</p>
                <button 
                  className="copy-url-btn" 
                  onClick={() => copyToClipboard(img.url)}
                  title="复制URL"
                >
                  复制URL
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="enhanced-markdown-editor-container" style={{ height: `${height}px`, display: 'flex', flexDirection: 'column' }}>
      <div className="editor-toolbar" style={{ display: 'flex', gap: '10px', padding: '5px', borderBottom: '1px solid #ddd' }}>
        <button
          type="button"
          onClick={() => togglePreview('edit')}
          className={`toolbar-btn ${previewMode === 'edit' ? 'active' : ''}`}
          title="编辑模式"
        >
          编辑
        </button>
        <button
          type="button"
          onClick={() => togglePreview('preview')}
          className={`toolbar-btn ${previewMode === 'preview' ? 'active' : ''}`}
          title="预览模式"
        >
          预览
        </button>
        <button
          type="button"
          onClick={() => togglePreview('split')}
          className={`toolbar-btn ${previewMode === 'split' ? 'active' : ''}`}
          title="分屏模式"
        >
          分屏
        </button>
        <button
          type="button"
          onClick={triggerFileSelect}
          className="toolbar-btn"
          title="上传图片"
        >
          上传图片
        </button>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      <div className="editor-content" style={{ flex: 1, overflow: 'hidden' }}>
        {previewMode === 'edit' && (
          <MDEditor
            value={innerValue}
            onChange={handleChange}
            height={height - 50}
            {...props}
            preview="edit"
            textareaProps={{
              placeholder: "使用 Markdown 格式编写内容...",
            }}
          />
        )}

        {previewMode === 'preview' && (
          <div className="preview-container" style={{ height: `${height - 50}px`, overflowY: 'auto' }}>
            <CustomPreview content={innerValue} />
          </div>
        )}

        {previewMode === 'split' && (
          <MDEditor
            value={innerValue}
            onChange={handleChange}
            height={height - 50}
            {...props}
            preview="live"
            textareaProps={{
              placeholder: "使用 Markdown 格式编写内容...",
            }}
            rehypePlugins={[rehypeSanitize, rehypeRaw, [rehypeExternalLinks, { target: '_blank', rel: ['nofollow'] }]]}
          />
        )}
      </div>

      <div className="uploaded-images-section" style={{ maxHeight: '200px', overflowY: 'auto', borderTop: '1px solid #ddd', padding: '10px' }}>
        {renderUploadedImages()}
      </div>
    </div>
  );
};

export default EnhancedMarkdownEditorWithPreview;