import React, { useState, useRef, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ArticlePreview from './ArticlePreview';

const ArticleEditor = ({ initialEditId = null }) => {
  // 编辑器内容状态
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  
  // 元数据状态
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  
  // 预览状态
  const [showPreview, setShowPreview] = useState(false);
  
  // 加载状态
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  // 文件输入引用
  const fileInputRef = useRef(null);
  const coverFileInputRef = useRef(null);
  
  // 加载文章数据（如果提供了initialEditId）
  useEffect(() => {
    const loadArticleData = async () => {
      if (initialEditId) {
        try {
          setLoading(true);
          const response = await fetch(`/api/article/${initialEditId}`);
          const result = await response.json();

          if (result.success) {
            const article = result.data;
            setTitle(article.title || '');
            setContent(article.content || '');
            setCoverImage(article.coverImage || '');
            setSeoTitle(article.seoTitle || '');
            setSeoDescription(article.seoDescription || '');
            setSeoKeywords(article.seoKeywords || []);
            setAllowComments(article.allowComments);
            setIsPublished(article.isPublished);

            // 设置分类（需要将分类名称转换为ID）
            const categoryIds = [];
            article.categories.forEach(catName => {
              const cat = categories.find(c => c.name === catName);
              if (cat) categoryIds.push(cat.id);
            });
            setSelectedCategories(categoryIds);

            // 设置标签（需要将标签名称转换为ID）
            const tagIds = [];
            article.tags.forEach(tagName => {
              const tag = tags.find(t => t.name === tagName);
              if (tag) tagIds.push(tag.id);
            });
            setSelectedTags(tagIds);
          } else {
            console.error('加载文章失败:', result.error);
            alert('加载文章失败: ' + result.error);
          }
        } catch (error) {
          console.error('加载文章时出错:', error);
          alert('加载文章时出错: ' + error.message);
        } finally {
          setLoading(false);
        }
      } else {
        // 如果没有initialEditId（新建文章），清空所有字段
        setTitle('');
        setContent('');
        setCoverImage('');
        setSeoTitle('');
        setSeoDescription('');
        setSeoKeywords([]);
        setAllowComments(true);
        setIsPublished(false);
        setSelectedCategories([]);
        setSelectedTags([]);
      }
    };

    // 模拟加载分类和标签
    const loadMetadata = async () => {
      // 模拟加载分类
      setCategories([
        { id: 1, name: '技术分享' },
        { id: 2, name: '生活感悟' },
        { id: 3, name: '旅行日记' },
        { id: 4, name: '读书笔记' }
      ]);

      // 模拟加载标签
      setTags([
        { id: 1, name: 'JavaScript' },
        { id: 2, name: 'React' },
        { id: 3, name: 'Node.js' },
        { id: 4, name: 'Astro' }
      ]);
    };

    loadMetadata();
    loadArticleData(); // 无论是否有initialEditId都调用此函数
  }, [initialEditId]);
  
  // 自动保存草稿
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('articleDraft', JSON.stringify({
        title,
        content,
        selectedCategories,
        selectedTags,
        coverImage,
        seoTitle,
        seoDescription,
        seoKeywords,
        allowComments,
        isPublished
      }));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [title, content, selectedCategories, selectedTags, coverImage, seoTitle, seoDescription, seoKeywords, allowComments, isPublished]);
  
  // 处理内容变化
  const handleContentChange = (newValue) => {
    setContent(newValue || '');
  };
  
  // 处理图片上传
  const handleImageUpload = async (file) => {
    if (!file) return null;
    
    setImageLoading(true);
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      setImageLoading(false);
      return null;
    }
    
    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      setImageLoading(false);
      return null;
    }
    
    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/upload/temp-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(`上传失败: ${error.error || '未知错误'}`);
        setImageLoading(false);
        return null;
      }
      
      const result = await response.json();
      if (result.errno === 0) {
        setImageLoading(false);
        return result.data.url; // 返回图片URL
      } else {
        alert(`上传失败: ${result.message || '未知错误'}`);
        setImageLoading(false);
        return null;
      }
    } catch (error) {
      console.error('上传图片时出错:', error);
      alert('上传失败，请检查控制台错误信息');
      setImageLoading(false);
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
        const currentValue = content || '';
        const newValue = `${currentValue}![图片描述](${url})\n`;
        setContent(newValue);
      }
    }
    // 重置文件输入，允许重复选择相同文件
    e.target.value = '';
  };
  
  // 上传封面图
  const handleCoverUpload = async (file) => {
    if (!file) return null;

    setLoading(true);

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      setLoading(false);
      return null;
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      setLoading(false);
      return null;
    }

    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('image', file);

    try {
      // 使用新的上传API端点
      const response = await fetch('/api/upload/temp-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`上传失败: ${error.error || '未知错误'}`);
        setLoading(false);
        return null;
      }

      const result = await response.json();
      if (result.errno === 0) {
        setCoverImage(result.data.url);
        setLoading(false);
        return result.data.url; // 返回图片URL
      } else {
        alert(`上传失败: ${result.message || '未知错误'}`);
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error('上传封面图时出错:', error);
      alert('上传失败，请检查控制台错误信息');
      setLoading(false);
      return null;
    }
  };
  
  // 处理封面图文件选择
  const handleCoverFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleCoverUpload(file);
    }
    // 重置文件输入，允许重复选择相同文件
    e.target.value = '';
  };
  
  // 触发封面图上传
  const triggerCoverUpload = () => {
    if (coverFileInputRef.current) {
      coverFileInputRef.current.click();
    }
  };
  
  // 处理分类选择
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };
  
  // 处理标签选择
  const handleTagChange = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };
  
  // 添加新标签
  const addNewTag = () => {
    if (newTag.trim() !== '') {
      const newTagObj = {
        id: tags.length + 1,
        name: newTag.trim()
      };
      setTags([...tags, newTagObj]);
      setSelectedTags([...selectedTags, newTagObj.id]);
      setNewTag('');
    }
  };
  
  // 添加新关键词
  const addNewKeyword = () => {
    if (newKeyword.trim() !== '' && !seoKeywords.includes(newKeyword.trim())) {
      setSeoKeywords([...seoKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };
  
  // 移除关键词
  const removeKeyword = (index) => {
    setSeoKeywords(seoKeywords.filter((_, i) => i !== index));
  };
  
  // 提交文章
  const handleSubmit = async () => {
    setLoading(true);
    
    // 表单验证
    if (!title.trim()) {
      alert('请输入文章标题');
      setLoading(false);
      return;
    }
    
    if (!content.trim()) {
      alert('请输入文章内容');
      setLoading(false);
      return;
    }
    
    if (selectedCategories.length === 0) {
      alert('请选择至少一个分类');
      setLoading(false);
      return;
    }
    
    try {
      const articleData = {
        id: initialEditId, // 如果是编辑现有文章，包含ID
        title,
        content,
        categories: selectedCategories.map(id => categories.find(c => c.id === id)?.name).filter(Boolean),
        tags: selectedTags.map(id => tags.find(t => t.id === id)?.name).filter(Boolean),
        coverImage,
        seoTitle: seoTitle || title,
        seoDescription,
        seoKeywords,
        allowComments,
        isPublished,
        createdAt: new Date().toISOString()
      };

      console.log('提交的文章数据:', articleData);

      // 根据是否有ID决定是创建新文章还是更新现有文章
      let response;
      if (initialEditId) {
        // 更新现有文章
        response = await fetch(`/api/article/${initialEditId}`, {
          method: 'PUT', // 或者使用PATCH
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(articleData)
        });
      } else {
        // 创建新文章
        response = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(articleData)
        });
      }

      if (response.ok) {
        alert(initialEditId ? '文章更新成功！' : '文章创建成功！');
        localStorage.removeItem('articleDraft'); // 清除草稿
        // 可以选择重定向到内容管理页面
        // window.location.href = '/admin/content';
      } else {
        const errorData = await response.json();
        alert(`提交失败: ${errorData.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('提交文章时出错:', error);
      alert('提交失败，请重试');
    }
    
    setLoading(false);
  };
  
  // 从localStorage恢复草稿（仅在没有initialEditId时，即新建文章时）
  useEffect(() => {
    if (!initialEditId) { // 只有在新建文章时才恢复草稿
      const draft = localStorage.getItem('articleDraft');
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          setTitle(parsedDraft.title || '');
          setContent(parsedDraft.content || '');
          setSelectedCategories(parsedDraft.selectedCategories || []);
          setSelectedTags(parsedDraft.selectedTags || []);
          setCoverImage(parsedDraft.coverImage || '');
          setSeoTitle(parsedDraft.seoTitle || '');
          setSeoDescription(parsedDraft.seoDescription || '');
          setSeoKeywords(parsedDraft.seoKeywords || []);
          setAllowComments(parsedDraft.allowComments !== undefined ? parsedDraft.allowComments : true);
          setIsPublished(parsedDraft.isPublished || false);
        } catch (e) {
          console.error('恢复草稿失败:', e);
        }
      }
    }
  }, [initialEditId]);
  
  return (
    <div className="article-editor-container">
      <div className="editor-header">
        <h2>文章编辑器</h2>
        <div className="editor-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '编辑' : '预览'}
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? '提交中...' : '提交文章'}
          </button>
        </div>
      </div>
      
      <div className="editor-layout">
        {/* 主编辑区 */}
        <div className={`main-editor ${showPreview ? 'hidden' : ''}`}>
          <div className="title-input">
            <label>文章标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入文章标题"
            />
          </div>
          
          <div className="content-editor">
            <div className="editor-toolbar">
              <button type="button" onClick={triggerFileSelect} className="toolbar-btn" title="上传图片">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1.5 13.5L5 8.5L6.5 10L9.5 6L14.5 13.5H1.5Z" fill="currentColor"/>
                  <path d="M4 3H1V1h14v2h-3v1h1.5a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 1 12.5v-7A2.5 2.5 0 0 1 3.5 3H4z" fill="currentColor"/>
                </svg>
                上传图片
              </button>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {imageLoading && <span>上传中...</span>}
            </div>
            
            <MDEditor
              value={content}
              onChange={handleContentChange}
              height={500}
              preview="edit"
              textareaProps={{
                placeholder: "使用 Markdown 格式编写内容...",
              }}
            />
          </div>
        </div>
        
        {/* 预览区 */}
        <div className={`preview-panel ${!showPreview ? 'hidden' : ''}`}>
          <h3>文章预览</h3>
          <div className="preview-content">
            <ArticlePreview
              title={title}
              content={content}
              coverImage={coverImage}
            />
          </div>
        </div>
        
        {/* 元数据设置区 */}
        <div className="metadata-panel">
          <div className="metadata-section">
            <h3>分类设置</h3>
            <div className="checkbox-group">
              {categories.map(category => (
                <label key={category.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
          
          <div className="metadata-section">
            <h3>标签设置</h3>
            <div className="checkbox-group">
              {tags.map(tag => (
                <label key={tag.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleTagChange(tag.id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
            <div className="tag-input">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="添加新标签"
                onKeyPress={(e) => e.key === 'Enter' && addNewTag()}
              />
              <button onClick={addNewTag}>添加</button>
            </div>
          </div>
          
          <div className="metadata-section">
            <h3>封面图</h3>
            <div className="cover-upload">
              {coverImage ? (
                <div className="cover-preview">
                  <img src={coverImage} alt="封面图预览" />
                  <button onClick={() => setCoverImage('')}>删除</button>
                </div>
              ) : (
                <button onClick={triggerCoverUpload} disabled={loading}>
                  {loading ? '上传中...' : '上传封面图'}
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={coverFileInputRef}
                onChange={handleCoverFileChange}
              />
            </div>
          </div>
          
          <div className="metadata-section">
            <h3>SEO 设置</h3>
            <div className="seo-settings">
              <div className="input-group">
                <label>SEO 标题</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="留空则使用文章标题"
                />
              </div>
              
              <div className="input-group">
                <label>SEO 描述</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="请输入SEO描述"
                  rows="3"
                />
              </div>
              
              <div className="input-group">
                <label>关键词</label>
                <div className="keywords-container">
                  {seoKeywords.map((keyword, index) => (
                    <span key={index} className="keyword-tag">
                      {keyword}
                      <button onClick={() => removeKeyword(index)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="keyword-input">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="添加关键词"
                    onKeyPress={(e) => e.key === 'Enter' && addNewKeyword()}
                  />
                  <button onClick={addNewKeyword}>添加</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="metadata-section">
            <h3>其他选项</h3>
            <div className="toggle-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                />
                允许评论
              </label>
              
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                立即发布
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .article-editor-container {
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .editor-actions {
          display: flex;
          gap: 10px;
        }
        
        .btn {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn-primary {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }
        
        .btn-success {
          background-color: #28a745;
          color: white;
          border-color: #28a745;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .editor-layout {
          display: grid;
          grid-template-columns: 70% 30%;
          gap: 20px;
          height: calc(100vh - 180px);
        }
        
        .main-editor, .preview-panel {
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          overflow: auto;
        }
        
        .preview-panel {
          display: flex;
          flex-direction: column;
        }
        
        .preview-content {
          flex: 1;
          overflow: auto;
        }
        
        .preview-content h1 {
          font-size: 1.8em;
          margin-top: 0;
        }

        .cover-preview {
          margin-bottom: 15px;
        }

        .preview-body {
          min-height: 300px;
        }
        
        .hidden {
          display: none;
        }
        
        .title-input {
          margin-bottom: 20px;
        }
        
        .title-input label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .title-input input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .content-editor {
          height: calc(100% - 60px);
        }
        
        .editor-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
          margin-bottom: 10px;
        }
        
        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 6px 12px;
          cursor: pointer;
        }
        
        .metadata-panel {
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          overflow: auto;
        }
        
        .metadata-section {
          margin-bottom: 25px;
        }
        
        .metadata-section h3 {
          margin-top: 0;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
        }
        
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 10px;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .tag-input, .keyword-input {
          display: flex;
          gap: 5px;
          margin-top: 10px;
        }
        
        .tag-input input, .keyword-input input {
          flex: 1;
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .tag-input button, .keyword-input button {
          padding: 6px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .cover-upload {
          text-align: center;
        }
        
        .cover-preview {
          margin-bottom: 10px;
        }
        
        .cover-preview img {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .cover-preview button {
          margin-top: 5px;
          padding: 5px 10px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .seo-settings {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .input-group {
          margin-bottom: 10px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .input-group input,
        .input-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .keywords-container {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 5px;
        }
        
        .keyword-tag {
          display: inline-flex;
          align-items: center;
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
        }
        
        .keyword-tag button {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          margin-left: 5px;
          font-size: 14px;
        }
        
        .toggle-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .toggle-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .editor-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          
          .main-editor, .preview-panel, .metadata-panel {
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default ArticleEditor;