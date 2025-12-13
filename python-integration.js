// python-integration.js - Python 功能集成
const { spawn } = require('child_process');
const path = require('path');

class PythonIntegration {
  constructor() {
    this.pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
  }

  // 调用Python文本分析功能
  async analyzeText(text, language = 'zh') {
    try {
      const response = await fetch(`${this.pythonApiUrl}/api/text-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, language })
      });
      
      return await response.json();
    } catch (error) {
      console.error('调用Python文本分析服务失败:', error);
      throw error;
    }
  }

  // 调用Python内容优化功能
  async optimizeContent(title, content, keywords) {
    try {
      const response = await fetch(`${this.pythonApiUrl}/api/content-optimization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content, keywords })
      });
      
      return await response.json();
    } catch (error) {
      console.error('调用Python内容优化服务失败:', error);
      throw error;
    }
  }

  // 调用Python数据可视化功能
  async createVisualization(data, chartType, title) {
    try {
      const response = await fetch(`${this.pythonApiUrl}/api/visualization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data, chart_type: chartType, title })
      });
      
      return await response.json();
    } catch (error) {
      console.error('调用Python数据可视化服务失败:', error);
      throw error;
    }
  }

  // 获取Python分析报告
  async getReport(reportType) {
    try {
      const response = await fetch(`${this.pythonApiUrl}/api/report/${reportType}`);
      return await response.json();
    } catch (error) {
      console.error(`获取${reportType}报告失败:`, error);
      throw error;
    }
  }
}

// 为Express应用添加Python集成端点
function addPythonIntegrationEndpoints(app) {
  const pythonIntegration = new PythonIntegration();
  
  // 文本分析端点
  app.post('/api/python/text-analysis', async (req, res) => {
    try {
      const { text, language } = req.body;
      const result = await pythonIntegration.analyzeText(text, language);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 内容优化端点
  app.post('/api/python/content-optimization', async (req, res) => {
    try {
      const { title, content, keywords } = req.body;
      const result = await pythonIntegration.optimizeContent(title, content, keywords);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 数据可视化端点
  app.post('/api/python/visualization', async (req, res) => {
    try {
      const { data, chartType, title } = req.body;
      const result = await pythonIntegration.createVisualization(data, chartType, title);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 分析报告端点
  app.get('/api/python/report/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const result = await pythonIntegration.getReport(type);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = { PythonIntegration, addPythonIntegrationEndpoints };