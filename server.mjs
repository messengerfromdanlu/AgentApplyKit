import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { createServer } from "node:http";

const root = resolve(".");
const port = Number(process.env.PORT || 5173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function safePath(url) {
  const requestPath = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const filePath = normalize(join(root, requestPath === "/" ? "index.html" : requestPath));
  return filePath.startsWith(root) ? filePath : join(root, "index.html");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

function buildPrompt(input) {
  return `你是一个严谨的 AI/Agent 项目申请材料顾问。请根据用户输入，生成一份可直接用于开发者活动、Token/API 额度申请、开源项目展示的结构化材料包。

要求：
1. 全部使用中文。
2. 不要夸大事实，只能基于输入合理延展。
3. 强调项目已经有可见 Demo、Agent 工作流、证明材料和后续 API 扩展价值。
4. applicationCopy 需要 180-280 个中文字符，适合直接填入申请表。
5. readmeDraft 使用 Markdown。
6. 只返回 JSON，不要返回 Markdown 代码块。

JSON 格式：
{
  "projectPosition": "项目定位，1 段",
  "painPoints": ["痛点 1", "痛点 2", "痛点 3"],
  "agentWorkflow": [
    {"step": "输入解析", "detail": "说明"},
    {"step": "价值提炼", "detail": "说明"},
    {"step": "材料生成", "detail": "说明"},
    {"step": "证明打包", "detail": "说明"},
    {"step": "API 增强", "detail": "说明"}
  ],
  "applicationCopy": "申请表可用文案",
  "readmeDraft": "# 项目名\\n\\nREADME 草稿",
  "proofMaterials": ["证明材料 1", "证明材料 2", "证明材料 3", "证明材料 4"],
  "readinessScore": 0-100,
  "improvementNotes": ["改进建议 1", "改进建议 2"]
}

用户输入：
- 项目名称：${input.projectName || "AgentApplyKit"}
- 目标用户：${input.audience || "开发者、学生、个人创作者"}
- 项目想法：${input.idea || ""}
- 当前进展：${input.progress || ""}
- 申请类型：${input.grantType || ""}
- 希望突出方向：${input.focus || ""}
- API 使用计划：${input.apiPlan || ""}`;
}

function parseJsonContent(content) {
  const trimmed = String(content || "").trim();
  if (!trimmed) throw new Error("模型没有返回内容");

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("模型返回内容不是有效 JSON");
    return JSON.parse(match[0]);
  }
}

async function handleGenerate(request, response) {
  try {
    const body = await readJson(request);
    const input = body.input || {};
    const apiKey = String(body.apiKey || process.env.DEEPSEEK_API_KEY || "").trim();
    const model = String(body.model || "deepseek-v4-flash").trim();
    const apiBase = String(body.apiBase || "https://api.deepseek.com").replace(/\/+$/, "");

    if (!apiKey) {
      sendJson(response, 400, { error: "请先填写 DeepSeek API Key，或设置 DEEPSEEK_API_KEY 环境变量。" });
      return;
    }

    const apiResponse = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "你擅长把 AI/Agent 项目整理成可信、具体、可提交的申请材料。输出必须是严格 JSON。",
          },
          {
            role: "user",
            content: buildPrompt(input),
          },
        ],
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
        temperature: 0.35,
        max_tokens: 2800,
      }),
    });

    const raw = await apiResponse.text();
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = { error: { message: raw } };
    }

    if (!apiResponse.ok) {
      sendJson(response, apiResponse.status, {
        error: payload?.error?.message || `DeepSeek API 请求失败，状态码 ${apiResponse.status}`,
      });
      return;
    }

    const content = payload?.choices?.[0]?.message?.content;
    const result = parseJsonContent(content);
    sendJson(response, 200, {
      model,
      result,
      usage: payload.usage || null,
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "服务器生成失败" });
  }
}

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);

  if (request.method === "POST" && url.pathname === "/api/generate") {
    handleGenerate(request, response);
    return;
  }

  const filePath = safePath(request.url);
  const target = existsSync(filePath) && statSync(filePath).isFile() ? filePath : join(root, "index.html");
  response.setHeader("Content-Type", types[extname(target)] || "application/octet-stream");
  createReadStream(target).pipe(response);
});

server.listen(port, () => {
  console.log(`AgentApplyKit is running at http://localhost:${port}`);
});
