import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { name: "full-hd", width: 1920, height: 1080 },
  { name: "qhd", width: 2560, height: 1440 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "phone", width: 390, height: 844 },
];
const sections = ["dashboard", "modelos", "recomendacoes", "comparar", "ferramentas", "forca", "upgrades", "sistemas", "instalar", "benchmark", "comunidade", "perfil"];

function route(project: string, section: string) {
  if (project === "next") {
    const routes: Record<string, string> = { home: "/", forca: "/hardware/forca", upgrades: "/hardware/upgrades", comunidade: "/benchmarks/comunidade" };
    return routes[section] ?? `/${section}`;
  }
  return section === "home" || section === "onboarding" ? `/${section}.html` : `/index.html#${section}`;
}

async function expectShell(page: Page) {
  await expect(page.getByRole("banner")).toHaveCount(1);
  const logo = page.getByRole("banner").getByRole("link").filter({ hasText: /^838$/ });
  await expect(logo).toHaveCount(1);
  await expect(logo).toBeVisible();
  const box = await logo.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box!.x + box!.width / 2 - page.viewportSize()!.width / 2)).toBeLessThan(3);
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll, "document must not overflow horizontally").toBeLessThanOrEqual(dimensions.width + 1);
}

async function selectChoice(page: Page, label: string) {
  const control = page.getByLabel(label, { exact: true });
  if (await control.count()) await control.check();
  else {
    const button = page.getByRole("button", { name: label, exact: true });
    if (await button.getAttribute("aria-pressed") !== "true") await button.click();
  }
}

for (const viewport of viewports) {
  test(`responsive navigation ${viewport.name} ${viewport.width}×${viewport.height}`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const section of ["home", "onboarding", ...sections]) {
      const response = await page.goto(route(testInfo.project.name, section));
      if (response) expect(response.status()).toBe(200);
      else expect((await page.request.get(page.url().split("#")[0])).status()).toBe(200);
      await expectShell(page);
      await expect(page.locator("h1:visible")).toHaveCount(1);
      if (["home", "dashboard", "onboarding"].includes(section)) {
        await page.screenshot({ path: testInfo.outputPath(`${section}-${viewport.name}.png`), fullPage: true });
      }
    }
    expect(errors).toEqual([]);
  });
}

test("home → onboarding → saved profile → dashboard → edit hardware", async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  await page.goto(route(project, "home"));
  await page.getByRole("link", { name: /Analisar meu sistema/i }).first().click();
  await expect(page).toHaveURL(/onboarding/);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByText(/informe.*(?:processador|CPU)/i).first()).toBeVisible();
  await page.getByLabel(/^(?:Processador|CPU)$/).fill("Ryzen 7 5700X");
  await page.getByLabel("GPU", { exact: true }).fill("Radeon RX 9070 XT");
  await page.getByLabel("VRAM (GB)", { exact: true }).fill("16");
  await page.getByLabel("RAM (GB)", { exact: true }).fill("32");
  await page.getByLabel("Armazenamento total (GB)", { exact: true }).fill("1000");
  await page.getByLabel("Espaço livre (GB)", { exact: true }).fill("300");
  await page.getByLabel("Sistema operacional", { exact: true }).selectOption("linux");
  await page.getByLabel("Distribuição Linux", { exact: true }).fill("CachyOS");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await selectChoice(page, "Programação");
  await selectChoice(page, "Privacidade");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByText("Ryzen 7 5700X", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Salvar perfil/ }).click();
  await expect(page).toHaveURL(/(?:\/dashboard|index\.html#dashboard)/);
  await expect(page.locator("main")).toContainText("Radeon RX 9070 XT");
  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("838.hardwareProfile")!));
  expect(profile).toMatchObject({ cpu: "Ryzen 7 5700X", vramGb: 16, ramGb: 32, os: "linux", distro: "CachyOS", priority: "privacy" });
  expect(profile.objectives).toContain("Programação");
  await page.reload();
  await expect(page.locator("main")).toContainText("Radeon RX 9070 XT");
  await page.getByRole("link", { name: /Editar hardware/ }).click();
  await expect(page.getByLabel(/^(?:Processador|CPU)$/)).toHaveValue("Ryzen 7 5700X");
  await page.getByLabel("RAM (GB)", { exact: true }).fill("64");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: /Salvar perfil/ }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("838.hardwareProfile")!).ramGb)).toBe(64);
  await expect(page.locator("main")).toContainText("64 GB");
});

