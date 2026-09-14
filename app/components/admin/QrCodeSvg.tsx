import qrcode from "qrcode-generator";

// Pure-JS, dependency-free QR rendering — no canvas/native bindings, safe to
// run in the Workers runtime (see CLAUDE.md, Tech Stack → QR codes).
export function QrCodeSvg({ value, cellSize = 4 }: { value: string; cellSize?: number }) {
  const qr = qrcode(0, "M");
  qr.addData(value);
  qr.make();
  const svg = qr.createSvgTag({ cellSize, scalable: true });

  return <div className="admin-qr-svg" dangerouslySetInnerHTML={{ __html: svg }} />;
}
