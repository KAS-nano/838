# 838 Hardware Agent

Aplicativo Tauri/Rust opcional. A primeira versão só lê hardware local; não instala software, não executa comandos recebidos do site e não envia dados automaticamente.

## Build futuro
- Rust 1.95+ (exigido pelo sysinfo 0.39.6)
- Tauri CLI 2.11.x
- Dependências nativas do Tauri para o SO

`cargo tauri dev` / `cargo tauri build` após instalar o toolchain.

A detecção de GPU é best-effort. O snapshot v2 não coleta hostname, limita a oito GPUs e informa falhas parciais em `fieldWarnings`. No Linux, a leitura do sysfs é limitada; no Windows e macOS, consultas fixas somente de leitura têm timeout de cinco segundos, saída limitada a 64 KiB e JSON convertido para campos tipados.

Antes de distribuir, execute `cargo fmt --check`, `cargo clippy -- -D warnings` e `cargo test` com Rust 1.95 ou superior. Esses comandos não rodam no build web da Vercel.
