const form = document.querySelector("#project-form");
const resultContent = document.querySelector("#result-content");
const score = document.querySelector("#readiness-score");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const sampleButton = document.querySelector("#sample-button");
const apiButton = document.querySelector("#api-button");
const engineStatus = document.querySelector("#engine-status");
const runMeta = document.querySelector("#run-meta");
const tabs = [...document.querySelectorAll(".tab")];

const state = {
  activeTab: "summary",
  outputs: {},
  plain: {},
  markdown: "",
  source: "local",
};

const sample = {
  projectName: "Paper2Obsidian Agent",
  audience: "科研人员、研究生、AI 开发者",
  idea: "我想做一个论文阅读 Agent，输入论文 PDF 或摘要后，自动提取研究问题、方法框架、实验结论、关键图表和可复用代码思路，并生成 Obsidian 风格的结构化笔记。",
  progress: "已有脚本原型",
  grantType: "模型 Token / API 额度申请",
  focus: "论文理解、结构化输出、知识库沉淀、减少人工整理时间",
  apiPlan: "后续可接入兼容的模型 API，用于长文理解、多轮追问、批量论文处理和笔记质量评估。",
};

function getFormData() {
  return Object.fromEntries(new FormData(form).entries());
}

function clean(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

function splitKeywords(text) {
  return clean(text, "Agent 流程、可见演示、效率提升")
    .split(/[，,、]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function localGenerate(input) {
  const projectName = clean(input.projectName, "AgentApplyKit");
  const audience = clean(input.audience, "开发者和个人创作者");
  const idea = clean(input.idea, "帮助用户把项目想法整理成申请材料。");
  const progress = clean(input.progress, "已有本地 Web Demo");
  const grantType = clean(input.grantType, "模型 Token / API 额度申请");
  const focus = clean(input.focus, "Agent 流程、可见演示、效率提升");
  const apiPlan = clean(input.apiPlan, "后续可接入兼容的模型 API，提升生成质量和多场景适配能力。");
  const keywords = splitKeywords(focus);
  const readinessScore = Math.min(98, 76 + keywords.length * 3 + (progress.includes("Demo") ? 7 : 3));

  const applicationCopy = `我构建了一个名为 ${projectName} 的 Agent 项目材料生成工具，面向 ${audience}，帮助用户将零散的项目想法快速整理为项目定位、核心痛点、Agent 工作流、申请描述、README 草稿和证明材料清单。项目的核心痛点是：很多开发者已经有原型或想法，但在申请 ${grantType} 时难以清楚表达项目价值、技术路线和可见成果。当前版本已实现 ${progress}，用户输入项目名称、目标用户、进展和突出方向后，系统会自动生成结构化材料，降低活动申请、开发者计划和开源项目展示的准备成本。后续可接入兼容的模型 API，用于多轮润色、不同申请场景适配和批量材料生成。`;

  return {
    projectPosition: `${projectName} 是一个面向 ${audience} 的 AI/Agent 项目材料生成工具。它将用户输入的零散想法、当前进展和申请目标，整理为项目定位、核心痛点、Agent 工作流、申请描述、README 草稿和证明材料清单。当前版本状态为「${progress}」，适合用于 ${grantType}。`,
    painPoints: [
      "开发者常常有项目原型或想法，但难以快速转化为清晰的申请材料。",
      "不同活动表单关注点不同，手工整理痛点、流程和证明材料会消耗大量时间。",
      `本项目重点突出 ${keywords.join("、")}，让成果更容易被审核人员理解。`,
    ],
    agentWorkflow: [
      { step: "输入解析", detail: "读取项目名称、目标用户、项目想法、当前进展和申请类型，形成统一项目上下文。" },
      { step: "价值提炼", detail: "从原始想法中抽取用户痛点、使用场景、项目价值和可见成果。" },
      { step: "叙事生成", detail: "把技术过程改写成适合开发者活动、Token 申请和项目展示的成果描述。" },
      { step: "材料打包", detail: "同步生成 README 草稿、证明材料建议和可复制的申请表文案。" },
      { step: "API 扩展", detail: apiPlan },
    ],
    applicationCopy,
    readmeDraft: `# ${projectName}

${projectName} 是一个面向 ${audience} 的 Agent 项目材料生成工具。用户输入项目想法、当前进展和申请方向后，系统会生成项目定位、核心痛点、Agent 工作流、申请描述、README 草稿和证明材料建议。

## 核心能力

- 将模糊项目想法整理为清晰的项目定位
- 自动提炼目标用户、核心痛点和应用价值
- 生成适合活动申请的 Agent 工作流描述
- 输出可直接用于表单填写的中文申请文案
- 整理截图、录屏、GitHub 链接等证明材料建议

## 技术方法

- 前端：HTML、CSS、JavaScript
- 生成逻辑：本地规则引擎，可切换为 DeepSeek API 增强生成
- 运行方式：Node.js 本地服务
- 扩展方向：可接入兼容的模型 API，用于多轮润色、批量生成和场景适配

## 当前状态

${progress}

## 示例输入

${idea}
`,
    proofMaterials: [
      "上传工具首页截图，展示输入区、输出区和 Agent 工作流。",
      "录制 20-40 秒演示视频，展示填写项目想法后生成申请文案的过程。",
      "准备 GitHub 仓库链接，README 中说明项目目标、技术方法和运行方式。",
      "截取“申请表第 04 项文案”结果卡片，作为可见效果证明。",
      "补充 API 使用计划，说明如何提升润色、批量处理和场景适配能力。",
    ],
    readinessScore,
    improvementNotes: ["本地规则引擎适合稳定演示；接入 API 后可获得更贴合具体项目的表达。"],
  };
}

function normalizeGenerated(data) {
  return {
    projectPosition: clean(data.projectPosition, "暂未生成项目定位。"),
    painPoints: Array.isArray(data.painPoints) ? data.painPoints : [],
    agentWorkflow: Array.isArray(data.agentWorkflow) ? data.agentWorkflow : [],
    applicationCopy: clean(data.applicationCopy, "暂未生成申请文案。"),
    readmeDraft: clean(data.readmeDraft, "暂未生成 README 草稿。"),
    proofMaterials: Array.isArray(data.proofMaterials) ? data.proofMaterials : [],
    readinessScore: Number(data.readinessScore || 88),
    improvementNotes: Array.isArray(data.improvementNotes) ? data.improvementNotes : [],
  };
}

function buildView(generated, meta = {}) {
  const data = normalizeGenerated(generated);
  const safe = {
    position: escapeHtml(data.projectPosition),
    application: escapeHtml(data.applicationCopy),
    readme: escapeHtml(data.readmeDraft),
  };

  const painItems = data.painPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const workflowItems = data.agentWorkflow
    .map((item) => `<li><strong>${escapeHtml(item.step || "步骤")}：</strong>${escapeHtml(item.detail || item)}</li>`)
    .join("");
  const proofItems = data.proofMaterials.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const improvementItems = data.improvementNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const sections = {
    summary: `
      <section class="result-section">
        <h3>项目定位</h3>
        <p>${safe.position}</p>
        <h4>核心痛点</h4>
        <ul>${painItems}</ul>
        <div class="metric-grid">
          <div class="metric"><strong>${meta.source === "api" ? "API" : "Local"}</strong><span>生成模式</span></div>
          <div class="metric"><strong>${data.agentWorkflow.length}</strong><span>流程步骤</span></div>
          <div class="metric"><strong>${data.readinessScore}</strong><span>申请就绪度</span></div>
        </div>
      </section>
    `,
    workflow: `
      <section class="result-section">
        <h3>Agent 工作流</h3>
        <ol>${workflowItems}</ol>
        ${improvementItems ? `<h4>增强建议</h4><ul>${improvementItems}</ul>` : ""}
      </section>
    `,
    application: `
      <section class="result-section">
        <h3>申请表第 04 项文案</h3>
        <pre>${safe.application}</pre>
      </section>
    `,
    readme: `
      <section class="result-section">
        <h3>README 草稿</h3>
        <pre>${safe.readme}</pre>
      </section>
    `,
    proof: `
      <section class="result-section">
        <h3>第 05 项证明材料建议</h3>
        <ul>${proofItems}</ul>
      </section>
    `,
  };

  const markdown = `# AgentApplyKit 生成材料包

## 项目定位

${data.projectPosition}

## 核心痛点

${data.painPoints.map((item) => `- ${item}`).join("\n")}

## Agent 工作流

${data.agentWorkflow.map((item, index) => `${index + 1}. ${item.step || "步骤"}：${item.detail || item}`).join("\n")}

## 申请表第 04 项文案

${data.applicationCopy}

## README 草稿

${data.readmeDraft}

## 第 05 项证明材料建议

${data.proofMaterials.map((item) => `- ${item}`).join("\n")}

## 增强建议

${data.improvementNotes.map((item) => `- ${item}`).join("\n")}
`;

  return {
    readiness: Math.max(0, Math.min(100, data.readinessScore)),
    markdown,
    sections,
    plain: {
      summary: `${data.projectPosition}\n\n核心痛点：\n${data.painPoints.map((item) => `- ${item}`).join("\n")}`,
      workflow: data.agentWorkflow.map((item, index) => `${index + 1}. ${item.step || "步骤"}：${item.detail || item}`).join("\n"),
      application: data.applicationCopy,
      readme: data.readmeDraft,
      proof: data.proofMaterials.map((item) => `- ${item}`).join("\n"),
    },
  };
}

function commitView(view, meta = {}) {
  state.outputs = view.sections;
  state.plain = view.plain;
  state.markdown = view.markdown;
  score.textContent = view.readiness;
  resultContent.innerHTML = state.outputs[state.activeTab];
  state.source = meta.source || "local";

  const engineLabel = state.source === "api" ? `DeepSeek API · ${meta.model || "model"}` : "Local Rule Engine";
  engineStatus.lastChild.textContent = ` ${engineLabel}`;
  runMeta.textContent =
    state.source === "api"
      ? `当前输出由 DeepSeek API 增强生成。${meta.usage ? `Token 使用：prompt ${meta.usage.prompt_tokens || 0} / completion ${meta.usage.completion_tokens || 0}` : ""}`
      : "当前输出由本地规则引擎生成。";
}

function renderLocal() {
  const generated = localGenerate(getFormData());
  commitView(buildView(generated, { source: "local" }), { source: "local" });
}

function selectTab(tabName) {
  state.activeTab = tabName;
  tabs.forEach((tab) => tab.classList.toggle("is-selected", tab.dataset.tab === tabName));
  resultContent.innerHTML = state.outputs[tabName] || "";
}

function showToast(message, type = "ok") {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "is-error" : ""}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2400);
}

function setLoading(isLoading) {
  apiButton.disabled = isLoading;
  apiButton.textContent = isLoading ? "生成中..." : "DeepSeek 生成";
}

async function generateWithApi() {
  const input = getFormData();
  const remember = Boolean(form.elements.rememberKey.checked);
  const apiKey = clean(input.apiKey, "");

  if (remember && apiKey) {
    localStorage.setItem("agentApplyKit.deepseekKey", apiKey);
  } else if (!remember) {
    localStorage.removeItem("agentApplyKit.deepseekKey");
  }

  setLoading(true);
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        apiKey,
        model: clean(input.model, "deepseek-v4-flash"),
        apiBase: clean(input.apiBase, "https://api.deepseek.com"),
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "DeepSeek API 请求失败");
    }

    commitView(buildView(payload.result, { source: "api", model: payload.model }), {
      source: "api",
      model: payload.model,
      usage: payload.usage,
    });
    showToast("DeepSeek 生成完成");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function copyCurrent() {
  const text = state.plain[state.activeTab] || "";
  await navigator.clipboard.writeText(text);
  showToast("已复制当前内容");
}

function downloadMarkdown() {
  const blob = new Blob([state.markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "AgentApplyKit-output.md";
  link.click();
  URL.revokeObjectURL(url);
  showToast("已生成 Markdown 文件");
}

function fillSample() {
  Object.entries(sample).forEach(([key, value]) => {
    const field = form.elements[key];
    if (field) field.value = value;
  });
  renderLocal();
  showToast("已填入示例项目");
}

function restoreKey() {
  const savedKey = localStorage.getItem("agentApplyKit.deepseekKey");
  if (savedKey) {
    form.elements.apiKey.value = savedKey;
    form.elements.rememberKey.checked = true;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderLocal();
  showToast("本地材料包已生成");
});

form.addEventListener("reset", () => {
  window.setTimeout(renderLocal, 0);
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => selectTab(tab.dataset.tab));
});

copyButton.addEventListener("click", copyCurrent);
downloadButton.addEventListener("click", downloadMarkdown);
sampleButton.addEventListener("click", fillSample);
apiButton.addEventListener("click", generateWithApi);

restoreKey();
renderLocal();
