import assert from "node:assert/strict";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { loadSupportModule, generateSupportPayment } from "./generate-support-qr.mjs";

const [{ createPixPayload, pixCrc16 }, { projectSupport }, { supportPayment }] = await Promise.all([
  loadSupportModule("src/features/support/pix.ts"),
  loadSupportModule("src/data/project-support.ts"),
  loadSupportModule("src/data/support-payment.ts"),
]);

// Independent published BR Code example, Banco Central manual §2.6.3.
const fixture = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D";
assert.equal(createPixPayload({ key: "123e4567-e12b-12d1-a456-426655440000", recipientName: "Fulano de Tal", city: "BRASILIA" }), fixture);
assert.equal(pixCrc16("123456789"), "29B1", "CRC16-CCITT-FALSE published check value");

function parseFields(value) {
  const fields = new Map();
  let offset = 0;
  while (offset < value.length) {
    const id = value.slice(offset, offset + 2);
    const rawLength = value.slice(offset + 2, offset + 4);
    assert.match(id, /^\d{2}$/);
    assert.match(rawLength, /^\d{2}$/);
    const length = Number(rawLength);
    assert.ok(offset + 4 + length <= value.length, `Field ${id} boundary`);
    assert.ok(!fields.has(id), `Field ${id} is unique`);
    fields.set(id, value.slice(offset + 4, offset + 4 + length));
    offset += 4 + length;
  }
  assert.equal(offset, value.length);
  return fields;
}

await generateSupportPayment({ check: true });
assert.equal(supportPayment.payload, createPixPayload(projectSupport.pix));
const fields = parseFields(supportPayment.payload);
assert.equal(fields.get("00"), "01");
assert.equal(fields.get("53"), "986");
assert.equal(fields.get("58"), "BR");
assert.equal(fields.get("59"), "Kawan Alves da Silva");
assert.equal(fields.get("60"), "SAO PAULO");
assert.equal(fields.has("54"), false, "No fixed donation amount");
assert.equal(fields.has("01"), false, "Reusable static QR");
assert.equal(parseFields(fields.get("26")).get("00"), "br.gov.bcb.pix");
assert.equal(parseFields(fields.get("26")).get("01"), "8a8fbfbe-0cb5-4c9d-9648-058c58f95617");
assert.equal(parseFields(fields.get("62")).get("05"), "***");
assert.equal(fields.get("63"), pixCrc16(supportPayment.payload.slice(0, -4)));
assert.throws(() => createPixPayload({ ...projectSupport.pix, key: "wrong key" }));
assert.throws(() => createPixPayload({ ...projectSupport.pix, recipientName: "A".repeat(26) }));
assert.throws(() => createPixPayload({ ...projectSupport.pix, city: "" }));
assert.equal(parseFields(createPixPayload({ ...projectSupport.pix, city: "São Paulo" })).get("60"), "Sao Paulo");

// Decode the generated image with a separate QR implementation, not the encoder.
assert.match(supportPayment.qrDataUrl, /^data:image\/png;base64,/);
const png = PNG.sync.read(Buffer.from(supportPayment.qrDataUrl.split(",")[1], "base64"));
assert.equal(png.width, png.height);
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
assert.ok(decoded, "QR image can be scanned");
assert.equal(decoded.data, supportPayment.payload, "QR and Pix Copia e Cola encode the same payment");
for (let x = 0; x < png.width; x++) assert.deepEqual([...png.data.subarray(x * 4, x * 4 + 4)], [255, 255, 255, 255], "White quiet zone is intact");
console.log("PASS Pix: official CRC/BR Code fixture, configured recipient, free amount, TLV boundaries, invalid input, generated-file freshness and independent QR decode.");
