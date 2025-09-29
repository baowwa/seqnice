# ArkOne SeqNice 部署指南

## 🚀 快速部署（推荐）

### 方案1：本地一键部署到 Surge.sh

**特点：** 最简单，国内访问快，完全免费

```bash
# 1. 直接运行部署脚本
./deploy.sh

# 或者使用npm命令
npm run deploy
```

**访问地址：** https://arkone-seqnice.surge.sh

### 方案2：使用npm命令部署

```bash
# 构建并部署到Surge.sh
npm run deploy:surge
```

## 📋 部署前准备

### 首次使用Surge.sh需要注册

```bash
# 运行surge命令进行注册
surge

# 按提示输入邮箱和密码完成注册
```

## 🌐 多平台部署选项

### GitHub Pages（推荐给有GitHub仓库的用户）

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "feat: 添加部署配置"
   git push origin main
   ```

2. **启用GitHub Pages**
   - 进入GitHub仓库设置
   - 找到Pages选项
   - 选择GitHub Actions作为源
   - 代码推送后会自动部署

3. **访问地址**
   ```
   https://你的用户名.github.io/arkone-seqnice
   ```

### Netlify部署

1. **拖拽部署**
   ```bash
   npm run build
   # 将dist文件夹拖拽到 https://app.netlify.com/drop
   ```

2. **Git连接部署**
   - 连接GitHub仓库
   - 构建命令：`npm run build`
   - 发布目录：`dist`

## 🛠️ 自定义配置

### 修改Surge.sh域名

编辑 `deploy.sh` 文件：
```bash
# 将 arkone-seqnice.surge.sh 改为你想要的域名
surge . --domain 你的域名.surge.sh
```

### 添加自定义域名

在 `dist` 目录创建 `CNAME` 文件：
```bash
echo "your-domain.com" > dist/CNAME
```

## 🔧 构建优化

项目已配置了以下优化：

- ✅ 代码分割（React、Ant Design、工具库分离）
- ✅ 资源压缩和混淆
- ✅ CSS代码分割
- ✅ 生产环境移除console和debugger
- ✅ 静态资源哈希命名

## 📊 部署平台对比

| 平台 | 免费额度 | 国内访问 | 部署难度 | 推荐指数 |
|------|----------|----------|----------|----------|
| Surge.sh | 无限制 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| GitHub Pages | 无限制 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Netlify | 100GB/月 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🚨 常见问题

### Q: Surge.sh部署失败？
A: 检查网络连接，确保已注册Surge账号

### Q: GitHub Pages访问慢？
A: 可以使用CDN加速，如jsDelivr

### Q: 想要HTTPS？
A: Surge.sh和GitHub Pages都默认支持HTTPS

## 📞 技术支持

如果遇到部署问题，请检查：
1. Node.js版本（推荐18+）
2. 网络连接
3. 构建是否成功（`npm run build`）

---

**推荐使用Surge.sh进行快速部署，国内访问速度最佳！** 🚀