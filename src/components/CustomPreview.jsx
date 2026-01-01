import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import rehypeExternalLinks from 'rehype-external-links';

const CustomPreview = ({ content }) => {
  return (
    <div className="custom-preview-container" style={{ padding: '10px', height: '100%', overflowY: 'auto' }}>
      <ReactMarkdown
        children={content}
        rehypePlugins={[
          rehypeSanitize,
          rehypeRaw,
          [rehypeExternalLinks, { target: '_blank', rel: ['nofollow'] }]
        ]}
        components={{
          img: ({ src, alt, ...props }) => {
            // 确保本地图片路径正确
            const imageUrl = src.startsWith('/assets/uploads/') ? src : src;
            return (
              <img 
                src={imageUrl} 
                alt={alt || 'Uploaded image'} 
                style={{ maxWidth: '100%', height: 'auto' }} 
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
  );
};

export default CustomPreview;