import { expect, test } from '@playwright/test';

test('home orienta a escolha e abre as dúvidas por teclado', async ({ page }, info) => {
  await page.goto(info.project.name === 'next' ? '/' : '/home.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Em que ponto você está?' })).toBeVisible();
  await expect(page.getByText('Exemplo seed', { exact: true })).toBeVisible();
  const question = page.locator('summary').filter({ hasText: 'Preciso instalar algo' });
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Para explorar o catálogo e analisar seu perfil', { exact: false })).toBeVisible();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
    await page.screenshot({ path: info.outputPath(`home-${width}.png`), fullPage: true });
  }
  await page.getByRole('link', { name: /Já tenho um modelo em mente/ }).click();
  await expect(page).toHaveURL(info.project.name === 'next' ? /\/modelos$/ : /#modelos$/);
  await expect(page.getByRole('heading', { name: info.project.name === 'next' ? 'Modelos locais' : 'Modelos de IA', exact: true })).toBeVisible();
});

test('home encaminha ao comparador e à configuração pessoal', async ({ page }, info) => {
  const home = info.project.name === 'next' ? '/' : '/home.html';
  await page.goto(home);
  await page.getByRole('link', { name: /Quero escolher entre opções/ }).click();
  await expect(page).toHaveURL(info.project.name === 'next' ? /\/comparar$/ : /#comparar$/);
  await page.goto(home);
  await page.getByRole('link', { name: /O que roda no meu PC/ }).click();
  await expect(page).toHaveURL(/onboarding/);
});
