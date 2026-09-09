# 838 Hardware Agent

Aplicativo Tauri/Rust opcional. A primeira versão só lê hardware local; não instala software, não executa comandos recebidos do site e não envia dados automaticamente.

## Build futuro
- Rust 1.95+ (exigido pelo sysinfo 0.39.6)
- Tauri CLI 2.11.x
- Dependências nativas do Tauri para o SO

`cargo tauri dev` / `cargo tauri build` após instalar o toolchain.

A detecção de GPU é best-effort. No Linux lê sysfs; no Windows/macOS usa consultas somente de leitura. A normalização do nome da GPU será refinada antes de produção.
