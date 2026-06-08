import { Slide, BrandSettings, SuggestedPalette } from "../types";

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

/**
 * Utility helper to draw a slide onto a high-resolution HTML Canvas
 * This is perfect for crisp PNG/JPG exports at 1080x1080 (Feed) or 1080x1920 (Stories)
 */
export async function drawSlideToCanvas(
  slide: Slide,
  index: number,
  totalSlides: number,
  palette: SuggestedPalette,
  brand: BrandSettings
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to obtain 2D rendering context");
  }

  // Set Resolution based on Aspect Ratio
  const isStories = brand.aspectRatio === "9:16";
  const isLandscape = brand.aspectRatio === "16:9";
  
  const width = 1080;
  const height = isStories ? 1920 : (isLandscape ? 608 : 1080); // 1080x1080 or 1080x1920 or 1080x608

  canvas.width = width;
  canvas.height = height;

  // Use Custom Slide Overrides or Global Palette
  const bg = slide.customBackground || palette.background;
  const textCol = slide.customTextColor || palette.text;
  const primaryCol = slide.customPrimaryColor || palette.primary;

  // 1. Draw Background Style
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Draw background slide image
  if (slide.imageUrl && slide.imageLayout === "background") {
    try {
      const img = await loadImage(slide.imageUrl);
      ctx.save();
      ctx.globalAlpha = 0.28;
      const scale = Math.max(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.restore();
    } catch (e) {
      console.error("Erro ao desenhar fundo de imagem:", e);
    }
  }

  // Apply subtle modern background grids, gradient or abstract design blobs based on slide type
  if (slide.type === "cover" || index === 0) {
    // Elegant glow/gradient-eclipse for titles
    const grad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width * 0.7);
    grad.addColorStop(0, primaryCol + "22"); // Subtle transparency
    grad.addColorStop(1, bg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative grid pattern for cover
    ctx.strokeStyle = textCol + "08"; // super light opacity
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (slide.type === "quote") {
    // Draw thick elegant quote-marks
    ctx.fillStyle = primaryCol + "18"; // translucent quote bubble
    ctx.fillRect(100, height * 0.3, width - 200, height * 0.4);
  } else if (slide.type === "cta" || index === totalSlides - 1) {
    // Focus circles
    ctx.strokeStyle = primaryCol + "15";
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.arc(width, height, 400, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width, height, 550, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 2. Headings & Bodies Font pairings mapping
  const headingFont = palette.fontHeading === "Playfair Display" ? "serif" : "sans-serif";
  const bodyFont = palette.fontBody === "JetBrains Mono" ? "monospace" : "sans-serif";

  // Center vertical layout parameters
  let startY = height * 0.25;

  // 3. Draw Watermark Header
  if (brand.showWatermark) {
    ctx.fillStyle = textCol + "99";
    ctx.font = `600 24px ${bodyFont}`;
    ctx.textAlign = "center";
    ctx.fillText(brand.handle.toUpperCase(), width / 2, 70);

    // thin indicator line
    ctx.strokeStyle = textCol + "1F";
    ctx.beginPath();
    ctx.moveTo(width * 0.35, 95);
    ctx.lineTo(width * 0.65, 95);
    ctx.stroke();
  }

  // 4. Draw Slide Contents
  if (slide.type === "cover") {
    const hasSideImage = slide.imageUrl && slide.imageLayout === "side";
    const textCenterX = hasSideImage ? width * 0.32 : width / 2;

    // Highly attractive cover titles
    ctx.fillStyle = primaryCol;
    ctx.font = `bold 40px ${bodyFont}`;
    ctx.textAlign = "center";
    ctx.fillText("CRÔNICAS DE NEGÓCIOS & SUCESSO", textCenterX, startY - 40);

    // Main Viral Headline
    ctx.fillStyle = textCol;
    ctx.font = `700 75px ${headingFont}`;
    
    // Auto wrap headline text
    const words = (slide.title || "").split(" ");
    let line = "";
    let lines: string[] = [];
    const maxWidth = hasSideImage ? width * 0.50 : width - 160;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    let titleY = startY + 60;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i].trim(), textCenterX, titleY);
      titleY += 92;
    }

    // Subtitle content
    startY = titleY + 40;
    ctx.fillStyle = textCol + "CC";
    ctx.font = `400 36px ${bodyFont}`;
    const subtitle = Array.isArray(slide.content) ? slide.content.join(" ") : slide.content || "";
    ctx.fillText(subtitle, textCenterX, startY);

    // Elegant Action Hint at bottom
    ctx.fillStyle = primaryCol;
    ctx.font = `bold 32px ${bodyFont}`;
    ctx.fillText("ARRASte PARA O LADO ➔", textCenterX, height - 120);

  } else if (slide.type === "quote") {
    // Editorial Quote block
    ctx.fillStyle = primaryCol;
    ctx.font = `italic 140px Georgia, ${headingFont}`;
    ctx.textAlign = "center";
    ctx.fillText("“", width / 2, startY);

    // Quote content
    ctx.fillStyle = textCol;
    ctx.font = `500 50px ${headingFont}`;
    const desc = slide.title || "";
    // wrap quote text
    const words = desc.split(" ");
    let line = "";
    let lines: string[] = [];
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      if (metrics.width > (width - 240) && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    let quoteY = startY + 50;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i].trim(), width / 2, quoteY);
      quoteY += 75;
    }

    // Author
    ctx.fillStyle = textCol + "99";
    ctx.font = `bold 30px ${bodyFont}`;
    const author = Array.isArray(slide.content) ? slide.content.join(" ") : slide.content || "";
    ctx.fillText(`— ${author || "REFLEXÃO INSPIRADORA"}`, width / 2, quoteY + 60);

  } else if (slide.type === "checklist") {
    // List check items
    ctx.fillStyle = textCol;
    ctx.font = `bold 54px ${headingFont}`;
    ctx.textAlign = "left";
    ctx.fillText(slide.title, 100, startY);

    // checklist elements
    const items = Array.isArray(slide.content) ? slide.content : [slide.content];
    let checklistY = startY + 110;

    for (let i = 0; i < items.length; i++) {
      // Draw Checkmark Badge
      ctx.fillStyle = primaryCol;
      ctx.beginPath();
      ctx.arc(120, checklistY - 12, 24, 0, Math.PI * 2);
      ctx.fill();

      // Checkmark tick
      ctx.strokeStyle = bg;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(112, checklistY - 14);
      ctx.lineTo(118, checklistY - 7);
      ctx.lineTo(128, checklistY - 19);
      ctx.stroke();

      // Text
      ctx.fillStyle = textCol + "E5";
      ctx.font = `500 36px ${bodyFont}`;
      ctx.fillText(items[i], 170, checklistY);
      checklistY += 85;
    }

  } else if (slide.type === "cta") {
    // Final page Call to Action
    ctx.fillStyle = textCol;
    ctx.font = `bold 72px ${headingFont}`;
    ctx.textAlign = "center";
    ctx.fillText(slide.title || "GOSTOU DESTE CONTEÚDO?", width / 2, startY);

    // Text content
    ctx.fillStyle = textCol + "CC";
    ctx.font = `400 38px ${bodyFont}`;
    let ctaY = startY + 110;

    const notes = Array.isArray(slide.content) ? slide.content : [slide.content];
    for (const note of notes) {
      ctx.fillText(note, width / 2, ctaY);
      ctaY += 60;
    }

    // Call to action button
    const btnWidth = 500;
    const btnHeight = 90;
    const btnX = (width - btnWidth) / 2;
    const btnY = ctaY + 60;

    // Button body
    ctx.fillStyle = primaryCol;
    // Round rect drawing
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 15);
    ctx.fill();

    // Button text
    ctx.fillStyle = bg;
    ctx.font = `bold 32px ${bodyFont}`;
    ctx.textAlign = "center";
    ctx.fillText(slide.captionText || "SALVE PARA CONSULTAR DEPOIS", width / 2, btnY + 56);

  } else {
    // Default Content Slide standard formatting
    const hasSideImage = slide.imageUrl && slide.imageLayout === "side";
    ctx.fillStyle = primaryCol;
    ctx.font = `bold 32px ${bodyFont}`;
    ctx.textAlign = "left";
    ctx.fillText("MÍDIA E VALOR", 100, startY - 40);

    ctx.fillStyle = textCol;
    ctx.font = `bold 58px ${headingFont}`;
    
    // Wrap title if it's too long or side image is active
    const wordsIdx = (slide.title || "").split(" ");
    let lineIdx = "";
    let linesIdx: string[] = [];
    const maxTitleW = hasSideImage ? width * 0.52 : width - 200;
    for (let n = 0; n < wordsIdx.length; n++) {
      let testLine = lineIdx + wordsIdx[n] + " ";
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxTitleW && n > 0) {
        linesIdx.push(lineIdx);
        lineIdx = wordsIdx[n] + " ";
      } else {
        lineIdx = testLine;
      }
    }
    linesIdx.push(lineIdx);
    
    let currentTitleY = startY;
    for (const titleLine of linesIdx) {
      ctx.fillText(titleLine.trim(), 100, currentTitleY);
      currentTitleY += 66;
    }

    // Draw main body content
    ctx.fillStyle = textCol + "E0";
    ctx.font = `400 40px ${bodyFont}`;
    let textY = currentTitleY + 44;

    const paragraphs = Array.isArray(slide.content) ? slide.content : [slide.content];
    for (const p of paragraphs) {
      const words = p.split(" ");
      let line = "";
      let lines: string[] = [];
      const lineMaxWidth = hasSideImage ? width * 0.52 : width - 200;

      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + " ";
        let metrics = ctx.measureText(testLine);
        if (metrics.width > lineMaxWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      for (let j = 0; j < lines.length; j++) {
        ctx.fillText(lines[j].trim(), 100, textY);
        textY += 60;
      }
      textY += 30; // separation paragraph
    }

    // Icon or graphic placeholder illustration hint
    if (slide.stickerIcon && !hasSideImage) {
      ctx.fillStyle = primaryCol + "33"; // Light overlay
      ctx.beginPath();
      ctx.roundRect(width - 240, height - 240, 140, 140, 20);
      ctx.fill();
      
      ctx.strokeStyle = primaryCol;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(width - 170, height - 170, 30, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Draw side-banner / card image overlays
  if (slide.imageUrl) {
    if (slide.imageLayout === "side") {
      try {
        const img = await loadImage(slide.imageUrl);
        const imgW = width * 0.34;
        const imgH = height * 0.75;
        const imgX = width - imgW - 60;
        const imgY = height * 0.12;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgW, imgH, 24);
        ctx.clip();
        const scale = Math.max(imgW / img.width, imgH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, imgX + (imgW - w) / 2, imgY + (imgH - h) / 2, w, h);
        ctx.restore();
      } catch (e) {
        console.error("Erro ao desenhar imagem lateral:", e);
      }
    } else if (slide.imageLayout === "card") {
      try {
        const img = await loadImage(slide.imageUrl);
        const imgW = 280;
        const imgH = 280;
        const imgX = width - imgW - 80;
        const imgY = height * 0.52;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgW, imgH, 24);
        ctx.clip();
        const scale = Math.max(imgW / img.width, imgH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, imgX + (imgW - w) / 2, imgY + (imgH - h) / 2, w, h);
        ctx.restore();

        ctx.strokeStyle = "#10B981";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgW, imgH, 24);
        ctx.stroke();
      } catch (e) {
        console.error("Erro ao desenhar imagem destaque:", e);
      }
    }
  }

  // 5. Draw Common footer profile details and slide counter
  const footerY = height - 60;
  
  // Footer handle signature
  ctx.fillStyle = textCol + "B5";
  ctx.font = `bold 26px ${bodyFont}`;
  ctx.textAlign = "left";
  ctx.fillText(brand.handle, 100, footerY);

  // Slide Counter indicator
  if (brand.showSlideNumber) {
    ctx.fillStyle = textCol + "B5";
    ctx.font = `600 26px ${bodyFont}`;
    ctx.textAlign = "right";
    ctx.fillText(`${index + 1}/${totalSlides}`, width - 100, footerY);
  }

  return canvas;
}

/**
 * Download a dataUrl as client file trigger
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
