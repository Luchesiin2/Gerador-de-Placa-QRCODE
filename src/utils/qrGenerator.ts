import QRCode from 'qrcode';

export interface QRData {
  matrix: number[][]; // 2D array of 1 (black modules) and 0 (white space)
  size: number;       // Dimension of the QR Code (e.g. 21, 25, 29)
}

/**
 * Generates a standard binary matrix representation of a QR Code.
 * @param text The URL or text to encode
 * @param errLevel Error correction level ('L', 'M', 'Q', 'H')
 */
export function generateQRMatrix(text: string, errLevel: 'L' | 'M' | 'Q' | 'H' = 'M'): QRData {
  try {
    const cleanText = text.trim() || "https://makerworld.com";
    const qr = QRCode.create(cleanText, { errorCorrectionLevel: errLevel });
    const size = qr.modules.size;
    const matrix: number[][] = [];

    for (let r = 0; r < size; r++) {
      const row: number[] = [];
      for (let c = 0; c < size; c++) {
        // qrcode modules.get(row, col) returns true if it is a black square (1)
        row.push(qr.modules.get(c, r) ? 1 : 0);
      }
      matrix.push(row);
    }

    return { matrix, size };
  } catch (error) {
    console.error("Error generating QR Code matrix:", error);
    // Return a fallback dummy design (8x8 checkboard pattern)
    const dummySize = 21;
    const dummyMatrix = Array.from({ length: dummySize }, (_, r) =>
      Array.from({ length: dummySize }, (_, c) => ((r + c) % 2 === 0 ? 1 : 0))
    );
    return { matrix: dummyMatrix, size: dummySize };
  }
}
