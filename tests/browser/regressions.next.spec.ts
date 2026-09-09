import { expect, test } from "@playwright/test";
import { demoHardwareProfile } from "../../src/features/profile/local-store";

test("catalog link selects requested model and model change clamps context", async ({ page }) => {
  await page.goto("/modelos");
  const modelCard = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Gemma 3 27B", exact: true }) });
  await modelCard.getByRole("link", { name: /Analisar/ }).click();
  await expect(page.getByLabel("Modelo", { exact: true })).toHaveValue("gemma3-27b");
  await page.getByRole("slider", { name: "Contexto", exact: true }).fill("128");
  await page.getByLabel("Modelo", { exact: true }).selectOption("phi4-14b");
  await expect(page.getByRole("slider", { name: "Contexto", exact: true })).toHaveValue("16");
  await expect(page.locator("main")).toContainText("16K contexto");
  await expect(page.locator("main")).not.toContainText("128K");
});

test("recommendation API rejects malformed hardware and identifies seed results", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ status: "ok", service: "838" });
  const catalog = await request.get("/api/catalog/models");
  expect(catalog.status()).toBe(200);
  const data = await catalog.json();
  expect(data.source).toBe("seed");
  expect(data.schemaVersion).toBe(1);
  expect(data.dataState).toBe("seed");
  expect(data.models).toHaveLength(17);
  expect(Date.parse(data.observedAt)).not.toBeNaN();
  for (const data of ["null", "{broken", JSON.stringify({ ...demoHardwareProfile, ramGb: "32" }), JSON.stringify({ ...demoHardwareProfile, contextK: -10 })]) {
    const response = await request.post("/api/recommend", { data, headers: { "Content-Type": "application/json" } });
    expect(response.status()).toBe(400);
  }
  const recommendation = await request.post("/api/recommend", { data: { ...demoHardwareProfile, storageFreeGb: 0, contextK: 32 } });
  expect(recommendation.status()).toBe(200);
  const body = await recommendation.json();
  expect(body.dataState).toBe("seed");
  expect(body.result.length).toBeGreaterThan(0);
  for (const item of body.result) {
    expect(item.fit).toBe("incompatible");
    expect(item.confidence).toBe("low");
    expect(item.reasons.join(" ")).toContain("disco insuficiente");
  }
});
