import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("presets alteram o ranking e explicam os campos do cenário", async ({ page }, info) => {
  await page.goto(info.project.name === "next" ? "/recomendacoes" : "/index.html#recomendacoes");
  const result = page.locator("#scenarioResultCount, .scenario-result-count");
  await expect(result).toContainText("chat curto");
  const before = await page.locator(".recommendation-card").first().textContent();
  await page.getByRole("button", { name: "Processamento em lote", exact: true }).click();
  await expect(result).toContainText("processamento em lote");
  await expect(page.locator(".scenario-explanations")).toContainText("8 execuções simultâneas");
  await expect(page.locator(".recommendation-card").filter({ hasText: "API" }).first()).toContainText("execuções simultâneas");
  expect(await page.locator(".recommendation-card").first().textContent()).not.toBe(before);
  await page.getByLabel("Contexto do cenário").fill("300");
  await page.getByLabel("Contexto do cenário").blur();
  await expect(page.getByLabel("Contexto do cenário")).toHaveValue("256");
  await page.getByLabel("Prioridade do cenário").selectOption("privacy");
  await expect(page.locator(".scenario-explanations")).toContainText("Prioridade em privacidade");
});

test("cenário continua legível em tela pequena e acessível", async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(info.project.name === "next" ? "/recomendacoes" : "/index.html#recomendacoes");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const audit = await new AxeBuilder({ page }).include(".scenario-panel").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(audit.violations.filter((item) => item.impact === "serious" || item.impact === "critical")).toEqual([]);
});

test("cenários personalizados persistem e o link omite dados locais", async ({ page, context }, info) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const route = info.project.name === "next" ? "/recomendacoes" : "/index.html#recomendacoes";
  await page.goto(route);
  await page.getByText("Meus cenários e compartilhamento", { exact: true }).click();
  await page.getByLabel("Contexto do cenário").fill("48");
  await page.getByLabel("Nome do cenário").fill("Pesquisa local");
  await page.getByRole("button", { name: "Salvar cenário atual" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Cenário salvo" })).toBeVisible();

  await page.reload();
  await page.getByText("Meus cenários e compartilhamento", { exact: true }).click();
  await page.getByLabel("Cenários salvos").selectOption("Pesquisa local");
  await page.getByRole("button", { name: "Abrir", exact: true }).click();
  await expect(page.getByLabel("Contexto do cenário")).toHaveValue("48");
  await page.getByRole("button", { name: "Copiar link técnico" }).click();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toContain("sv=1");
  expect(link).not.toContain("Pesquisa");
  expect(link).not.toContain("hardware");

  await page.goto(link);
  await expect(page.getByRole("status").filter({ hasText: "carregado do link" })).toBeVisible();
  await expect(page.getByLabel("Contexto do cenário")).toHaveValue("48");
});
