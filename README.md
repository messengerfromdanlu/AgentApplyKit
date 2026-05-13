# AgentApplyKit

AgentApplyKit is a small AI/Agent application workspace for turning rough project ideas into structured application materials. It helps developers, students, and individual creators prepare clear project narratives for Token/API quota applications, developer programs, open-source showcases, hackathons, and similar submission scenarios.

The project started as a fast local demo and has now been upgraded with DeepSeek API support so the workflow can be validated with a real model.

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
- Switch between local rule-based generation and DeepSeek API enhanced generation.
- Copy the current output or download the full result as Markdown.

## Generation Modes

### Local Rule Engine

The local mode uses deterministic templates and lightweight rules. It does not require an API key and is useful for stable demonstrations, offline testing, and fallback generation.

### DeepSeek API Enhanced Generation

The API mode calls DeepSeek through a local Node.js proxy. The browser sends the project inputs to the local `/api/generate` endpoint, and the local server forwards the request to DeepSeek's OpenAI-compatible Chat Completions API.

This keeps the frontend simple and avoids hardcoding API keys into the repository.

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
- API generation: local `/api/generate` proxy to DeepSeek Chat Completions
- Dependencies: zero third-party runtime dependencies

## Project Structure

```text
AgentApplyKit/
  index.html
  package.json
  README.md
  server.mjs
  src/
    app.js
    styles.css
```

## Quick Start

```bash
cd AgentApplyKit
npm run dev
```

Open:

```text
http://localhost:5173
```

## Using DeepSeek API

You can use the page directly:

1. Start the local server.
2. Open `http://localhost:5173`.
3. Fill in your project materials.
4. Enter your DeepSeek API Key in the API section.
5. Click `DeepSeek 生成`.

You can also provide the key through an environment variable.

PowerShell:

```powershell
$env:DEEPSEEK_API_KEY="sk-your-key"
npm run dev
```

macOS / Linux:

```bash
DEEPSEEK_API_KEY="sk-your-key" npm run dev
```

Default API Base:

```text
https://api.deepseek.com
```

Default model:

```text
deepseek-v4-flash
```

The UI also includes `deepseek-v4-pro` and `deepseek-chat` as selectable options for compatibility with different account or documentation versions.

## Example Input

```text
Project name: AgentApplyKit
Target users: Developers, students, individual creators
Idea: Turn rough project ideas into structured application materials, including project position, pain points, Agent workflow, application copy, README draft, and proof-material suggestions.
Progress: Local Web Demo with DeepSeek API validation
Application type: Model Token / API quota application
Focus: Agent workflow, visible demo, faster application preparation
```

## Example Application Copy

我构建了一个名为 AgentApplyKit 的 Agent 项目材料生成工具，面向开发者、学生和个人创作者，帮助用户将零散的项目想法快速整理为项目定位、核心痛点、Agent 工作流、申请描述、README 草稿和证明材料清单。当前版本已实现本地 Web Demo，并接入 DeepSeek API 进行增强生成验证，能够展示模型 API 在表达完整性、材料结构化和申请效率提升方面的实际价值。

## Proof Materials for Application Review

- Home page screenshot showing the input panel, output panel, Agent workflow, and API mode.
- Short screen recording showing local generation and DeepSeek API enhanced generation.
- Screenshot of the generated application copy.
- Screenshot of the generated README draft.
- GitHub repository link showing source code, project structure, and running instructions.

## API Key Safety

- Do not commit real API keys.
- Do not paste real API keys into README, issues, screenshots, or commit messages.
- If `remember key` is enabled, the key is stored only in the current browser's `localStorage`.
- The key is sent from the browser to the local Node.js server, then forwarded to DeepSeek.
- Before publishing publicly, check that no `.env`, logs, generated Markdown, or screenshots contain secrets.

## Validation Status

- Local syntax check passes for `src/app.js`.
- Local syntax check passes for `server.mjs`.
- Static files can be served through the local Node server.
- `/api/generate` returns a clear error when no API key is provided.
- DeepSeek API mode has been manually tested by the project owner.

## Future Work

- Add more application templates for developer grants, hackathons, and open-source showcases.
- Add history and multi-project comparison.
- Export the generated materials as PDF or DOCX.
- Compare multiple models for wording quality and application-readiness.
- Add screenshot examples after the first public demo recording is prepared.
