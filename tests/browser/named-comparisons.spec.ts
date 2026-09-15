import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('guarda duas comparações, recupera após reload e exclui somente a escolhida', async ({ page }, info) => {
  await page.goto(info.project.name === 'next' ? '/comparar' : '/index.html#comparar');
  const section = page.locator('details.compare-named');
  await section.locator('summary').click();
  await page.locator('#compareContext').fill('32');
  await section.getByLabel('Nome da comparação', { exact: true }).fill('Programação');
  await section.getByRole('button', { name: 'Guardar com nome' }).click();
  await expect(section.getByRole('status')).toContainText('salva');
  await page.locator('#compareContext').fill('4');
  await section.getByLabel('Nome da comparação', { exact: true }).fill('Chat curto');
  await section.getByRole('button', { name: 'Guardar com nome' }).click();
  await page.reload();
  await section.locator('summary').click();
  await section.getByLabel('Comparações guardadas').selectOption('Programação');
  await section.getByRole('button', { name: 'Abrir selecionada' }).click();
  await expect(page.locator('#compareContext')).toHaveValue('32');
  await section.getByLabel('Nome da comparação', { exact: true }).fill('PROGRAMAÇÃO');
  await section.getByRole('button', { name: 'Guardar com nome' }).click();
  await expect(section.getByRole('status')).toContainText('já existe');
  await section.getByRole('button', { name: 'Excluir selecionada' }).click();
  await expect(page.locator('#compareContext')).toHaveValue('32');
  await section.getByLabel('Comparações guardadas').selectOption('Chat curto');
  await section.getByRole('button', { name: 'Abrir selecionada' }).click();
  await expect(page.locator('#compareContext')).toHaveValue('4');
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const audit = await new AxeBuilder({ page }).include('.compare-named').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(audit.violations.filter(item => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
});


test('renomeia sem alterar o conteúdo e atualiza somente a selecionada', async ({ page }, info) => {
  await page.goto(info.project.name === 'next' ? '/comparar' : '/index.html#comparar');
  const section = page.locator('details.compare-named');
  await section.locator('summary').click();
  const name = section.getByLabel('Nome da comparação', { exact: true });
  await name.fill('Original');
  await page.locator('#compareContext').fill('16');
  await section.getByRole('button', { name: 'Guardar com nome' }).click();
  await page.locator('#compareContext').fill('4');
  await name.fill('Renomeada');
  await section.getByRole('button', { name: 'Renomear selecionada' }).click();
  await expect(section.getByRole('status')).toContainText('renomeada');
  await section.getByRole('button', { name: 'Abrir selecionada' }).click();
  await expect(page.locator('#compareContext')).toHaveValue('16');
  await page.locator('#compareContext').fill('64');
  await section.getByRole('button', { name: 'Substituir selecionada pela comparação aberta' }).click();
  await expect(section.getByRole('status')).toContainText('atualizada');
  await page.reload();
  await section.locator('summary').click();
  await section.getByLabel('Comparações guardadas').selectOption('Renomeada');
  await section.getByRole('button', { name: 'Abrir selecionada' }).click();
  await expect(page.locator('#compareContext')).toHaveValue('64');
  await expect(section.getByLabel('Comparações guardadas').locator('option')).toHaveCount(2);
});
