use serde::Serialize;
use sysinfo::System;

#[cfg(target_os = "linux")]
use std::fs;

const MAX_GPUS: usize = 8;
const MAX_LABEL_CHARS: usize = 160;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct GpuInfo {
    name: String,
    vendor: String,
    vram_bytes: Option<u64>,
    memory_kind: String,
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
    gpus: Vec<GpuInfo>,
    field_warnings: Vec<String>,
    privacy_note: String,
}

fn safe_label(value: &str, fallback: &str) -> String {
    let clean: String = value
        .chars()
        .filter(|character| !character.is_control())
        .collect();
    let trimmed = clean.trim();
    if trimmed.is_empty() {
        fallback.to_string()
    } else {
        trimmed.chars().take(MAX_LABEL_CHARS).collect()
    }
}

#[tauri::command]
fn get_hardware_snapshot() -> HardwareSnapshot {
    let mut system = System::new_all();
    system.refresh_all();
    let cpu = system
        .cpus()
        .first()
        .map(|value| safe_label(value.brand(), "Desconhecida"))
        .unwrap_or_else(|| "Desconhecida".into());
    let (gpus, field_warnings) = detect_gpus();
    HardwareSnapshot {
        schema_version: 2,
        cpu,
        logical_cpus: system.cpus().len(),
        ram_bytes: system.total_memory(),
        os_name: safe_label(&System::name().unwrap_or_else(|| std::env::consts::OS.into()), std::env::consts::OS),
        os_version: safe_label(&System::os_version().unwrap_or_default(), "Desconhecida"),
        gpus,
        field_warnings,
        privacy_note: "O snapshot não contém hostname, usuário ou arquivos e permanece local até o usuário escolher compartilhá-lo com o 838.".into(),
    }
}

#[cfg(target_os = "linux")]
fn detect_gpus() -> (Vec<GpuInfo>, Vec<String>) {
    let mut gpus = Vec::new();
    let mut warnings = Vec::new();
    match fs::read_dir("/sys/class/drm") {
        Ok(entries) => {
            for entry in entries.flatten() {
                if gpus.len() == MAX_GPUS {
                    warnings.push("gpu-limit-reached".into());
                    break;
                }
                let card = entry.file_name().to_string_lossy().to_string();
                if !card.starts_with("card") || card.contains('-') {
                    continue;
                }
                let device = entry.path().join("device");
                let vendor =
                    vendor_from_id(read_small_file(&device.join("vendor")).trim()).to_string();
                let vram_bytes = read_small_file(&device.join("mem_info_vram_total"))
                    .trim()
                    .parse::<u64>()
                    .ok();
                gpus.push(GpuInfo {
                    name: safe_label(&card, "GPU desconhecida"),
                    vendor,
                    vram_bytes,
                    memory_kind: if vram_bytes.is_some() {
                        "dedicated"
                    } else {
                        "unknown"
                    }
                    .into(),
                    source: "sysfs".into(),
                });
            }
        }
        Err(_) => warnings.push("gpu-sysfs-unavailable".into()),
    }
    if gpus.is_empty() {
        warnings.push("gpu-not-detected".into());
    }
    (gpus, warnings)
}

#[cfg(target_os = "linux")]
fn read_small_file(path: &std::path::Path) -> String {
    use std::io::Read;
    let Ok(file) = fs::File::open(path) else {
        return String::new();
    };
    let mut value = String::new();
    let _ = file.take(4096).read_to_string(&mut value);
    value
}

#[cfg(any(target_os = "linux", test))]
fn vendor_from_id(value: &str) -> &'static str {
    match value.to_ascii_lowercase().as_str() {
        "0x1002" => "AMD",
        "0x10de" => "NVIDIA",
        "0x8086" => "Intel",
        _ => "Desconhecido",
    }
}

