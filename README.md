# AgentApplyKit

AgentApplyKit is a small AI/Agent application workspace for turning rough project ideas into structured application materials. It helps developers, students, and individual creators prepare clear project narratives for Token/API quota applications, developer programs, open-source showcases, hackathons, and similar submission scenarios.

Generate with the built-in rules or choose a cloud or local model to tailor the material to your project.

## Why This Project Exists

Many builders already have useful prototypes or project ideas, but application forms often ask for content that is harder to organize:

- What problem does the project solve?
- Who is the target user?
- What is the AI/Agent workflow?
- What visible result can be demonstrated?
- What proof materials should be uploaded?
- How should the project be described in a concise application field?

AgentApplyKit converts those scattered inputs into a reusable materials package.

## Features

- Generate a clear project position from rough notes.
- Extract pain points, target users, and project value.
- Produce an Agent workflow suitable for application review.
- Draft a Chinese application paragraph that can be pasted into form fields.
- Generate a README draft for GitHub publishing.
- Suggest proof materials such as screenshots, screen recordings, and repository links.
- Switch between local rules and multiple text-generation APIs.
- Copy the current output or download the full result as Markdown.

## Generation Modes

### Local Rule Engine

The local mode uses deterministic templates and lightweight rules. It does not require an API key and is useful for stable demonstrations, offline testing, and fallback generation.

### Model API Generation

The browser sends project inputs to the local `/api/generate` endpoint. The Node.js server adapts the request to OpenAI-compatible Chat Completions, Anthropic Messages, or Gemini GenerateContent and converts the response to the same materials format.

## Agent Workflow

1. Input parsing: collect project name, target users, idea, current progress, application type, and API usage plan.
2. Value extraction: identify pain points, user scenarios, visible progress, and project value.
3. Narrative generation: rewrite technical ideas into application-ready project descriptions.
4. Materials packaging: generate application copy, README draft, and proof-material suggestions.
5. API enhancement: optionally call a model API for more specific wording, richer reasoning, and stronger adaptation to different application scenarios.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Local server: Node.js HTTP server
- Local generation: rule engine plus structured templates
- API generation: OpenAI-compatible, Anthropic, and Gemini requests through the local Node.js server
- Dependencies: zero third-party runtime dependencies

## Project Structure

```text
AgentApplyKit/
  index.html
  package.json
  README.md
  server.mjs
  model-api.mjs
  src/
    app.js
    model-providers.js
    styles.css
  test/
    model-api.test.mjs
```

## Quick Start

Use Node.js 22 or later.

```bash
cd AgentApplyKit
npm run dev
```

Open the local workspace.

```text
http://localhost:5173
```

## Using Model APIs

1. Fill in your project materials and select a service under **模型服务**.
2. Keep the suggested model ID or enter one available to your account or local server.
3. Enter the API Key for the selected service if authentication is required.
4. Click **模型 API 生成**. The result shows which service and model generated the materials.

| Service | Suggested model ID | API Key environment variable |
| --- | --- | --- |
| [DeepSeek](https://api-docs.deepseek.com/) | `deepseek-flash` | `DEEPSEEK_API_KEY` |
| [OpenAI](https://developers.openai.com/api/docs/models) | `gpt-5-mini` | `OPENAI_API_KEY` |
| [Anthropic Claude](https://platform.claude.com/docs/en/models/overview) | `claude-haiku-5-5` | `ANTHROPIC_API_KEY` |
| [Google Gemini](https://ai.google.dev/gemini-api/docs/models) | `gemini-3.5-flash-lite` | `GEMINI_API_KEY` |
| [OpenRouter](https://openrouter.ai/docs/quickstart) | `openai/gpt-5-mini` | `OPENROUTER_API_KEY` |
| [Ollama](https://docs.ollama.com/api/openai-compatibility) | A model installed in Ollama | Optional key in the page |
| [LM Studio](https://lmstudio.ai/docs/developer/openai-compat) | A model available on the LM Studio server | Optional key in the page |
| Custom OpenAI-compatible | A text model ID from the service | Enter the service's key in the page |

To use an environment variable, set it before starting the server. For example, in PowerShell you can configure DeepSeek.

```powershell
$env:DEEPSEEK_API_KEY="sk-your-key"
npm run dev
```

On macOS and Linux, set the variable inline.

```bash
DEEPSEEK_API_KEY="sk-your-key" npm run dev
```

### Custom and Local Services

- Choose **自定义 OpenAI 兼容** for any service that accepts standard Chat Completions requests with Bearer authentication, such as [Alibaba Cloud Model Studio](https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope) for Qwen. Use the Base URL for your account and region and the service's exact model ID. A full URL ending in `/chat/completions` also works.
- Start the local model server before generating. Ollama defaults to `http://127.0.0.1:11434/v1` and LM Studio to `http://127.0.0.1:1234/v1`. Change the port if your server uses another one. Leave the key blank if your local server does not require authentication.
- Remote services use HTTPS. HTTP is available for loopback addresses.

## Example Input

```text
Project name: AgentApplyKit
Target users: Developers, students, individual creators
Idea: Turn rough project ideas into structured application materials, including project position, pain points, Agent workflow, application copy, README draft, and proof-material suggestions.
Progress: Local Web Demo with model API generation
Application type: Model Token / API quota application
Focus: Agent workflow, visible demo, faster application preparation
```

## Example Application Copy

我构建了一个名为 AgentApplyKit 的 Agent 项目材料生成工具，面向开发者、学生和个人创作者，帮助用户将零散的项目想法快速整理为项目定位、核心痛点、Agent 工作流、申请描述、README 草稿和证明材料清单。当前版本已实现本地 Web Demo，并接入 DeepSeek API 进行增强生成验证，能够展示模型 API 在表达完整性、材料结构化和申请效率提升方面的实际价值。

## Proof Materials for Application Review

- Home page screenshot showing the input panel, output panel, Agent workflow, and API mode.
- Short screen recording showing local generation and model API generation.
- Screenshot of the generated application copy.
- Screenshot of the generated README draft.
- GitHub repository link showing source code, project structure, and running instructions.

## API Key Safety

- Do not commit real API keys.
- Do not paste real API keys into README, issues, screenshots, or commit messages.
- If you choose to remember a key for a built-in cloud service, it is stored in this browser's `localStorage` under that service's name.
- Online generation sends the project inputs and the selected key to the configured model service. Environment keys are used only with the corresponding service's preset URL.
- Before publishing publicly, check that no `.env`, logs, generated Markdown, or screenshots contain secrets.

## Tests

Run `npm test` to check the three API protocols, response parsing, and key routing against mock responses. The tests run without service accounts or API keys.

## Future Work

- Add more application templates for developer grants, hackathons, and open-source showcases.
- Add history and multi-project comparison.
- Export the generated materials as PDF or DOCX.
- Compare multiple models for wording quality and application-readiness.
- Add screenshot examples after the first public demo recording is prepared.
