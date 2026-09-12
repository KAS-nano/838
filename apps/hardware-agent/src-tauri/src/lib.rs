use serde::Serialize;
use sysinfo::System;

#[cfg(any(target_os = "linux", test))]
use std::fs;

const MAX_GPUS: usize = 8;
const MAX_LABEL_CHARS: usize = 160;
#[cfg(any(target_os = "windows", target_os = "macos", test))]
const MAX_NATIVE_OUTPUT_BYTES: usize = 64 * 1024;

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
    detect_linux_gpus(std::path::Path::new("/sys/class/drm"))
}

#[cfg(any(target_os = "linux", test))]
fn detect_linux_gpus(root: &std::path::Path) -> (Vec<GpuInfo>, Vec<String>) {
    let mut gpus = Vec::new();
    let mut warnings = Vec::new();
    match fs::read_dir(root) {
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

#[cfg(any(target_os = "linux", test))]
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
    run_native_with_limits(
        program,
        args,
        std::time::Duration::from_secs(5),
        MAX_NATIVE_OUTPUT_BYTES,
    )
}

#[cfg(any(target_os = "windows", target_os = "macos", test))]
fn run_native_with_limits(
    program: &str,
    args: &[&str],
    timeout: std::time::Duration,
    max_output_bytes: usize,
) -> Result<String, String> {
    use std::io::Read;
    use std::process::{Command, Stdio};
    use std::thread;
    use std::time::{Duration, Instant};
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
        let _ = stdout
            .take(max_output_bytes as u64 + 1)
            .read_to_end(&mut bytes);
        bytes
    });
    let deadline = Instant::now() + timeout;
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
    if bytes.len() > max_output_bytes {
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

#[cfg(any(target_os = "windows", target_os = "macos", test))]
fn parse_native_gpus(text: &str, source: &str, unified: bool) -> (Vec<GpuInfo>, Vec<String>) {
    if text.len() > MAX_NATIVE_OUTPUT_BYTES {
        return (Vec::new(), vec!["native-output-too-large".into()]);
    }
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
    let mut warnings = Vec::new();
    if candidates.len() > MAX_GPUS {
        warnings.push("gpu-limit-reached".into());
    }
    let mut gpus = Vec::new();
    for candidate in candidates.into_iter().take(MAX_GPUS) {
        let Some(name) = candidate
            .get("Name")
            .or_else(|| candidate.get("sppci_model"))
            .or_else(|| candidate.get("_name"))
            .and_then(|item| item.as_str())
        else {
            continue;
        };
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
    if gpus.is_empty() {
        warnings.push("gpu-not-detected".into());
    }
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

    #[test]
    fn windows_cim_fixture_is_typed() {
        let (gpus, warnings) = parse_native_gpus(
            include_str!("../tests/fixtures/gpu/windows-single.json"),
            "windows-cim",
            false,
        );
        assert!(warnings.is_empty());
        assert_eq!(gpus.len(), 2);
        assert_eq!(gpus[0].vendor, "NVIDIA");
        assert_eq!(gpus[0].vram_bytes, Some(8_589_934_592));
        assert_eq!(gpus[0].memory_kind, "dedicated");
        assert_eq!(gpus[1].vendor, "Intel");
    }

    #[test]
    fn macos_fixture_uses_unified_memory() {
        let (gpus, warnings) = parse_native_gpus(
            include_str!("../tests/fixtures/gpu/macos-single.json"),
            "macos-system-profiler",
            true,
        );
        assert!(warnings.is_empty());
        assert_eq!(gpus.len(), 1);
        assert_eq!(gpus[0].name, "Apple M3 Pro");
        assert_eq!(gpus[0].vendor, "Apple");
        assert_eq!(gpus[0].memory_kind, "unified");
        assert_eq!(gpus[0].vram_bytes, None);
    }

    #[test]
    fn empty_and_invalid_outputs_are_reported() {
        let (empty, empty_warnings) = parse_native_gpus(
            include_str!("../tests/fixtures/gpu/windows-empty.json"),
            "windows-cim",
            false,
        );
        assert!(empty.is_empty());
        assert_eq!(empty_warnings, vec!["gpu-not-detected"]);
        let (invalid, invalid_warnings) = parse_native_gpus(
            include_str!("../tests/fixtures/gpu/invalid.json"),
            "windows-cim",
            false,
        );
        assert!(invalid.is_empty());
        assert_eq!(invalid_warnings, vec!["gpu-output-invalid-json"]);
    }

    #[test]
    fn native_output_size_and_gpu_count_are_limited() {
        let huge = "x".repeat(MAX_NATIVE_OUTPUT_BYTES + 1);
        let (_, huge_warnings) = parse_native_gpus(&huge, "windows-cim", false);
        assert_eq!(huge_warnings, vec!["native-output-too-large"]);
        let (gpus, warnings) = parse_native_gpus(
            include_str!("../tests/fixtures/gpu/windows-many.json"),
            "windows-cim",
            false,
        );
        assert_eq!(gpus.len(), MAX_GPUS);
        assert_eq!(warnings, vec!["gpu-limit-reached"]);
    }

    #[test]
    fn linux_sysfs_fixture_is_typed() {
        let root =
            std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/gpu/linux");
        let (gpus, warnings) = detect_linux_gpus(&root);
        assert!(warnings.is_empty());
        assert_eq!(gpus.len(), 2);
        assert_eq!(gpus[0].vendor, "NVIDIA");
        assert_eq!(gpus[0].vram_bytes, Some(8_589_934_592));
        assert_eq!(gpus[0].memory_kind, "dedicated");
        assert_eq!(gpus[1].vendor, "Intel");
        assert_eq!(gpus[1].memory_kind, "unknown");
    }

    #[test]
    fn linux_missing_sysfs_reports_partial_detection() {
        let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("tests/fixtures/gpu/linux-missing");
        let (gpus, warnings) = detect_linux_gpus(&root);
        assert!(gpus.is_empty());
        assert_eq!(warnings, vec!["gpu-sysfs-unavailable", "gpu-not-detected"]);
    }

    #[cfg(unix)]
    #[test]
    fn slow_native_process_is_terminated() {
        let result = run_native_with_limits(
            "sh",
            &["-c", "sleep 1"],
            std::time::Duration::from_millis(20),
            1024,
        );
        assert_eq!(result, Err("native-command-timeout".into()));
    }
}
