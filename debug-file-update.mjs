import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

// 模拟 process.cwd()
const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.join(ROOT_DIR, "src", "content", "blog");

console.log(`项目根目录: ${ROOT_DIR}`);
console.log(`内容目录: ${CONTENT_DIR}`);

// 1. 创建一个测试文件
const testFileName = 'test-debug-article.md';
const testFilePath = path.join(CONTENT_DIR, testFileName);

const initialContent = `---
title: 测试文章
status: published
draft: false
---

这是一个测试文件。`;

try {
    console.log(`
1. 创建测试文件: ${testFilePath}`);
    fs.writeFileSync(testFilePath, initialContent);
    console.log('文件创建成功');
} catch (e) {
    console.error('创建文件失败:', e);
    process.exit(1);
}

// 2. 尝试修改状态为取消发布
try {
    console.log('\n2. 尝试读取并修改文件状态...');
    const fileContent = fs.readFileSync(testFilePath, "utf-8");
    const { data: frontmatter, content } = matter(fileContent);
    
    console.log('原始 Frontmatter:', frontmatter);

    const updatedFrontmatter = {
        ...frontmatter,
        status: "draft",
        draft: true,
        updatedAt: new Date().toISOString(),
    };

    const newFrontmatter = yaml.dump(updatedFrontmatter);
    const newFileContent = `---\n${newFrontmatter}---\n\n${content}`;

    fs.writeFileSync(testFilePath, newFileContent);
    console.log('文件写入成功');

} catch (e) {
    console.error('修改文件失败:', e);
}

// 3. 验证修改结果
try {
    console.log('\n3. 验证修改结果...');
    const verifyContent = fs.readFileSync(testFilePath, "utf-8");
    const { data: verifyFrontmatter } = matter(verifyContent);
    console.log('新的 Frontmatter:', verifyFrontmatter);

    if (verifyFrontmatter.status === 'draft' && verifyFrontmatter.draft === true) {
        console.log('✅ 测试成功！状态已正确更新。');
    } else {
        console.error('❌ 测试失败！状态未更新。');
    }
} catch (e) {
    console.error('验证失败:', e);
}

// 4. 清理测试文件
try {
    fs.unlinkSync(testFilePath);
    console.log('\n4. 清理测试文件完成');
} catch (e) {
    console.error('清理失败:', e);
}
