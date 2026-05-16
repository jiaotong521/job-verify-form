import {
  BUCKET_NAME,
  assertText,
  cleanExtension,
  getSupabaseAdmin,
  handleOptions,
  parseBody,
  sendJson
} from "./_utils.mjs";

const ALLOWED_FIELDS = new Set(["license", "audio"]);

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    sendJson(req, res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const { files } = parseBody(req);

    if (!Array.isArray(files) || files.length === 0) {
      sendJson(req, res, 400, { error: "缺少待上传文件信息" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const sessionId = crypto.randomUUID();
    const uploads = {};

    for (const file of files) {
      const field = assertText(file.field, "文件字段无效");
      const name = assertText(file.name, "文件名称无效");

      if (!ALLOWED_FIELDS.has(field)) {
        sendJson(req, res, 400, { error: "文件字段不允许" });
        return;
      }

      const ext = cleanExtension(name);
      const path = `${sessionId}/${field}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUploadUrl(path);

      if (error) {
        sendJson(req, res, 500, { error: error.message });
        return;
      }

      uploads[field] = {
        path,
        token: data.token
      };
    }

    sendJson(req, res, 200, { sessionId, uploads });
  } catch (error) {
    sendJson(req, res, 400, { error: error.message || "生成上传地址失败" });
  }
}
