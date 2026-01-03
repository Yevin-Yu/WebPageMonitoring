#!/bin/bash

# 宝塔面板部署脚本
# 使用方法: bash deploy.sh

set -e

echo "=========================================="
echo "开始部署 WebPageMonitoring 项目"
echo "=========================================="

# 项目根目录 (根据实际情况修改)
PROJECT_ROOT="/www/wwwroot/webpage-monitoring"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
PLUGIN_DIR="$PROJECT_ROOT/plugin"

# 检查目录是否存在
if [ ! -d "$PROJECT_ROOT" ]; then
    echo "错误: 项目目录不存在: $PROJECT_ROOT"
    exit 1
fi

echo ""
echo "1. 部署后端服务..."
cd $BACKEND_DIR

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install --production
else
    echo "后端依赖已存在，跳过安装"
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "警告: .env 文件不存在，请手动创建并配置"
    if [ -f ".env.example" ]; then
        echo "提示: 可以复制 .env.example 为 .env 并修改配置"
        cp .env.example .env
    fi
fi

# 创建日志目录
mkdir -p logs
mkdir -p data

# 使用 PM2 启动
if command -v pm2 &> /dev/null; then
    echo "使用 PM2 启动后端服务..."
    pm2 delete webpage-monitoring-backend 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    echo "后端服务已启动"
else
    echo "警告: PM2 未安装，请手动启动后端服务"
fi

echo ""
echo "2. 构建前端应用..."
cd $FRONTEND_DIR

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
else
    echo "前端依赖已存在，检查更新..."
    npm install
fi

# 检查生产环境变量
if [ ! -f ".env.production" ]; then
    echo "警告: .env.production 文件不存在"
    if [ -f ".env.production.example" ]; then
        echo "复制 .env.production.example 为 .env.production"
        cp .env.production.example .env.production
    fi
fi

# 构建前端
echo "构建前端应用..."
npm run build

if [ -d "dist" ]; then
    echo "前端构建成功: $FRONTEND_DIR/dist"
else
    echo "错误: 前端构建失败，dist 目录不存在"
    exit 1
fi

echo ""
echo "3. 构建插件..."
cd $PLUGIN_DIR

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装插件依赖..."
    npm install
fi

# 构建插件
echo "构建插件..."
npm run build:prod

if [ -d "dist" ]; then
    echo "插件构建成功: $PLUGIN_DIR/dist"
else
    echo "错误: 插件构建失败，dist 目录不存在"
    exit 1
fi

echo ""
echo "4. 设置文件权限..."
chown -R www:www $PROJECT_ROOT
chmod -R 755 $PROJECT_ROOT
chmod -R 755 $BACKEND_DIR/data

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "下一步操作:"
echo "1. 检查后端服务: pm2 list"
echo "2. 检查后端日志: pm2 logs webpage-monitoring-backend"
echo "3. 在宝塔面板中配置 Nginx (参考 DEPLOYMENT.md)"
echo "4. 访问网站验证部署"
echo ""