#[cfg(any(target_os = "windows", target_os = "macos"))]
fn run_native(program: &str, args: &[&str]) -> Result<String, String> {
    use std::io::Read;
    use std::process::{Command, Stdio};
    use std::thread;
    use std::time::{Duration, Instant};
    const MAX_OUTPUT: u64 = 64 * 1024;
    let mut child = Command::new(program)
        .args(args)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|_| "native-command-unavailable".to_string())?;
    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| "native-output-unavailable".to_string())?;
    let reader = thread::spawn(move || {
        let mut bytes = Vec::new();
        let _ = stdout.take(MAX_OUTPUT + 1).read_to_end(&mut bytes);
        bytes
    });
    let deadline = Instant::now() + Duration::from_secs(5);
    let status = loop {
        if let Some(status) = child
            .try_wait()
            .map_err(|_| "native-command-failed".to_string())?
        {
            break status;
        }
        if Instant::now() >= deadline {
            let _ = child.kill();
            let _ = child.wait();
            return Err("native-command-timeout".into());
        }
        thread::sleep(Duration::from_millis(25));
    };
    let bytes = reader
        .join()
        .map_err(|_| "native-output-failed".to_string())?;
    if !status.success() {
        return Err("native-command-failed".into());
    }
    if bytes.len() as u64 > MAX_OUTPUT {
        return Err("native-output-too-large".into());
    }
    String::from_utf8(bytes).map_err(|_| "native-output-invalid-utf8".into())
}

#[cfg(target_os = "windows")]
fn detect_gpus() -> (Vec<GpuInfo>, Vec<String>) {
    let script = "Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM | ConvertTo-Json -Compress";
    run_native(
        "powershell",
        &["-NoProfile", "-NonInteractive", "-Command", script],
    )
    .map(|text| parse_native_gpus(&text, "windows-cim", false))
    .unwrap_or_else(|warning| (Vec::new(), vec![warning]))
}

#[cfg(target_os = "macos")]
fn detect_gpus() -> (Vec<GpuInfo>, Vec<String>) {
    run_native("system_profiler", &["SPDisplaysDataType", "-json"])
        .map(|text| parse_native_gpus(&text, "macos-system-profiler", true))
        .unwrap_or_else(|warning| (Vec::new(), vec![warning]))
}

#[cfg(any(target_os = "windows", target_os = "macos"))]
fn parse_native_gpus(text: &str, source: &str, unified: bool) -> (Vec<GpuInfo>, Vec<String>) {
    let Ok(value) = serde_json::from_str::<serde_json::Value>(text) else {
        return (Vec::new(), vec!["gpu-output-invalid-json".into()]);
    };
    let candidates: Vec<&serde_json::Value> = value
        .as_array()
        .map(|items| items.iter().collect())
        .or_else(|| {
            value
                .get("SPDisplaysDataType")
                .and_then(|item| item.as_array())
                .map(|items| items.iter().collect())
        })
        .unwrap_or_else(|| vec![&value]);
    let mut gpus = Vec::new();
    for candidate in candidates.into_iter().take(MAX_GPUS) {
        let name = candidate
            .get("Name")
            .or_else(|| candidate.get("sppci_model"))
            .or_else(|| candidate.get("_name"))
            .and_then(|item| item.as_str())
            .unwrap_or("GPU desconhecida");
        let clean_name = safe_label(name, "GPU desconhecida");
        let lower = clean_name.to_ascii_lowercase();
        let vendor = if unified {
            "Apple"
        } else if lower.contains("nvidia") {
            "NVIDIA"
        } else if lower.contains("amd") || lower.contains("radeon") {
            "AMD"
        } else if lower.contains("intel") {
            "Intel"
        } else {
            "Desconhecido"
        };
        let vram_bytes = candidate.get("AdapterRAM").and_then(|item| item.as_u64());
        gpus.push(GpuInfo {
            name: clean_name,
            vendor: vendor.into(),
            vram_bytes,
            memory_kind: if unified {
                "unified"
            } else if vram_bytes.is_some() {
                "dedicated"
            } else {
                "unknown"
            }
            .into(),
            source: source.into(),
        });
    }
    let warnings = if gpus.is_empty() {
        vec!["gpu-not-detected".into()]
    } else {
        Vec::new()
    };
    (gpus, warnings)
}

#[cfg(not(any(target_os = "linux", target_os = "windows", target_os = "macos")))]
fn detect_gpus() -> (Vec<GpuInfo>, Vec<String>) {
    (Vec::new(), vec!["gpu-platform-unsupported".into()])
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_hardware_snapshot])
        .run(tauri::generate_context!())
        .expect("erro ao executar 838 Hardware Agent");
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn labels_drop_controls_and_apply_limit() {
        let result = safe_label(&format!(" GPU\n{}", "x".repeat(200)), "fallback");
        assert!(!result.contains('\n'));
        assert_eq!(result.chars().count(), MAX_LABEL_CHARS);
    }
    #[test]
    fn vendor_ids_are_normalized() {
        assert_eq!(vendor_from_id("0X10DE"), "NVIDIA");
        assert_eq!(vendor_from_id("0x1002"), "AMD");
        assert_eq!(vendor_from_id("private"), "Desconhecido");
    }
}
