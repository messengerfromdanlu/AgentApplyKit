import { defaultProvider, providers } from "./src/model-providers.js";

const requestTimeoutMs = 120_000;
const systemPrompt = "你擅长把 AI/Agent 项目整理成可信、具体、可提交的申请材料。输出必须是严格 JSON。";

export class ModelApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function normalizeApiBase(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ModelApiError(400, "请填写有效的 API Base URL。");
  }

  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if ((url.protocol !== "https:" && !(isLocal && url.protocol === "http:"))
      || url.username || url.password || url.search || url.hash) {
    throw new ModelApiError(400, "API Base 请使用 HTTPS 或本机 HTTP 地址，且地址中不能包含凭据、查询参数或片段。");
  }

  return { apiBase: url.href.replace(/\/+$/, ""), isLocal };
}

function getModelConfig(body, env) {
  const provider = body.provider || defaultProvider;
  if (typeof provider !== "string" || !Object.hasOwn(providers, provider)) {
    throw new ModelApiError(400, "请选择支持的模型服务。");
  }

  const preset = providers[provider];
  const { apiBase, isLocal } = normalizeApiBase(String(body.apiBase || preset.apiBase || "").trim());
  const model = String(body.model || preset.model || "").trim();
  const envKey = preset.keyEnv && apiBase === preset.apiBase ? env[preset.keyEnv] : "";
  const apiKey = String(body.apiKey || "").trim() || String(envKey || "").trim();

  if (!model) throw new ModelApiError(400, "请填写服务商提供的模型 ID。");
  if (!apiKey && !isLocal) {
    const envHint = preset.keyEnv && apiBase === preset.apiBase ? `，或设置 ${preset.keyEnv} 环境变量` : "";
    throw new ModelApiError(400, `请填写 ${preset.label} 的 API Key${envHint}。`);
  }

  return { provider, preset, apiBase, model, apiKey };
}

function buildRequest({ provider, apiBase, model, apiKey }, prompt) {
  const headers = { "Content-Type": "application/json" };
  if (provider === "anthropic") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2026-10-21";
    return {
      url: `${apiBase}/messages`,
      headers,
      body: {
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      },
    };
  }

  if (provider === "gemini") {
    headers["x-goog-api-key"] = apiKey;
    const modelId = model.replace(/^models\//, "");
    return {
      url: `${apiBase}/models/${encodeURIComponent(modelId)}:generateContent`,
      headers,
      body: {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      },
    };
  }

  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  };
  if (provider === "deepseek" && apiBase === providers.deepseek.apiBase) {
    body.thinking = { type: "disabled" };
    body.response_format = { type: "json_object" };
    body.max_tokens = 2800;
  }

  return {
    url: apiBase.endsWith("/chat/completions") ? apiBase : `${apiBase}/chat/completions`,
    headers,
    body,
  };
}

function textParts(parts, include) {
  return Array.isArray(parts)
    ? parts.filter((part) => typeof part?.text === "string" && include(part)).map((part) => part.text).join("")
    : "";
}

function readModelResponse(provider, payload) {
  if (provider === "anthropic") {
    return {
      content: textParts(payload.content, (part) => part.type === "text"),
      inputTokens: payload.usage?.input_tokens,
      outputTokens: payload.usage?.output_tokens,
    };
  }

  if (provider === "gemini") {
    return {
      content: textParts(payload.candidates?.[0]?.content?.parts, (part) => !part.thought),
      inputTokens: payload.usageMetadata?.promptTokenCount,
      outputTokens: payload.usageMetadata?.candidatesTokenCount,
    };
  }

  const content = payload.choices?.[0]?.message?.content;
  return {
    content: typeof content === "string" ? content : textParts(content, (part) => part.type === "text"),
    inputTokens: payload.usage?.prompt_tokens,
    outputTokens: payload.usage?.completion_tokens,
  };
}

function parseMaterials(content) {
  const text = typeof content === "string" ? content.trim().replace(/^<think>[\s\S]*?<\/think>\s*/i, "") : "";
  if (!text) throw new ModelApiError(502, "模型没有返回可用的文本，请检查模型 ID 或换用支持文本生成的模型。");

  try {
    const json = text.startsWith("{") && text.endsWith("}") ? text : text.match(/\{[\s\S]*\}/)?.[0];
    const result = JSON.parse(json);
    const requiredFields = ["projectPosition", "applicationCopy", "readmeDraft"];
    if (result && requiredFields.every((field) => typeof result[field] === "string" && result[field].trim())) {
      return result;
    }
  } catch {
    // A model can return prose or truncate the JSON when it reaches its output limit.
  }
  throw new ModelApiError(502, "模型未返回完整的材料包 JSON，请重试或换一个模型。");
}

export async function generateWithModel(body, prompt, { fetchImpl = fetch, env = process.env } = {}) {
  const config = getModelConfig(body, env);
  const request = buildRequest(config, prompt);
  const signal = AbortSignal.timeout(requestTimeoutMs);
  let response;
  let payload;
  try {
    response = await fetchImpl(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(request.body),
      redirect: "error",
      signal,
    });
    payload = await response.json();
  } catch {
    if (signal.aborted) throw new ModelApiError(504, "模型请求超时，请重试或换用响应更快的模型。");
    if (response?.ok) throw new ModelApiError(502, "模型服务返回了无效的 HTTP 响应，请检查 API Base。");
    if (!response) throw new ModelApiError(502, "无法连接模型服务，请检查 API Base 和网络连接。");
  }

  if (!response.ok) {
    const detail = payload?.error?.message;
    const safeDetail = typeof detail === "string" && config.apiKey ? detail.replaceAll(config.apiKey, "[redacted]") : detail;
    const hint = typeof safeDetail === "string" ? ` · ${safeDetail.slice(0, 300)}` : "";
    throw new ModelApiError(response.status, `${config.preset.label} 请求失败（HTTP ${response.status}）${hint}`);
  }

  if (!payload || typeof payload !== "object") {
    throw new ModelApiError(502, "模型服务返回了无效的数据，请检查 API Base。");
  }
  const { content, inputTokens, outputTokens } = readModelResponse(config.provider, payload);
  return {
    provider: config.provider,
    model: config.model,
    result: parseMaterials(content),
    usage: inputTokens == null && outputTokens == null ? null : {
      prompt_tokens: inputTokens ?? null,
      completion_tokens: outputTokens ?? null,
    },
  };
}
