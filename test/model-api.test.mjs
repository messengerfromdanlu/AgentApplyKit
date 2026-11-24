import assert from "node:assert/strict";
import test from "node:test";
import { generateWithModel } from "../model-api.mjs";

const materials = {
  projectPosition: "一个整理项目资料的工具",
  applicationCopy: "我正在制作一个整理项目资料的工具。",
  readmeDraft: "# 项目介绍\n\n当前为原型阶段。",
  agentWorkflow: [{ step: "输入", detail: "填写项目内容" }],
};
const materialJson = JSON.stringify(materials);
const prompt = "请按项目资料生成材料包。";

function chatResponse(content = materialJson) {
  return Response.json({
    choices: [{ message: { content } }],
    usage: { prompt_tokens: 20, completion_tokens: 50 },
  });
}

test("legacy requests default to DeepSeek and keep its JSON mode", async () => {
  const result = await generateWithModel({}, prompt, {
    env: { DEEPSEEK_API_KEY: "deepseek-test-key" },
    fetchImpl: async (url, request) => {
      assert.equal(url, "https://api.deepseek.com/chat/completions");
      assert.equal(request.headers.Authorization, "Bearer deepseek-test-key");
      const body = JSON.parse(request.body);
      assert.equal(body.model, "deepseek-flash");
      assert.deepEqual(body.thinking, { type: "disabled" });
      assert.deepEqual(body.response_format, { type: "json_object" });
      return chatResponse();
    },
  });
  assert.equal(result.provider, "deepseek");
  assert.deepEqual(result.result, materials);
  assert.deepEqual(result.usage, { prompt_tokens: 20, completion_tokens: 50 });
});

for (const [provider, apiBase, keyEnv] of [
  ["openai", "https://api.openai.com/v1", "OPENAI_API_KEY"],
  ["openrouter", "https://openrouter.ai/api/v1", "OPENROUTER_API_KEY"],
]) {
  test(`${provider} uses standard Chat Completions and a provider-specific key`, async () => {
    const result = await generateWithModel({ provider, model: "requested-model" }, prompt, {
      env: { [keyEnv]: "provider-test-key", DEEPSEEK_API_KEY: "other-key" },
      fetchImpl: async (url, request) => {
        assert.equal(url, `${apiBase}/chat/completions`);
        assert.equal(request.headers.Authorization, "Bearer provider-test-key");
        const body = JSON.parse(request.body);
        assert.equal(body.model, "requested-model");
        assert.deepEqual(body.messages[1], { role: "user", content: prompt });
        assert.equal(body.thinking, undefined);
        assert.equal(body.response_format, undefined);
        return chatResponse();
      },
    });
    assert.equal(result.provider, provider);
    assert.equal(result.model, "requested-model");
  });
}

test("a compatible gateway accepts an explicit key and a full endpoint URL", async () => {
  const endpoint = "https://gateway.example.test/v1/chat/completions";
  const result = await generateWithModel({
    provider: "compatible", apiBase: `${endpoint}/`, model: "test/model", apiKey: "gateway-test-key",
  }, prompt, {
    env: { OPENAI_API_KEY: "unrelated-test-key" },
    fetchImpl: async (url, request) => {
      assert.equal(url, endpoint);
      assert.equal(request.headers.Authorization, "Bearer gateway-test-key");
      assert.equal(request.redirect, "error");
      return chatResponse("<think>Consider {options} first.</think>\n```json\n" + materialJson + "\n```");
    },
  });
  assert.deepEqual(result.result, materials);
});

for (const [provider, port] of [["ollama", 11434], ["lmstudio", 1234]]) {
  test(`${provider} allows a local model without a key`, async () => {
    const result = await generateWithModel({ provider, model: "installed-model" }, prompt, {
      env: { DEEPSEEK_API_KEY: "unrelated-test-key" },
      fetchImpl: async (url, request) => {
        assert.equal(url, `http://127.0.0.1:${port}/v1/chat/completions`);
        assert.equal(request.headers.Authorization, undefined);
        return Response.json({ choices: [{ message: { content: materialJson } }] });
      },
    });
    assert.deepEqual(result.result, materials);
    assert.equal(result.usage, null);
  });
}

