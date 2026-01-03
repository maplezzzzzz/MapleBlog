
import { getCollection } from 'astro:content';

async function debugPages() {
    console.log('开始调试 Pages 集合...');
    try {
        // 注意：在独立脚本中直接调用 getCollection 可能需要完整的 Astro 环境上下文
        // 这里我们主要检查文件是否存在以及文件名
        const fs = await import('fs');
        const path = await import('path');
        
        const pagesDir = path.join(process.cwd(), 'src/content/pages');
        if (fs.existsSync(pagesDir)) {
            const files = fs.readdirSync(pagesDir);
            console.log('src/content/pages 下的文件:', files);
            
            files.forEach(file => {
                const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
                console.log(`\n--- 文件: ${file} ---`);
                // 简单的 frontmatter 解析
                const match = content.match(/title:\s*(.+)/);
                console.log('Title:', match ? match[1] : '未找到');
            });
        } else {
            console.log('Pages 目录不存在！');
        }
        
    } catch (e) {
        console.error('调试出错:', e);
    }
}

debugPages();
