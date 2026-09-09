const scan = document.querySelector('#scan');
const output = document.querySelector('#out');
const status = document.querySelector('#status');

scan.addEventListener('click', async () => {
  scan.disabled = true;
  status.textContent = 'Lendo hardware local…';
  try {
    if (!window.__TAURI__?.core?.invoke) throw new Error('Abra esta tela pelo aplicativo 838 Hardware Agent para detectar o hardware.');
    const invoke = window.__TAURI__.core.invoke;
    const snapshot = await invoke('get_hardware_snapshot');
    output.textContent = JSON.stringify(snapshot, null, 2);
    status.textContent = 'Leitura concluída. Nenhum dado foi enviado.';
  } catch (error) {
    status.textContent = 'Não foi possível ler o hardware.';
    output.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    scan.disabled = false;
  }
});
