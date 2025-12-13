// adminjs.config.js - AdminJS 配置文件
const AdminJS = require('adminjs');
const { Database, Resource } = require('@adminjs/typeorm');
const { Article } = require('./src/lib/models'); // 我们将创建这个模型
const express = require('express');
const adminJsExpress = require('@adminjs/express');
const formidable = require('formidable');
const path = require('path');

// 为 Astro 内容创建资源模型
class AstroBlogResource {
  constructor(resource) {
    this.resource = resource;
  }

  static isAdapterFor(resource) {
    return resource.constructor.name === 'AstroBlogResource';
  }

  // 实现 Resource 接口方法
  async count() {
    // 实现计数逻辑
    return 0;
  }

  async find(filter, options) {
    // 实现查找逻辑
    return [];
  }

  async findOne(id) {
    // 实现查找单个记录逻辑
    return null;
  }

  async findMany(ids) {
    // 实现查找多个记录逻辑
    return [];
  }

  async create(params) {
    // 实现创建逻辑
    return {};
  }

  async update(id, params) {
    // 实现更新逻辑
    return {};
  }

  async delete(id) {
    // 实现删除逻辑
    return true;
  }
}

// 配置 AdminJS 资源
const adminJsResources = [
  {
    resource: AstroBlogResource,
    options: {
      // 文章资源配置
      properties: {
        id: {
          type: 'string',
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        title: {
          type: 'string',
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        content: {
          type: 'richtext',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        status: {
          type: 'string',
          availableValues: [
            { value: 'draft', label: '草稿' },
            { value: 'published', label: '已发布' },
            { value: 'archived', label: '已归档' },
          ],
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        createdAt: {
          type: 'datetime',
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        updatedAt: {
          type: 'datetime',
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        author: {
          type: 'string',
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        categories: {
          type: 'string',
          isArray: true,
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        tags: {
          type: 'string',
          isArray: true,
          isVisible: { list: false, filter: true, show: true, edit: true },
        },
        featuredImg: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
      },
    },
  },
  {
    resource: {
      // 广告管理资源
      count: () => 0,
      find: () => [],
      findOne: () => null,
      findMany: () => [],
      create: () => ({}),
      update: () => ({}),
      delete: () => true,
    },
    options: {
      id: 'Advertisements',
      properties: {
        id: {
          type: 'string',
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        name: {
          type: 'string',
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        type: {
          type: 'string',
          availableValues: [
            { value: 'banner', label: '横幅广告' },
            { value: 'sidebar', label: '侧边栏广告' },
            { value: 'popup', label: '弹窗广告' },
            { value: 'in-content', label: '内容中广告' },
          ],
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        status: {
          type: 'string',
          availableValues: [
            { value: 'active', label: '启用' },
            { value: 'inactive', label: '停用' },
          ],
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        impressions: {
          type: 'number',
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        clicks: {
          type: 'number',
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        code: {
          type: 'richtext',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        url: {
          type: 'string',
          isVisible: { list: true, filter: false, show: true, edit: true },
        },
        startDate: {
          type: 'datetime',
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        endDate: {
          type: 'datetime',
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
      },
    },
  },
  {
    resource: {
      // SEO设置资源
      count: () => 0,
      find: () => [],
      findOne: () => null,
      findMany: () => [],
      create: () => ({}),
      update: () => ({}),
      delete: () => true,
    },
    options: {
      id: 'SEOSettings',
      properties: {
        id: {
          type: 'string',
          isVisible: { list: false, filter: false, show: false, edit: false },
        },
        siteTitle: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        siteDescription: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        siteKeywords: {
          type: 'string',
          isArray: true,
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        ogTitle: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        ogDescription: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        ogImage: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        twitterCard: {
          type: 'string',
          availableValues: [
            { value: 'summary', label: 'Summary' },
            { value: 'summary_large_image', label: 'Summary Large Image' },
            { value: 'app', label: 'App' },
            { value: 'player', label: 'Player' },
          ],
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        googleAnalytics: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        bingVerification: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        robotsTxt: {
          type: 'text',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        sitemapFrequency: {
          type: 'string',
          availableValues: [
            { value: 'always', label: '总是' },
            { value: 'hourly', label: '每小时' },
            { value: 'daily', label: '每天' },
            { value: 'weekly', label: '每周' },
            { value: 'monthly', label: '每月' },
            { value: 'yearly', label: '每年' },
            { value: 'never', label: '从不' },
          ],
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
      },
    },
  },
  {
    resource: {
      // 网站设置资源
      count: () => 0,
      find: () => [],
      findOne: () => null,
      findMany: () => [],
      create: () => ({}),
      update: () => ({}),
      delete: () => true,
    },
    options: {
      id: 'SiteSettings',
      properties: {
        id: {
          type: 'string',
          isVisible: { list: false, filter: false, show: false, edit: false },
        },
        siteName: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        siteDescription: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        adminEmail: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        siteUrl: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        favicon: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        logo: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        beian: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        gaCode: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        contactAddress: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        contactPhone: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        contactEmail: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        businessHours: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        copyright: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        privacyPolicy: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        termsOfService: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        disclaimer: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        themeColor: {
          type: 'string',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        fontFamily: {
          type: 'string',
          availableValues: [
            { value: 'system', label: '系统默认' },
            { value: 'sans-serif', label: '无衬线字体' },
            { value: 'serif', label: '衬线字体' },
            { value: 'PingFang SC, Hiragino Sans GB, sans-serif', label: '苹果字体' },
            { value: 'Microsoft YaHei, sans-serif', label: '微软雅黑' },
          ],
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        layoutStyle: {
          type: 'string',
          availableValues: [
            { value: 'modern', label: '现代风格' },
            { value: 'classic', label: '经典风格' },
            { value: 'minimalist', label: '极简风格' },
            { value: 'professional', label: '专业风格' },
          ],
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        enableComments: {
          type: 'boolean',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        maxPostDisplay: {
          type: 'number',
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
      },
    },
  },
];

// AdminJS 配置
const adminJsConfig = {
  resources: adminJsResources,
  branding: {
    companyName: '小白天地',
    logo: false,
    favicon: '/favicon.ico',
    theme: {
      colors: {
        primary100: '#3498db',
        primary80: '#3ca0e4',
        primary60: '#4da8e7',
        primary40: '#65b3eb',
        primary20: '#80c0f0',
        primary10: '#a6d5f5',
        grey100: '#f8f9fa',
        grey80: '#e9ecef',
        grey60: '#dee2e6',
        grey40: '#ced4da',
        grey20: '#adb5bd',
        grey10: '#6c757d',
        alert: '#e74c3c',
        success: '#2ecc71',
      },
    },
  },
  locale: {
    language: 'zh',
    translations: {
      resources: {
        AstroBlogResource: {
          properties: {
            id: 'ID',
            title: '标题',
            content: '内容',
            status: '状态',
            createdAt: '创建时间',
            updatedAt: '更新时间',
            author: '作者',
            categories: '分类',
            tags: '标签',
            featuredImg: '特色图片',
          },
        },
        Advertisements: {
          properties: {
            id: 'ID',
            name: '广告名称',
            type: '广告类型',
            status: '状态',
            impressions: '展示次数',
            clicks: '点击次数',
            code: '广告代码',
            url: '点击链接',
            startDate: '开始日期',
            endDate: '结束日期',
          },
        },
        SEOSettings: {
          properties: {
            id: 'ID',
            siteTitle: '网站标题',
            siteDescription: '网站描述',
            siteKeywords: '网站关键词',
            ogTitle: 'Open Graph 标题',
            ogDescription: 'Open Graph 描述',
            ogImage: 'Open Graph 图片',
            twitterCard: 'Twitter Card 类型',
            googleAnalytics: 'Google Analytics ID',
            bingVerification: 'Bing 网站验证',
            robotsTxt: 'Robots.txt 内容',
            sitemapFrequency: 'Sitemap 更新频率',
          },
        },
        SiteSettings: {
          properties: {
            id: 'ID',
            siteName: '网站名称',
            siteDescription: '网站描述',
            adminEmail: '管理员邮箱',
            siteUrl: '网站URL',
            favicon: '网站图标',
            logo: '网站Logo',
            beian: '备案信息',
            gaCode: 'Google Analytics代码',
            contactAddress: '联系地址',
            contactPhone: '联系电话',
            contactEmail: '联系邮箱',
            businessHours: '营业时间',
            copyright: '版权信息',
            privacyPolicy: '隐私政策',
            termsOfService: '服务条款',
            disclaimer: '免责声明',
            themeColor: '主题色',
            fontFamily: '字体族',
            layoutStyle: '布局风格',
            enableComments: '启用评论功能',
            maxPostDisplay: '首页最大文章数',
          },
        },
      },
    },
  },
};

module.exports = { adminJsConfig };