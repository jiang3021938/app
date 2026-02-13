# 部署指南

## 1. Vercel 部署配置

已创建 `vercel.json` 文件，配置了 Python FastAPI 应用的部署。

### vercel.json 配置说明：
- **入口文件**: `backend/main.py`
- **Python 版本**: 3.11
- **依赖安装**: 自动从 `backend/requirements.txt` 安装
- **路由**: 所有请求都会转发到 FastAPI 应用

### 在 Vercel 上部署步骤：

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入该仓库
3. Vercel 会自动检测到 `vercel.json` 配置
4. 点击 Deploy 按钮开始部署

### 解决 404 问题：
如果遇到 404 错误，确保：
- `vercel.json` 位于项目根目录
- Vercel 项目设置中的 Root Directory 指向正确的目录
- 环境变量已正确配置（在 Vercel Dashboard 的 Settings > Environment Variables 中添加）

### 需要配置的环境变量：
在 Vercel 中设置以下环境变量：
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://zbinmdvdailctymiignm.supabase.co
SUPABASE_KEY=sb_publishable_en0KrbZUp440Uaj4uoglGw_74muRt73
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ENVIRONMENT=prod
PORT=8000
```

## 2. Supabase 数据库设置

已生成 `supabase_schema.sql` 文件，包含所有数据表的创建语句。

### 在 Supabase 中创建数据表：

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 打开 `supabase_schema.sql` 文件
4. 复制文件内容
5. 粘贴到 SQL Editor 中
6. 点击 "Run" 执行 SQL

### 已有数据库迁移：
如果 documents 表已存在，需要添加 file_data 列用于 PDF 预览：
```sql
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_data TEXT;
```

如果 extractions 表已存在，需要添加 audit_checklist 列用于审查清单：
```sql
ALTER TABLE extractions ADD COLUMN IF NOT EXISTS audit_checklist TEXT;
```

### 数据表说明：

| 表名 | 用途 |
|------|------|
| `users` | 用户基本信息 |
| `oidc_states` | OIDC 认证状态 |
| `documents` | 文档上传记录 |
| `extractions` | 租约提取结果 |
| `payments` | 支付记录 |
| `user_credits` | 用户积分信息 |
| `user_credentials` | 用户凭证 |
| `state_regulations` | 州法规信息 |

### 获取数据库连接字符串：

1. 在 Supabase Dashboard 中，进入 Settings > Database
2. 找到 "Connection String" 部分
3. 复制 "URI" 格式的连接字符串
4. 格式如下：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@zbinmdvdailctymiignm.supabase.co:5432/postgres
   ```
5. 将此字符串设置为 `DATABASE_URL` 环境变量

## 3. 前端配置

前端需要连接到部署后的后端 API。

### 修改前端 API 地址：

在 `frontend/src/` 中找到配置 API 地址的文件，将基础 URL 改为 Vercel 部署后的地址。

例如：
```typescript
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://your-app.vercel.app';
```

## 4. 故障排除

### Vercel 404 错误
- 检查 `vercel.json` 是否在根目录
- 确认 Vercel 项目设置正确
- 查看 Vercel 部署日志

### 数据库连接错误
- 验证 `DATABASE_URL` 环境变量正确
- 检查 Supabase 数据库是否正常运行
- 确认所有数据表已创建

### CORS 错误
- FastAPI 中已配置 CORS 允许所有来源
- 如需限制，修改 `backend/main.py` 中的 `_allowed_origins`

## 5. 开发与生产环境

### 本地开发：
```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```

### 部署到生产：
```bash
git add .
git commit -m "Update deployment config"
git push
# Vercel 会自动部署