#!/bin/bash

# 部署脚本 - 支持本地一键部署到Surge.sh
# 使用方法: ./deploy.sh

echo "🚀 开始部署 ArkOne SeqNice 应用..."

# 检查是否安装了surge
if ! command -v surge &> /dev/null; then
    echo "❌ Surge.sh 未安装，正在安装..."
    npm install -g surge
fi

# 构建项目
echo "📦 正在构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建完成"

# 部署到Surge.sh
echo "🌐 正在部署到Surge.sh..."

# 进入构建目录
cd dist

# 创建CNAME文件（如果需要自定义域名）
# echo "your-custom-domain.surge.sh" > CNAME

# 部署到surge
surge . --domain seqnice.surge.sh

if [ $? -eq 0 ]; then
    echo "🎉 部署成功！"
    echo "📱 访问地址: https://arkone-seqnice.surge.sh"
    echo "🇨🇳 国内访问速度: 快速稳定"
else
    echo "❌ 部署失败，请检查网络连接或重试"
    exit 1
fi

# 返回项目根目录
cd ..

echo "✨ 部署完成！"