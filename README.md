# 招聘方信息核实表部署说明

这个项目使用：

- GitHub Pages 托管前端 `index.html`
- Vercel Functions 提供接口
- Supabase Database + Storage 保存记录和文件

## 1. Supabase 初始化

在 Supabase SQL Editor 执行：

```sql
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  hr_name text not null,
  phone text not null,
  details_mode text not null check (details_mode in ('text', 'audio')),
  details_text text,
  license_path text not null,
  audio_path text
);
```

在 Supabase Storage 创建一个私有 bucket：

```text
recruit-files
```

## 2. Vercel 环境变量

把 `.env.example` 里的变量填到 Vercel Project Settings -> Environment Variables：

```text
SUPABASE_URL=你的 Supabase Project URL
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service_role key
SUPABASE_BUCKET=recruit-files
ALLOWED_ORIGIN=https://你的GitHub用户名.github.io
```

`SUPABASE_SERVICE_ROLE_KEY` 只能放在 Vercel 后端环境变量里，不能写进 `index.html`。

## 3. 前端配置

打开 `index.html`，替换这三项：

```js
const API_BASE = "https://你的-vercel-项目.vercel.app";
const SUPABASE_URL = "你的 Supabase Project URL";
const SUPABASE_ANON_KEY = "你的 Supabase anon key";
```

如果你先本地调试 Vercel 接口，可以临时改为：

```js
const API_BASE = "http://localhost:3000";
```

## 4. 提交流程

页面提交时会：

1. 调用 `/api/upload-url` 获取 Supabase Storage 签名上传 token
2. 前端把图片和录音直接上传到 Supabase Storage
3. 调用 `/api/submit` 把姓名、电话、岗位详情和文件路径写入 `submissions`
4. 显示“提交成功，谢谢你的配合”

## 5. 本地开发

安装依赖：

```bash
npm install
```

启动 Vercel 本地函数：

```bash
npm run dev
```

本地开发时需要创建 `.env.local`，内容参考 `.env.example`。

## 6. 注意事项

- GitHub Pages 只负责静态前端，不能保存提交数据。
- 图片和录音不要直接传进 Vercel Function，避免触发请求体大小限制。
- `recruit-files` 建议保持私有。后续如果要做后台查看页面，应由后端生成短时下载链接。
