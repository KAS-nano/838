import { expect, test } from "@playwright/test";

function route(project: string) { return project === "next" ? "/comparar" : "/index.html#comparar"; }

test("comparison filters preserve selections and support two quantizations of one model", async ({ page }, testInfo) => {
  await page.goto(route(testInfo.project.name));
  await expect(page.locator("#compareCards .compare-card")).toHaveCount(3);
  const model1 = page.getByLabel("Modelo 1", { exact: true });
  await page.locator("#compareSearch").fill("Qwen3 14B");
  await expect(page.locator("#compareCatalogCount")).toContainText("1 modelos");
  await expect(model1).toHaveValue("qwen3-8b");
  await expect(model1.locator("option")).toHaveCount(2);
  await page.locator("#compareFamily").selectOption({ label: "Gemma 3" });
  await expect(page.locator("#compareCatalogCount")).toContainText("0 modelos");
  await expect(page.locator("#compareCards .compare-card")).toHaveCount(3);
  await expect(model1.locator("option")).toHaveCount(1);
  await page.getByRole("button", { name: "Limpar filtros e ordenação" }).click();
  await expect(model1.locator("option")).toHaveCount(17);
  await page.getByLabel("Modelo 2", { exact: true }).selectOption("qwen3-8b");
  await page.getByLabel("Quantização 2", { exact: true }).selectOption("Q8_0");
  const versions = page.locator('#compareCards [data-model="qwen3-8b"]');
  await expect(versions).toHaveCount(2);
  await expect(versions.nth(0)).toContainText("Q4_K_M");
  await expect(versions.nth(1)).toContainText("Q8_0");
  await expect(page.locator("#compareTable")).toContainText("Seed demonstrativo");
  await expect(page.locator("#compareTable")).toContainText("VRAM alocada no seu perfil");
});

test("comparison context limits, ascending memory sort and chart proportions stay consistent", async ({ page }, testInfo) => {
  await page.goto(route(testInfo.project.name));
  await expect(page.locator("#compareCards .compare-card")).toHaveCount(3);
  await page.getByLabel("Modelo 1", { exact: true }).selectOption("phi4-14b");
  await page.locator("#compareContext").fill("256");
  await expect(page.locator('#compareCards [data-model="phi4-14b"]')).toContainText("16K (limite do modelo)");
  await page.locator("#compareMetric").selectOption("vram");
  await page.locator("#compareSort").selectOption("vram");
  await expect(page.locator("#compareChartTitle")).toHaveText("VRAM para carga total");
  await expect.poll(async () => {
    const values = await page.locator("#compareChart .compare-chart-row").evaluateAll(elements => elements.map(element => Number((element as HTMLElement).dataset.value)));
    return values.every((value, index) => index === 0 || value >= values[index - 1]);
  }).toBe(true);
  const bars = await page.locator("#compareChart .compare-chart-row").evaluateAll(elements => elements.map(element => ({
    value: Number((element as HTMLElement).dataset.value),
    width: Number.parseFloat(element.querySelector("i")!.style.width),
  })));
  const maximum = Math.max(...bars.map(bar => bar.value));
  for (const bar of bars) expect(bar.width).toBeCloseTo(bar.value / maximum * 100, 3);
  expect(bars.at(-1)!.width).toBe(100);
  await page.locator("#compareMetric").selectOption("speed");
  await expect(page.locator("#compareChartCaption")).toContainText("centro da faixa");
  await expect(page.locator("#compareChart")).toContainText("t/s");
  await page.locator("#compareContext").fill("0");
  await expect(page.locator("#compareResultCount")).toContainText("contexto solicitado 1K");
  await page.locator("#compareContext").fill("");
  await expect(page.locator("#compareResultCount")).toContainText("contexto solicitado 8K");
  await page.locator("#compareContext").fill("8");
  await page.locator("#compareFit").selectOption("incompatible");
  await expect(page.locator("#compareEmpty")).toBeVisible();
  await expect(page.locator("#compareResults")).toBeHidden();
  await page.getByRole("button", { name: "Mostrar todos os encaixes" }).click();
  await expect(page.locator("#compareCards .compare-card")).toHaveCount(3);
});

test("comparison remains readable on phone and desktop with table scrolling contained", async ({ page }, testInfo) => {
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route(testInfo.project.name));
    await expect(page.locator("#compareCards .compare-card")).toHaveCount(3);
    await expect(page.getByLabel("Modelo 1", { exact: true })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      tableWidth: document.querySelector(".compare-table-wrap")!.clientWidth,
      tableScroll: document.querySelector(".compare-table-wrap")!.scrollWidth,
      cards: [...document.querySelectorAll("#compareCards .compare-card")].map(element => ({ x: element.getBoundingClientRect().x, y: element.getBoundingClientRect().y })),
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1);
    if (width === 390) {
      expect(dimensions.tableScroll).toBeGreaterThan(dimensions.tableWidth);
      expect(dimensions.cards[1].y).toBeGreaterThan(dimensions.cards[0].y);
      expect(dimensions.cards[1].x).toBe(dimensions.cards[0].x);
    } else {
      expect(dimensions.cards[1].y).toBe(dimensions.cards[0].y);
      expect(dimensions.cards[1].x).toBeGreaterThan(dimensions.cards[0].x);
    }
  }
});
