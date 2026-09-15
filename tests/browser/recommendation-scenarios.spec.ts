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
