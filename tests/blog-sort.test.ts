import { strict as assert } from 'node:assert';
import { sortBlogByDate } from '../src/lib/sortFunctions';
import yaml from 'js-yaml';

const parsed = yaml.load('publishedAt: 2026-10-29T16:07:00+08:00') as { publishedAt: Date };
assert.ok(parsed.publishedAt instanceof Date);
const posts = [
  { id: 'missing', data: {} },
  { id: 'z-old', data: { createdAt: new Date('2026-10-29T16:05:00+08:00') } },
  { id: 'b-tie', data: { publishedAt: parsed.publishedAt } },
  { id: 'a-new', data: { createdAt: new Date('2026-10-28T00:00:00Z'), publishedAt: new Date('2026-10-29T08:07:00Z') } },
  { id: 'later', data: { createdAt: new Date('2026-10-29T16:08:00+08:00') } },
];
const expected = ['later', 'a-new', 'b-tie', 'z-old', 'missing'];
for (const input of [posts, [...posts].reverse()]) {
  const sorted = sortBlogByDate([...input]).map(post => post.id);
  assert.deepEqual(sorted, expected);
  assert.deepEqual([...sorted.slice(0, 2), ...sorted.slice(2, 4), ...sorted.slice(4, 6)], expected);
}
console.log('Blog date sorting tests passed');
