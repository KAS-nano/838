export type ModelArtifactLink = {
  label: string;
  format: "GGUF" | "Safetensors";
  quantization: string;
  publisher: string;
  community: boolean;
  url: string;
  verifiedAt: string;
  split?: boolean;
};

export type ModelExternalLinks = {
  modelName: string;
  official: { label: string; publisher: string; url: string };
  variants: ModelArtifactLink[];
  note?: string;
};

const verifiedAt = "2026-09-09";
const hf = "https://huggingface.co";
const original = (repo: string, publisher: string, precision = "BF16"): ModelArtifactLink => ({
  label: "Pesos originais", format: "Safetensors", quantization: precision, publisher,
  community: false, url: `${hf}/${repo}/tree/main`, verifiedAt, split: true,
});
const gguf = (repo: string, publisher: string, quantization: string, filename?: string, community = true): ModelArtifactLink => ({
  label: `Arquivo ${quantization}`, format: "GGUF", quantization, publisher, community,
  url: `${hf}/${repo}/${filename ? `blob/main/${filename}` : "tree/main"}`, verifiedAt,
});
const entry = (modelName: string, repo: string, publisher: string, variants: ModelArtifactLink[], note?: string): ModelExternalLinks => ({
  modelName, official: { label: "Model card e arquivos originais", publisher, url: `${hf}/${repo}` }, variants: [original(repo, publisher, modelName === "Command R 35B" ? "FP16" : "BF16"), ...variants], note,
});

