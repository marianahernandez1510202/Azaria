/**
 * PDF Text Extractor using pdf.js (lazy-loaded)
 * Extracts text from PDF files with layout preservation in the browser
 * before sending to the backend for parsing.
 */

/**
 * Extract text from a PDF file with layout preservation
 * For two-column layouts (ingredients | preparation), separates columns with "|||"
 * @param {File} file - The PDF file to extract text from
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<string>} The extracted text with layout preserved
 */
export async function extractTextFromPDF(file, onProgress) {
  // Lazy-load pdf.js only when needed (avoids ~94 kB in main bundle)
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  let fullText = '';

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (onProgress) {
      onProgress(Math.round((pageNum / totalPages) * 100));
    }

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Filter empty items
    const items = textContent.items.filter(item => item.str.trim().length > 0);
    if (items.length === 0) continue;

    // Group items into lines based on Y position (with tolerance)
    const lines = [];
    let currentLine = [];
    let lastY = null;
    const yTolerance = 3; // pixels tolerance for same line

    // Sort by Y (descending = top first), then X (ascending = left first)
    items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) < yTolerance) {
        return a.transform[4] - b.transform[4];
      }
      return yDiff;
    });

    for (const item of items) {
      const y = item.transform[5];

      if (lastY !== null && Math.abs(y - lastY) > yTolerance) {
        if (currentLine.length > 0) {
          lines.push([...currentLine]);
        }
        currentLine = [];
      }

      currentLine.push({
        text: item.str,
        x: item.transform[4],
        width: item.width || 0
      });
      lastY = y;
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Build text from lines, using ||| as column separator for large gaps
    let pageText = '';
    for (const line of lines) {
      line.sort((a, b) => a.x - b.x);

      let lineText = '';
      let lastEndX = 0;

      for (const item of line) {
        const gap = item.x - lastEndX;

        if (lastEndX > 0 && gap > 50) {
          // Very large gap = different columns (ingredients vs preparation)
          lineText += ' ||| ';
        } else if (lastEndX > 0 && gap > 15) {
          // Medium gap = likely different data fields in same row
          lineText += '    ';
        } else if (lastEndX > 0 && gap > 3) {
          lineText += ' ';
        }

        lineText += item.text;
        lastEndX = item.x + item.width;
      }

      pageText += lineText.trim() + '\n';
    }

    // Add page separator
    fullText += pageText + '\n---PAGE_BREAK---\n';
  }

  return fullText.trim();
}
