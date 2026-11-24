export const defaultProvider = "deepseek";

export const providers = {
  deepseek: {
    label: "DeepSeek",
    apiBase: "https://api.deepseek.com",
    model: "deepseek-flash",
    keyEnv: "DEEPSEEK_API_KEY",
  },
  openai: {
    label: "OpenAI",
    apiBase: "https://api.openai.com/v1",
    model: "gpt-5-mini",
    keyEnv: "OPENAI_API_KEY",
  },
  anthropic: {
    label: "Anthropic Claude",
    apiBase: "https://api.anthropic.com/v1",
    model: "claude-haiku-5-5",
    keyEnv: "ANTHROPIC_API_KEY",
  },
  gemini: {
    label: "Google Gemini",
    apiBase: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-3.5-flash-lite",
    keyEnv: "GEMINI_API_KEY",
  },
  openrouter: {
    label: "OpenRouter",
    apiBase: "https://openrouter.ai/api/v1",
    model: "openai/gpt-5-mini",
    keyEnv: "OPENROUTER_API_KEY",
  },
  ollama: {
    label: "Ollama",
    apiBase: "http://127.0.0.1:11434/v1",
    editableBase: true,
  },
  lmstudio: {
    label: "LM Studio",
    apiBase: "http://127.0.0.1:1234/v1",
    editableBase: true,
  },
  compatible: {
    label: "自定义 OpenAI 兼容",
    editableBase: true,
  },
};
