#!/bin/bash

# ArkOne SeqNice 一键部署脚本
# 能力：推送 GitHub（触发 GitHub Pages）、构建并部署到 Surge
# 使用方法：
#  - 默认：./deploy.sh
#  - 自定义提交信息：./deploy.sh "feat: 本次改动说明"

set -e  # 遇到错误立即退出

echo "🚀 开始一键部署 ArkOne SeqNice 应用..."

# 读取提交信息
COMMIT_MSG=${1:-"chore: 一键部署，推送 GitHub Pages 并发布 Surge"}

timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

# 打印步骤工具
step() {
  echo "➡️  $(timestamp) $1"
}

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

step "安装依赖（若缺失）"
if [ ! -d "node_modules" ]; then
  npm install
fi

step "构建项目（vite build）"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建完成"

# 推送到 GitHub，触发 GitHub Pages
step "推送到 GitHub（触发 Pages）"

# 确认远程 origin 存在
if ! git remote get-url origin &> /dev/null; then
  echo "❌ 未检测到 Git 远程 origin，请先配置远程仓库"
  echo "   例如：git remote add origin git@github.com:<your>/<repo>.git"
  exit 1
fi

# 暂存与提交
git add -A
if git diff --cached --quiet; then
  echo "ℹ️ 无需提交，工作区无更改"
else
  git commit -m "$COMMIT_MSG"
fi

# 将当前 HEAD 推送到远程 main 分支（不切换本地分支）
git push origin HEAD:main
if [ $? -ne 0 ]; then
  echo "⚠️ 推送到 main 失败，尝试推送到 master"
  git push origin HEAD:master || {
    echo "❌ 推送失败，请检查权限或网络"
    exit 1
  }
fi

echo "✅ 已推送到 GitHub（main/master），Pages 工作流将自动部署"

# 检查构建目录
if [ ! -d "dist" ]; then
    echo "❌ 构建目录 'dist' 不存在"
    exit 1
fi

step "部署到 Surge（seqnice.surge.sh）"

# 进入构建目录
cd dist

# 部署到surge（使用正确的域名）
surge . --domain seqnice.surge.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Surge 部署成功！"
    echo "📱 访问地址: https://seqnice.surge.sh"
    echo "📋 GitHub Pages（约1-5分钟生效）: https://baowwa.github.io/seqnice/"
    echo "🛠️ 管理命令: surge list | surge teardown seqnice.surge.sh"
    echo ""
else
    echo "❌ 部署失败，请检查网络连接或重试"
    cd ..
    exit 1
fi

# 返回项目根目录
cd ..

step "快速健康检查"
curl -I https://seqnice.surge.sh || true
echo "⏳ GitHub Pages 正在部署中，稍后访问：https://baowwa.github.io/seqnice/"

echo "✨ 全流程完成！"