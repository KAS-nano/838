# Third-party notices

Este projeto usa dependências de terceiros. Antes de distribuição comercial, confirme a licença da versão efetivamente empacotada e gere notices completos a partir do lockfile.

Principais componentes planejados/usados:
- Next.js / React;
- Tailwind CSS;
- Prisma;
- Better Auth;
- Tauri;
- sysinfo;
- lucide-react;
- Radix Slot.

Geração e verificação do QR Code de apoio:
- `qrcode` 1.5.4 — MIT, geração local durante o build; https://github.com/soldair/node-qrcode.
- `jsqr` 1.4.0 — Apache-2.0, decodificação independente nos testes; https://github.com/cozmo/jsQR.
- `cargo-cyclonedx` 0.5.9 — Apache-2.0, geração do SBOM Rust em releases; https://github.com/CycloneDX/cyclonedx-rust-cargo.
- `cargo-deny` 0.20.2 — Apache-2.0/MIT, auditoria de advisories, licenças e fontes Rust; https://github.com/EmbarkStudios/cargo-deny.

Projetos considerados como integração/referência, sem white-label do código neste pacote:
- Ollama;
- llama.cpp;
- Hugging Face JavaScript tooling;
- LM Studio APIs;
- OpenRouter API.

Open WebUI não é base do 838; foi tratado apenas como referência de produto devido às condições atuais de branding/licença.
