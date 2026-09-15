import { expect, test } from '@playwright/test';

const storageKey = '838.saved-comparison.v1';
test('salva, recupera e apaga a comparação sem armazenar o hardware', async ({ page }, info) => {
  await page.goto(info.project.name === 'next' ? '/comparar' : '/index.html#comparar');
  const panel = page.getByRole('region', { name: 'Comparação salva', exact: true });
  const model = page.getByLabel('Modelo 1', { exact: true });
  const chosen = await model.inputValue();
  await page.locator('#compareContext').fill('32');
  await panel.getByRole('button', { name: 'Salvar comparação', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText('Comparação salva');
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey);
  expect(Object.keys(saved).sort()).toEqual(['contextK', 'selections', 'version']);
  expect(saved.contextK).toBe(32);
  await page.reload();
  await page.locator('#compareContext').fill('4');
  await model.selectOption({ index: 2 });
  await panel.getByRole('button', { name: 'Recuperar comparação', exact: true }).click();
  await expect(model).toHaveValue(chosen);
  await expect(page.locator('#compareContext')).toHaveValue('32');
  await expect(panel.getByRole('status')).toContainText('hardware atual');
  await panel.getByRole('button', { name: 'Apagar cópia salva', exact: true }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  await expect(model).toHaveValue(chosen);
  await panel.getByRole('button', { name: 'Recuperar comparação', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText('Nenhuma comparação');
});

test('conteúdo corrompido e armazenamento bloqueado não destroem a seleção', async ({ page }, info) => {
  await page.addInitScript(key => {
    localStorage.setItem(key, '{broken');
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  }, storageKey);
  await page.goto(info.project.name === 'next' ? '/comparar' : '/index.html#comparar');
  const panel = page.getByRole('region', { name: 'Comparação salva', exact: true });
  const chosen = await page.getByLabel('Modelo 1', { exact: true }).inputValue();
  await panel.getByRole('button', { name: 'Recuperar comparação', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText('Não foi possível ler');
  await panel.getByRole('button', { name: 'Salvar comparação', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText('não permitiu salvar');
  await expect(page.getByLabel('Modelo 1', { exact: true })).toHaveValue(chosen);
});

test('exporta e importa JSON sem sobrescrever a cópia salva', async ({ page }, info) => {
  await page.goto(info.project.name === 'next' ? '/comparar' : '/index.html#comparar');
  const panel = page.getByRole('region', { name: 'Comparação salva', exact: true });
  await page.locator('#compareContext').fill('32');
  const pendingDownload = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Exportar comparação', exact: true }).click();
  const download = await pendingDownload;
  expect(download.suggestedFilename()).toBe('838-comparacao.json');
  const destination = info.outputPath('comparison-export.json');
  await download.saveAs(destination);
  await page.locator('#compareContext').fill('4');
  await panel.getByRole('button', { name: 'Salvar comparação', exact: true }).click();
  await panel.getByLabel('Importar comparação (JSON)').setInputFiles(destination);
  await expect(panel.getByRole('status')).toContainText('Comparação importada');
  await expect(page.locator('#compareContext')).toHaveValue('32');
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey);
  expect(saved.contextK).toBe(4);
  expect(Object.keys(saved).sort()).toEqual(['contextK', 'selections', 'version']);
  await panel.getByLabel('Importar comparação (JSON)').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await expect(panel.getByRole('status')).toContainText('JSON válido');
  await expect(page.locator('#compareContext')).toHaveValue('32');
  await panel.getByLabel('Importar comparação (JSON)').setInputFiles({ name: 'large.json', mimeType: 'application/json', buffer: Buffer.alloc(20_001, ' ') });
  await expect(panel.getByRole('status')).toContainText('20 KB');
  await expect(page.locator('#compareContext')).toHaveValue('32');
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
