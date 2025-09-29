#!/bin/bash

# ArkOne SeqNice 部署脚本
# 支持本地一键部署到 Surge.sh
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署 ArkOne SeqNice 应用..."

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 检查是否安装了surge
if ! command -v surge &> /dev/null; then
    echo "❌ Surge.sh 未安装，正在安装..."
    npm install -g surge
    
    if [ $? -ne 0 ]; then
        echo "❌ Surge.sh 安装失败，请检查网络连接或权限"
        exit 1
    fi
    
    echo "✅ Surge.sh 安装完成"
fi

# 检查是否已登录surge
echo "🔐 检查 Surge.sh 登录状态..."
if ! surge whoami &> /dev/null; then
    echo "⚠️  未登录 Surge.sh，请先登录"
    echo "💡 运行 'surge login' 进行登录"
    surge login
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
fi

# 构建项目
echo "🔨 正在构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建完成"

# 检查构建目录
if [ ! -d "dist" ]; then
    echo "❌ 构建目录 'dist' 不存在"
    exit 1
fi

# 部署到Surge.sh
echo "🌐 正在部署到 Surge.sh..."

# 进入构建目录
cd dist

# 部署到surge（使用正确的域名）
surge . --domain seqnice.surge.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo "📱 访问地址: https://seqnice.surge.sh"
    echo "🇨🇳 国内访问速度: 快速稳定"
    echo ""
    echo "📋 其他访问方式:"
    echo "   GitHub Pages: https://baowwa.github.io/seqnice/"
    echo "   本地开发: http://localhost:3000"
    echo ""
    echo "🛠️  管理命令:"
    echo "   查看部署列表: surge list"
    echo "   删除部署: surge teardown seqnice.surge.sh"
    echo ""
else
    echo "❌ 部署失败，请检查网络连接或重试"
    cd ..
    exit 1
fi

# 返回项目根目录
cd ..

echo "✨ 部署完成！"