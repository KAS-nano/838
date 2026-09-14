import { expect, test } from '@playwright/test';

const key = '838.model-favorites.v1';

test('favoritos persistem, sincronizam entre abas e combinam com filtros', async ({ page, context }, info) => {
  const route = info.project.name === 'next' ? '/modelos' : '/index.html#modelos';
  await page.goto(route);
  const first = page.getByRole('button', { name: /^Favoritar / }).first();
  const label = await first.getAttribute('aria-label');
  const second = await context.newPage();
  await second.goto(route);
  await first.click();
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(second.getByRole('button', { name: label!, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: label!, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Somente favoritos (1)', exact: true }).click();
  await expect(page.locator('.model-catalog-card')).toHaveCount(1);
  await page.getByLabel('Buscar modelo').fill('modelo-inexistente-xyz');
  await expect(page.locator('.model-catalog-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await expect(page.locator('.model-catalog-card')).not.toHaveCount(0);
  await page.getByLabel('Ordenar modelos').selectOption('name');
  const names = await page.locator('.model-catalog-card h2').allTextContents();
  expect(names).toEqual([...names].sort((a,b) => a.localeCompare(b, 'pt-BR')));
  await page.getByRole('button', { name: label!, exact: true }).click();
  await expect(second.getByRole('button', { name: label!, exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('armazenamento bloqueado preserva favoritos na sessão e avisa', async ({ page }, info) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto(info.project.name === 'next' ? '/modelos' : '/index.html#modelos');
  const first = page.getByRole('button', { name: /^Favoritar / }).first();
  await first.click();
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('alert').filter({ hasText: 'apenas nesta sessão' })).toBeVisible();
});

test('dados corrompidos não quebram o catálogo', async ({ page }, info) => {
  await page.addInitScript(key => localStorage.setItem(key, '{broken'), key);
  await page.goto(info.project.name === 'next' ? '/modelos' : '/index.html#modelos');
  await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível ler' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Favoritar / }).first()).toBeVisible();
});
