# 部署配置说明

本项目支持灵活的子目录部署，可以通过环境变量配置部署到任意路径。

## 配置方法

### 1. 环境变量配置

在 `.env.production` 文件中设置 `VITE_BASE_URL` 变量：

```bash
# 根目录部署（默认）
VITE_BASE_URL=./

# 子目录部署示例
VITE_BASE_URL=/game/        # 部署到 https://example.com/game/
VITE_BASE_URL=/app/         # 部署到 https://example.com/app/
VITE_BASE_URL=/mini-games/  # 部署到 https://example.com/mini-games/
```

### 2. 构建项目

```bash
npm run build
```

### 3. 部署文件

将 `dist` 文件夹中的所有内容上传到服务器对应的目录。

## 部署场景示例

### 场景 1：根目录部署

**配置：** `VITE_BASE_URL=./`  
**部署路径：** `https://example.com/`  
**上传位置：** 服务器根目录

### 场景 2：子目录部署

**配置：** `VITE_BASE_URL=/game/`  
**部署路径：** `https://example.com/game/`  
**上传位置：** 服务器的 `/game/` 目录

### 场景 3：多级子目录部署

**配置：** `VITE_BASE_URL=/projects/games/`  
**部署路径：** `https://example.com/projects/games/`  
**上传位置：** 服务器的 `/projects/games/` 目录

## 注意事项

1. **路径格式**：子目录路径必须以 `/` 开头和结尾，例如 `/game/`
2. **图标文件**：需要确保 `game.svg` 文件在部署目录的根位置
3. **服务器配置**：确保服务器支持 SPA 路由，将所有路由请求重定向到 `index.html`

## 快速切换部署环境

可以创建多个环境文件：

- `.env.production` - 生产环境
- `.env.staging` - 测试环境
- `.env.local` - 本地测试

然后使用不同的构建命令：

```bash
# 生产环境构建
npm run build

# 测试环境构建
npm run build -- --mode staging

# 本地测试构建
npm run build -- --mode local
```