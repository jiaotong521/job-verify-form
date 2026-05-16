import {
  assertText,
  getSupabaseAdmin,
  handleOptions,
  parseBody,
  sendJson
} from "./_utils.mjs";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    sendJson(req, res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = parseBody(req);
    const hrName = assertText(body.hrName, "请填写招聘方代表姓名");
    const phone = assertText(body.phone, "请填写公司官方联系电话");
    const detailsMode = assertText(body.detailsMode, "请选择岗位详情提交方式");
    const licensePath = assertText(body.licensePath, "缺少营业执照或工牌图片");

    if (!["text", "audio"].includes(detailsMode)) {
      sendJson(req, res, 400, { error: "岗位详情提交方式无效" });
      return;
    }

    if (detailsMode === "text" && (!body.detailsText || String(body.detailsText).trim() === "")) {
      sendJson(req, res, 400, { error: "请填写岗位详情文字" });
      return;
    }

    if (detailsMode === "audio" && (!body.audioPath || String(body.audioPath).trim() === "")) {
      sendJson(req, res, 400, { error: "请上传岗位详情录音" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        hr_name: hrName,
        phone,
        details_mode: detailsMode,
        details_text: detailsMode === "text" ? String(body.detailsText).trim() : null,
        license_path: licensePath,
        audio_path: detailsMode === "audio" ? String(body.audioPath).trim() : null
      })
      .select("id")
      .single();

    if (error) {
      sendJson(req, res, 500, { error: error.message });
      return;
    }

    sendJson(req, res, 200, { ok: true, id: data.id });
  } catch (error) {
    sendJson(req, res, 400, { error: error.message || "提交失败" });
  }
}