export const modelExternalLinks: Record<string, ModelExternalLinks> = {
  "qwen3-8b": entry("Qwen3 8B", "Qwen/Qwen3-8B", "Qwen", [
    gguf("Qwen/Qwen3-8B-GGUF", "Qwen", "Q4_K_M", "Qwen3-8B-Q4_K_M.gguf", false),
    gguf("Qwen/Qwen3-8B-GGUF", "Qwen", "Q8_0", "Qwen3-8B-Q8_0.gguf", false),
  ]),
  "qwen3-14b": entry("Qwen3 14B", "Qwen/Qwen3-14B", "Qwen", [
    gguf("Qwen/Qwen3-14B-GGUF", "Qwen", "Q4_K_M", "Qwen3-14B-Q4_K_M.gguf", false),
    gguf("Qwen/Qwen3-14B-GGUF", "Qwen", "Q8_0", "Qwen3-14B-Q8_0.gguf", false),
  ]),
  "qwen3-coder-30b": entry("Qwen3 Coder 30B A3B Instruct", "Qwen/Qwen3-Coder-30B-A3B-Instruct", "Qwen", [
    gguf("unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF", "Unsloth", "Q4_K_M", "Qwen3-Coder-30B-A3B-Instruct-Q4_K_M.gguf"),
    gguf("unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF", "Unsloth", "Q5_K_S", "Qwen3-Coder-30B-A3B-Instruct-Q5_K_S.gguf"),
    gguf("unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF", "Unsloth", "Q8_0", "Qwen3-Coder-30B-A3B-Instruct-Q8_0.gguf"),
  ]),
  "gemma3-4b": entry("Gemma 3 4B IT", "google/gemma-3-4b-it", "Google", [
    gguf("unsloth/gemma-3-4b-it-GGUF", "Unsloth", "Q4_K_M", "gemma-3-4b-it-Q4_K_M.gguf"),
    gguf("unsloth/gemma-3-4b-it-GGUF", "Unsloth", "Q5_K_S", "gemma-3-4b-it-Q5_K_S.gguf"),
    gguf("unsloth/gemma-3-4b-it-GGUF", "Unsloth", "Q8_0", "gemma-3-4b-it-Q8_0.gguf"),
  ], "Para usar visão em GGUF, confira também o arquivo mmproj indicado pelo quantizador."),
  "gemma3-12b": entry("Gemma 3 12B IT", "google/gemma-3-12b-it", "Google", [
    gguf("unsloth/gemma-3-12b-it-GGUF", "Unsloth", "Q4_K_M", "gemma-3-12b-it-Q4_K_M.gguf"),
    gguf("unsloth/gemma-3-12b-it-GGUF", "Unsloth", "Q5_K_S", "gemma-3-12b-it-Q5_K_S.gguf"),
    gguf("unsloth/gemma-3-12b-it-GGUF", "Unsloth", "Q8_0", "gemma-3-12b-it-Q8_0.gguf"),
  ], "Para usar visão em GGUF, confira também o arquivo mmproj indicado pelo quantizador."),
  "gemma3-27b": entry("Gemma 3 27B IT", "google/gemma-3-27b-it", "Google", [
    gguf("bartowski/google_gemma-3-27b-it-GGUF", "bartowski", "Q4_K_M", "google_gemma-3-27b-it-Q4_K_M.gguf"),
    gguf("bartowski/google_gemma-3-27b-it-GGUF", "bartowski", "Q5_K_S", "google_gemma-3-27b-it-Q5_K_S.gguf"),
    gguf("bartowski/google_gemma-3-27b-it-GGUF", "bartowski", "Q8_0", "google_gemma-3-27b-it-Q8_0.gguf"),
  ], "Para usar visão em GGUF, confira também o arquivo mmproj indicado pelo quantizador."),
  "mistral-small-24b": entry("Mistral Small 24B Instruct 2501", "mistralai/Mistral-Small-24B-Instruct-2501", "Mistral AI", [
    gguf("bartowski/Mistral-Small-24B-Instruct-2501-GGUF", "bartowski", "Q4_K_M", "Mistral-Small-24B-Instruct-2501-Q4_K_M.gguf"),
    gguf("bartowski/Mistral-Small-24B-Instruct-2501-GGUF", "bartowski", "Q5_K_S", "Mistral-Small-24B-Instruct-2501-Q5_K_S.gguf"),
    gguf("bartowski/Mistral-Small-24B-Instruct-2501-GGUF", "bartowski", "Q8_0", "Mistral-Small-24B-Instruct-2501-Q8_0.gguf"),
  ]),
  "phi4-14b": entry("Phi-4 14B", "microsoft/phi-4", "Microsoft", [
    gguf("unsloth/phi-4-GGUF", "Unsloth", "Q4_K_M"), gguf("unsloth/phi-4-GGUF", "Unsloth", "Q8_0"),
  ], "Os links GGUF abrem o repositório da versão; confirme o nome exato do arquivo antes de baixar."),
  "deepseek-r1-distill-14b": entry("DeepSeek R1 Distill Qwen 14B", "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B", "DeepSeek", [
    gguf("unsloth/DeepSeek-R1-Distill-Qwen-14B-GGUF", "Unsloth", "Q4_K_M", "DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf"),
    gguf("unsloth/DeepSeek-R1-Distill-Qwen-14B-GGUF", "Unsloth", "Q8_0", "DeepSeek-R1-Distill-Qwen-14B-Q8_0.gguf"),
  ]),
  "llama-3.3-8b": entry("Llama 3.1 8B Instruct", "meta-llama/Llama-3.1-8B-Instruct", "Meta", [
    gguf("bartowski/Meta-Llama-3.1-8B-Instruct-GGUF", "bartowski", "Q4_K_M", "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf"),
    gguf("bartowski/Meta-Llama-3.1-8B-Instruct-GGUF", "bartowski", "Q5_K_S", "Meta-Llama-3.1-8B-Instruct-Q5_K_S.gguf"),
    gguf("bartowski/Meta-Llama-3.1-8B-Instruct-GGUF", "bartowski", "Q8_0", "Meta-Llama-3.1-8B-Instruct-Q8_0.gguf"),
  ], "O identificador interno legado menciona 3.3; o modelo concreto exibido e vinculado é o Llama 3.1 8B Instruct."),
  "qwen3-4b": entry("Qwen3 4B", "Qwen/Qwen3-4B", "Qwen", [gguf("Qwen/Qwen3-4B-GGUF", "Qwen", "Q4_K_M", "Qwen3-4B-Q4_K_M.gguf", false), gguf("Qwen/Qwen3-4B-GGUF", "Qwen", "Q8_0", "Qwen3-4B-Q8_0.gguf", false)]),
  "qwen3-32b": entry("Qwen3 32B", "Qwen/Qwen3-32B", "Qwen", [gguf("Qwen/Qwen3-32B-GGUF", "Qwen", "Q4_K_M", "Qwen3-32B-Q4_K_M.gguf", false), gguf("Qwen/Qwen3-32B-GGUF", "Qwen", "Q8_0", "Qwen3-32B-Q8_0.gguf", false)]),
  "qwen3-1.7b": entry("Qwen3 1.7B", "Qwen/Qwen3-1.7B", "Qwen", [gguf("rippertnt/Qwen3-1.7B-Q4_K_M-GGUF", "rippertnt", "Q4_K_M"), gguf("Qwen/Qwen3-1.7B-GGUF", "Qwen", "Q8_0", "Qwen3-1.7B-Q8_0.gguf", false)]),
  "ministral-8b": entry("Ministral 8B Instruct 2410", "mistralai/Ministral-8B-Instruct-2410", "Mistral AI", [gguf("cstr/Ministral-8B-Instruct-2410-GGUF", "cstr", "Q4_K_M", "Ministral-8B-Instruct-2410_Q4_K_M-bpefix.gguf"), gguf("ijohn07/Ministral-8B-Instruct-2410-HF-Q8_0-GGUF", "ijohn07", "Q8_0")]),
  "granite-8b-code": entry("Granite 8B Code Instruct 4K", "ibm-granite/granite-8b-code-instruct-4k", "IBM Granite", [gguf("YorkieOH10/granite-8b-code-instruct-Q4_K_M-GGUF", "YorkieOH10", "Q4_K_M"), gguf("YorkieOH10/granite-8b-code-instruct-Q8_0-GGUF", "YorkieOH10", "Q8_0")]),
  "command-r-35b": entry("Command R 35B", "CohereLabs/c4ai-command-r-v01", "Cohere Labs", [gguf("bartowski/c4ai-command-r-v01-GGUF", "bartowski", "Q4_K_M", "c4ai-command-r-v01-Q4_K_M.gguf"), gguf("bartowski/c4ai-command-r-v01-GGUF", "bartowski", "Q5_K_S", "c4ai-command-r-v01-Q5_K_S.gguf"), gguf("bartowski/c4ai-command-r-v01-GGUF", "bartowski", "Q8_0", "c4ai-command-r-v01-Q8_0.gguf")]),
  "nemotron-15b": entry("Apriel-Nemotron 15B Thinker", "ServiceNow-AI/Apriel-Nemotron-15b-Thinker", "ServiceNow AI", [gguf("bartowski/ServiceNow-AI_Apriel-Nemotron-15b-Thinker-GGUF", "bartowski", "Q4_K_M", "ServiceNow-AI_Apriel-Nemotron-15b-Thinker-Q4_K_M.gguf"), gguf("bartowski/ServiceNow-AI_Apriel-Nemotron-15b-Thinker-GGUF", "bartowski", "Q5_K_S", "ServiceNow-AI_Apriel-Nemotron-15b-Thinker-Q5_K_S.gguf"), gguf("bartowski/ServiceNow-AI_Apriel-Nemotron-15b-Thinker-GGUF", "bartowski", "Q8_0", "ServiceNow-AI_Apriel-Nemotron-15b-Thinker-Q8_0.gguf")], "Este item é a versão concreta publicada pela ServiceNow AI; não é o Nemotron Ultra 253B nem a família Nano."),
};

export const getModelExternalLinks = (id: string) => modelExternalLinks[id];
