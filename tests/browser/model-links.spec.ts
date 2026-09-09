import { expect, test } from "@playwright/test";
import { seedModels } from "../../src/data/seed-models";
import { modelExternalLinks } from "../../src/data/model-links";

test("every catalog card identifies the official source and exact artifact precision", async ({ page }, info) => {
  await page.goto(info.project.name === "next" ? "/modelos" : "/index.html#modelos");
  await expect(page.locator(".model-catalog-card")).toHaveCount(seedModels.length);
  for (const model of seedModels) {
    const links = modelExternalLinks[model.id];
    expect(links, `Source metadata for ${model.id}`).toBeDefined();
    const card = page.locator(".model-catalog-card").filter({ has: page.getByRole("heading", { name: model.name, exact: true }) });
    await expect(card.locator(".model-official-link")).toHaveAttribute("href", links.official.url);
    await expect(card.locator(".model-artifact-link")).toHaveCount(links.variants.length);
    for (const variant of links.variants) {
      const link = card.locator(".model-artifact-link").filter({ has: page.locator("strong", { hasText: new RegExp(`^${variant.quantization}$`) }) });
      await expect(link).toHaveAttribute("href", variant.url);
      await expect(link).toContainText(variant.publisher);
      await expect(link).toContainText(variant.community ? "Comunidade" : "Oficial");
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
    await expect(card).toContainText(/estimad/);
  }
});

test("catalog precision filter highlights its destination and search has an empty state", async ({ page }, info) => {
  await page.goto(info.project.name === "next" ? "/modelos" : "/index.html#modelos");
  await page.getByLabel("Buscar modelo", { exact: true }).fill("Qwen3 8B");
  await page.getByLabel("Quantização dos links", { exact: true }).selectOption("Q4_K_M");
  await expect(page.locator(".model-catalog-card")).toHaveCount(1);
  await expect(page.locator(".model-artifact-link.is-selected strong")).toHaveText("Q4_K_M");
  await expect(page.locator(".model-artifact-link.is-selected")).toHaveAttribute("href", /Q4_K_M/i);
  await page.getByLabel("Buscar modelo", { exact: true }).fill("modelo inexistente 838");
  await expect(page.locator(".model-catalog-card")).toHaveCount(0);
  await expect(page.locator("main")).toContainText("Nenhum modelo encontrado");
});
