import { expect, test } from "@playwright/test";
import jsQR from "jsqr";
import { supportPayment } from "../../src/data/support-payment";

const pageUrl = (project: string) => project === "next" ? "/modelos" : "/index.html#modelos";

test("Pix stays optional, QR decodes and both copy actions work", async ({ page, context }, info) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto(pageUrl(info.project.name));
  const support = page.locator("aside details").filter({ hasText: "Apoie o projeto" });
  await expect(support).not.toHaveAttribute("open");
  await expect(support.locator("img")).not.toBeVisible();
  await support.locator(":scope > summary").click();
  await expect(support).toContainText("Kawan Alves da Silva");
  await expect(support.getByLabel("Chave Pix", { exact: true })).toHaveValue("8a8fbfbe-0cb5-4c9d-9648-058c58f95617");
  const qr = support.locator("img");
  await expect(qr).toBeVisible();
  await expect.poll(() => qr.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const pixels = await qr.evaluate((img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, 512, 512);
    return [...ctx.getImageData(0, 0, 512, 512).data];
  });
  const decoded = jsQR(new Uint8ClampedArray(pixels), 512, 512);
  expect(decoded?.data).toBe(supportPayment.payload);
  await support.getByRole("button", { name: "Copiar chave Pix", exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("8a8fbfbe-0cb5-4c9d-9648-058c58f95617");
  await support.getByRole("button", { name: "Copiar Pix Copia e Cola", exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(supportPayment.payload);
});

test("mobile support keeps keyboard focus inside the menu and closes with Escape", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl(info.project.name));
  const menu = page.getByRole("banner").locator("button[aria-controls]");
  await menu.click();
  const support = page.locator("aside details").filter({ hasText: "Apoie o projeto" });
  await support.locator(":scope > summary").click();
  await expect(support.locator("img")).toBeVisible();
  await support.getByRole("button", { name: "Copiar Pix Copia e Cola", exact: true }).focus();
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest("aside, header button[aria-controls]")))).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
});

test("denied clipboard leaves Pix available for manual copying", async ({ page }, info) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async () => { throw new DOMException("Denied", "NotAllowedError"); } },
  }));
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto(pageUrl(info.project.name));
  const support = page.locator("aside details").filter({ hasText: "Apoie o projeto" });
  await support.locator(":scope > summary").click();
  await support.getByRole("button", { name: "Copiar Pix Copia e Cola", exact: true }).click();
  await expect(support.getByLabel("Pix Copia e Cola", { exact: true })).toBeVisible();
  await expect(support.getByLabel("Pix Copia e Cola", { exact: true })).toHaveValue(supportPayment.payload);
  await expect(support.getByRole("status")).toContainText(/(?:manual|selecionad)/i);
});