test("Claude uses Messages and joins its text blocks", async () => {
  const result = await generateWithModel({ provider: "anthropic", apiKey: "claude-test-key" }, prompt, {
    env: {},
    fetchImpl: async (url, request) => {
      assert.equal(url, "https://api.anthropic.com/v1/messages");
      assert.equal(request.headers["x-api-key"], "claude-test-key");
      assert.equal(request.headers["anthropic-version"], "2026-10-21");
      assert.equal(request.headers.Authorization, undefined);
      const body = JSON.parse(request.body);
      assert.equal(typeof body.system, "string");
      assert.deepEqual(body.messages, [{ role: "user", content: prompt }]);
      assert.ok(body.max_tokens > 0);
      return Response.json({
        content: [
          { type: "thinking", thinking: "Internal reasoning" },
          { type: "text", text: materialJson.slice(0, 10) },
          { type: "text", text: materialJson.slice(10) },
        ],
        usage: { input_tokens: 11, output_tokens: 23 },
      });
    },
  });
  assert.deepEqual(result.result, materials);
  assert.deepEqual(result.usage, { prompt_tokens: 11, completion_tokens: 23 });
});

test("Gemini uses GenerateContent and reads only the visible output", async () => {
  const result = await generateWithModel({ provider: "gemini", model: "models/gemini-test" }, prompt, {
    env: { GEMINI_API_KEY: "gemini-test-key" },
    fetchImpl: async (url, request) => {
      assert.equal(url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent");
      assert.equal(request.headers["x-goog-api-key"], "gemini-test-key");
      const body = JSON.parse(request.body);
      assert.deepEqual(body.contents, [{ role: "user", parts: [{ text: prompt }] }]);
      assert.equal(body.generationConfig.responseMimeType, "application/json");
      return Response.json({
        candidates: [{ content: { parts: [{ thought: true, text: "Internal reasoning" }, { text: materialJson }] } }],
        usageMetadata: { promptTokenCount: 15, candidatesTokenCount: 30 },
      });
    },
  });
  assert.deepEqual(result.result, materials);
  assert.deepEqual(result.usage, { prompt_tokens: 15, completion_tokens: 30 });
});

test("custom endpoints cannot use the key of a built-in service", async () => {
  await assert.rejects(generateWithModel({
    provider: "openai", apiBase: "https://gateway.example.test/v1",
  }, prompt, {
    env: { OPENAI_API_KEY: "test-key" },
    fetchImpl: async () => assert.fail("The request must stop before calling the provider"),
  }), { status: 400, message: /API Key/ });
});

test("remote HTTP destinations are rejected before the model request", async () => {
  await assert.rejects(generateWithModel({
    provider: "compatible", apiBase: "http://gateway.example.test/v1", model: "test-model",
  }, prompt, {
    fetchImpl: async () => assert.fail("The request must stop before calling the provider"),
  }), { status: 400, message: /HTTPS/ });
});

test("incomplete materials return a useful upstream error", async () => {
  await assert.rejects(generateWithModel({ provider: "openai", apiKey: "test-key" }, prompt, {
    fetchImpl: async () => chatResponse(JSON.stringify({ projectPosition: "项目定位" })),
  }), { status: 502, message: /完整的材料包 JSON/ });
});

test("upstream errors keep the HTTP status and redact the selected key", async () => {
  await assert.rejects(generateWithModel({ provider: "openai", apiKey: "test-key" }, prompt, {
    fetchImpl: async () => Response.json({ error: { message: "Invalid key test-key" } }, { status: 401 }),
  }), (error) => {
    assert.equal(error.status, 401);
    assert.match(error.message, /Invalid key \[redacted\]/);
    assert.ok(!error.message.includes("test-key"));
    return true;
  });
});