test("model, quantization and context update the analysis", async ({ page }, testInfo) => {
  await page.goto(route(testInfo.project.name, "dashboard"));
  const model = page.getByLabel("Modelo", { exact: true });
  await expect(model).toBeVisible();
  await expect.poll(() => model.locator("option").count()).toBeGreaterThanOrEqual(17);
  await model.selectOption({ label: "Qwen3 14B" });
  const quant = page.getByLabel("Quantização", { exact: true });
  await quant.selectOption("Q4_K_M");
  const before = await page.locator("main").innerText();
  await quant.selectOption("Q8_0");
  await expect(quant).toHaveValue("Q8_0");
  await expect.poll(() => page.locator("main").innerText()).not.toBe(before);
  const range = page.getByRole("slider", { name: /Contexto/ });
  await range.fill("32");
  await expect(range).toHaveValue("32");
  await expect(page.locator("main")).toContainText("32K");
  await expect(page.locator("main")).toContainText(/\d+(?:\.\d+)?[–-]\d+(?:\.\d+)?\s*t\/s/);
  await expect(page.locator("main")).toContainText(/(?:Confiança|confiança)/);
  await expect(page.locator("main")).toContainText(/seed/i);
});

test("malformed saved profile recovers without runtime errors", async ({ page }, testInfo) => {
  await page.goto(route(testInfo.project.name, "dashboard"));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const value of ["{broken", "null", JSON.stringify({ ramGb: -30, objectives: "invalid" })]) {
    await page.evaluate(value => localStorage.setItem("838.hardwareProfile", value), value);
    await page.reload();
    await expect(page.getByLabel("Modelo", { exact: true })).toBeVisible();
    await expect(page.locator("main")).not.toContainText("NaN");
  }
  if (testInfo.project.name === "preview") {
    await page.evaluate(() => {
      localStorage.removeItem("838.hardwareProfile");
      localStorage.setItem("838.preview.profile", JSON.stringify({ cpu: "Ryzen legado", gpu: "Radeon RX legado", vramGb: 8, ramGb: 32, storageFreeGb: 120, os: "linux", distro: "CachyOS", objective: "Programação" }));
    });
    await page.reload();
    await expect(page.locator("main")).toContainText("Ryzen legado");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("838.hardwareProfile")!).objectives)).toEqual(["Programação"]);
  }
  expect(errors).toEqual([]);
});

test("rain names are independent, noninteractive and respect reduced motion", async ({ page }, testInfo) => {
  await page.goto(route(testInfo.project.name, "dashboard"));
  const rain = page.locator(".llm-rain");
  await expect(rain).toHaveAttribute("aria-hidden", "true");
  await expect(rain).toHaveCSS("pointer-events", "none");
  expect(await rain.locator("span").count()).toBeGreaterThanOrEqual(24);
  const names = await rain.locator("span").allTextContents();
  for (const name of ["Qwen3 1.7B", "Gemma 3 12B", "Mistral Small", "LM Studio", "OpenRouter"]) expect(names).toContain(name);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const animations = await rain.locator("span").evaluateAll(elements => elements.map(element => getComputedStyle(element).animationName));
  expect(animations.every(animation => animation === "none")).toBe(true);
});

test("mobile menu navigates to comparison and updates a compared model", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route(testInfo.project.name, "dashboard"));
  const menu = page.getByRole("banner").locator("button[aria-controls]");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Comparar", exact: true }).click();
  await expect(page).toHaveURL(/comparar/);
  await expect(page.getByRole("banner").getByRole("button", { name: /Abrir menu/ })).toHaveAttribute("aria-expanded", "false");
  await page.getByLabel("Modelo 1", { exact: true }).selectOption("nemotron-15b");
  await expect(page.getByRole("table")).toContainText("Nemotron");
  await expectShell(page);
});
