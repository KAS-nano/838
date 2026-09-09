export interface PixRecipient {
  key: string;
  recipientName: string;
  city: string;
}

/** CRC16-CCITT-FALSE, as specified in the Banco Central BR Code example. */
export function pixCrc16(value: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(value)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = ((crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function field(id: string, value: string): string {
  const length = new TextEncoder().encode(value).length;
  if (length > 99) throw new Error(`O campo Pix ${id} excede 99 bytes.`);
  return `${id}${String(length).padStart(2, "0")}${value}`;
}

function merchantText(value: string, maxLength: number, label: string): string {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > maxLength || !/^[\x20-\x7e]+$/.test(normalized)) {
    throw new Error(`${label} deve ter entre 1 e ${maxLength} caracteres ASCII.`);
  }
  return normalized;
}

/**
 * Static, reusable Pix BR Code with no fixed amount and no transaction ID.
 * Reference: Banco Central, Manual de Padrões para Iniciação do Pix, §2.6.3.
 * https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf
 */
export function createPixPayload(recipient: PixRecipient): string {
  const key = recipient.key.trim();
  if (!/^[\x21-\x7e]{1,77}$/.test(key)) throw new Error("A chave Pix deve ter entre 1 e 77 caracteres ASCII, sem espaços.");
  const account = field("00", "br.gov.bcb.pix") + field("01", key);
  const payload = field("00", "01")
    + field("26", account)
    + field("52", "0000")
    + field("53", "986")
    + field("58", "BR")
    + field("59", merchantText(recipient.recipientName, 25, "Nome do recebedor"))
    + field("60", merchantText(recipient.city, 15, "Cidade"))
    + field("62", field("05", "***"))
    + "6304";
  return payload + pixCrc16(payload);
}
