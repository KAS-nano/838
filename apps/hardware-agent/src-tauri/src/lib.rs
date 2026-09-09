use serde::Serialize;
use std::fs;
use sysinfo::System;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct GpuInfo {
    name: String,
    vendor: String,
    vram_bytes: Option<u64>,
    source: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HardwareSnapshot {
    schema_version: u8,
    cpu: String,
    logical_cpus: usize,
    ram_bytes: u64,
    os_name: String,
    os_version: String,
    hostname: String,
    gpus: Vec<GpuInfo>,
    privacy_note: String,
}

#[tauri::command]
fn get_hardware_snapshot() -> HardwareSnapshot {
    let mut system = System::new_all();
    system.refresh_all();
    let cpu = system.cpus().first().map(|c| c.brand().to_string()).unwrap_or_else(|| "Desconhecida".into());
    HardwareSnapshot {
        schema_version: 1,
        cpu,
        logical_cpus: system.cpus().len(),
        ram_bytes: system.total_memory(),
        os_name: System::name().unwrap_or_else(|| std::env::consts::OS.into()),
        os_version: System::os_version().unwrap_or_default(),
        hostname: System::host_name().unwrap_or_default(),
        gpus: detect_gpus(),
        privacy_note: "O snapshot permanece local até o usuário escolher compartilhá-lo com o 838.".into(),
    }
}

#[cfg(target_os = "linux")]
fn detect_gpus() -> Vec<GpuInfo> {
    let mut out = Vec::new();
    if let Ok(entries) = fs::read_dir("/sys/class/drm") {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if !name.starts_with("card") || name.contains('-') { continue; }
            let device = entry.path().join("device");
            let vendor_id = fs::read_to_string(device.join("vendor")).unwrap_or_default().trim().to_string();
            let vendor = match vendor_id.as_str() { "0x1002" => "AMD", "0x10de" => "NVIDIA", "0x8086" => "Intel", _ => "Desconhecido" }.to_string();
            let vram_bytes = fs::read_to_string(device.join("mem_info_vram_total")).ok().and_then(|x| x.trim().parse::<u64>().ok());
            out.push(GpuInfo { name, vendor, vram_bytes, source: "sysfs".into() });
        }
    }
    out
}

#[cfg(target_os = "windows")]
fn detect_gpus() -> Vec<GpuInfo> {
    use std::process::Command;
    let script = "Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM | ConvertTo-Json -Compress";
    let text = Command::new("powershell").args(["-NoProfile", "-Command", script]).output().ok().map(|o| String::from_utf8_lossy(&o.stdout).to_string()).unwrap_or_default();
    vec![GpuInfo { name: if text.is_empty(){"GPU não detectada".into()}else{text}, vendor:"Consultar nome".into(), vram_bytes:None, source:"PowerShell CIM (best effort)".into() }]
}

#[cfg(target_os = "macos")]
fn detect_gpus() -> Vec<GpuInfo> {
    use std::process::Command;
    let text = Command::new("system_profiler").args(["SPDisplaysDataType", "-json"]).output().ok().map(|o| String::from_utf8_lossy(&o.stdout).to_string()).unwrap_or_default();
    vec![GpuInfo { name: if text.is_empty(){"GPU Apple não detectada".into()}else{text}, vendor:"Apple".into(), vram_bytes:None, source:"system_profiler (memória unificada)".into() }]
}

#[cfg(not(any(target_os = "linux", target_os = "windows", target_os = "macos")))]
fn detect_gpus() -> Vec<GpuInfo> { Vec::new() }

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_hardware_snapshot])
        .run(tauri::generate_context!())
        .expect("erro ao executar 838 Hardware Agent");
}
