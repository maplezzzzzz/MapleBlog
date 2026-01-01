import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import rehypeExternalLinks from 'rehype-external-links';

const ArticlePreview = ({ title, content, coverImage }) => {
  return (
    <div className="article-preview">
      <h1>{title || '文章标题'}</h1>

      {coverImage && (
        <div className="cover-preview">
          <img src={coverImage} alt="封面图" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}

      <div className="content-preview">
        <ReactMarkdown
          children={content}
          rehypePlugins={[
            rehypeSanitize,
            rehypeRaw,
            [rehypeExternalLinks, { target: '_blank', rel: ['nofollow'] }]
          ]}
          components={{
            img: ({ src, alt, ...props }) => {
              // 确保本地图片路径正确，处理相对路径
              let imageUrl = src;
              if (src.startsWith('/assets/uploads/')) {
                // 如果是本地上传的图片，确保路径正确
                imageUrl = src;
              } else if (src.startsWith('http') || src.startsWith('//')) {
                // 如果是外部图片，保持原样
                imageUrl = src;
              } else {
                // 如果是相对路径，尝试转换为绝对路径
                imageUrl = src;
              }

              return (
                <img
                  src={imageUrl}
                  alt={alt || 'Uploaded image'}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    margin: '10px 0'
                  }}
                  onError={(e) => {
                    console.error('图片加载失败:', imageUrl);
                    e.target.alt = `图片加载失败: ${alt || imageUrl}`;
                  }}
                  {...props}
                />
              );
            },
            // 为其他元素添加默认样式
            h1: ({ node, ...props }) => <h1 style={{ fontSize: '1.5em', marginTop: '0.5em', marginBottom: '0.5em' }} {...props} />,
            h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.4em', marginTop: '0.6em', marginBottom: '0.6em' }} {...props} />,
            h3: ({ node, ...props }) => <h3 style={{ fontSize: '1.3em', marginTop: '0.7em', marginBottom: '0.7em' }} {...props} />,
            p: ({ node, ...props }) => <p style={{ marginTop: '0.5em', marginBottom: '0.5em', lineHeight: '1.6' }} {...props} />,
            code: ({ node, inline, ...props }) => inline
              ? <code style={{ background: '#f4f4f4', padding: '2px 4px', borderRadius: '3px' }} {...props} />
              : <code style={{ display: 'block', background: '#f4f4f4', padding: '10px', borderRadius: '4px', overflowX: 'auto' }} {...props} />,
            pre: ({ node, ...props }) => <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', overflowX: 'auto' }} {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote
                style={{
                  borderLeft: '4px solid #ddd',
                  paddingLeft: '10px',
                  marginLeft: '0',
                  marginRight: '0',
                  color: '#666',
                  fontStyle: 'italic'
                }}
                {...props}
              />
            ),
            ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px' }} {...props} />,
            ol: ({ node, ...props }) => <ol style={{ paddingLeft: '20px' }} {...props} />,
          }}
        />
      </div>

      <style jsx>{`
        .article-preview {
          padding: 20px;
        }

        .cover-preview {
          margin-bottom: 20px;
        }

        .content-preview {
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default ArticlePreview;