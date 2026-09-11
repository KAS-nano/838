import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const routes = ["home", "onboarding", "dashboard", "modelos", "comparar"] as const;

function route(project: string, page: (typeof routes)[number]) {
  if (project === "next") {
    return { home: "/", onboarding: "/onboarding", dashboard: "/dashboard", modelos: "/modelos", comparar: "/comparar" }[page];
  }
  return page === "home" || page === "onboarding" ? `/${page}.html` : `/index.html#${page}`;
}

function formatViolations(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
  return violations.map(violation => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.map(node => node.target.join(" ")),
  }));
}

async function expectNoSeriousViolations(page: Page, context: string) {
  const result = await new AxeBuilder({ page }).exclude(".llm-rain").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const blocking = result.violations.filter(violation => violation.impact === "serious" || violation.impact === "critical");
  expect(formatViolations(blocking), `${context}: violações axe sérias/críticas`).toEqual([]);
}

for (const pageName of routes) {
  test(`axe: ${pageName} sem violações sérias ou críticas`, async ({ page }, testInfo) => {
    await page.goto(route(testInfo.project.name, pageName));
    await expect(page.locator("h1:visible")).toHaveCount(1);
    await expectNoSeriousViolations(page, pageName);
  });
}

test("axe: menu móvel, filtros e apoio em seus estados abertos", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route(testInfo.project.name, "dashboard"));
  const menu = page.getByRole("banner").locator("button[aria-controls]");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  const support = page.locator("aside details").filter({ hasText: "Apoie o projeto" });
  await support.locator(":scope > summary").click();
  await expect(support.locator("img")).toBeVisible();
  await expectNoSeriousViolations(page, "menu móvel e apoio abertos");

  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await page.goto(route(testInfo.project.name, "comparar"));
  await page.getByLabel("Filtro de compatibilidade").selectOption({ index: 1 });
  await expectNoSeriousViolations(page, "comparador filtrado");
});

test("teclado alcança o conteúdo e mantém foco visível com zoom de 200%", async ({ page }, testInfo: TestInfo) => {
  await page.setViewportSize({ width: 640, height: 480 });
  await page.goto(route(testInfo.project.name, "home"));
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(testInfo.project.name === "next" ? "#main-content" : "main")).toBeFocused();
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1);
});

test("layout permanece utilizável a 320 px, equivalente a zoom de 400%", async ({ page }, testInfo: TestInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(route(testInfo.project.name, "home"));
  await expect(page.locator("h1")).toBeVisible();
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1);
  await expectNoSeriousViolations(page, "home a 320 px");
});
