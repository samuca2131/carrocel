import React, { useState, useEffect } from "react";
import { Sparkles, Type, Palette, AlignLeft, AlignCenter, AlignRight, RefreshCw, RefreshCcw, LayoutTemplate, Image as ImageIcon, Check, Trash2 } from "lucide-react";
import { Slide, SuggestedPalette, BrandSettings } from "../types";

interface EditorWorkspaceProps {
  slide: Slide | null;
  palette: SuggestedPalette;
  brand: BrandSettings;
  onUpdateSlide: (updatedSlide: Slide) => void;
  onAIRewrite: (action: 'rewrite' | 'expand' | 'summarize' | 'professional' | 'viral-hook') => void;
  isRewriting: boolean;
}

export default function EditorWorkspace({
  slide,
  palette,
  brand,
  onUpdateSlide,
  onAIRewrite,
  isRewriting
}: EditorWorkspaceProps) {
  const [selectedElement, setSelectedElement] = useState<'title' | 'content' | 'caption' | null>(null);
  
  // Image Generator Local States
  const [imgPrompt, setImgPrompt] = useState("");
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [imgLoadError, setImgLoadError] = useState("");

  useEffect(() => {
    if (slide) {
      setImgPrompt(slide.imagePrompt || "");
      setImgLoadError("");
    }
  }, [slide?.id, slide?.imagePrompt]);

  if (!slide) {
    return (
      <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center text-slate-400 p-8" id="empty-workspace">
        <Sparkles className="w-12 h-12 text-slate-700 mb-4 animate-bounce" />
        <h2 className="text-lg font-bold text-slate-300">Nenhum Carrossel Carregado</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
          Preencha a ideia principal no painel esquerdo ou selecione um template da biblioteca para iniciar sua jornada criativa!
        </p>
      </div>
    );
  }

  // Active configurations (uses slide-specific details or global defaults)
  const bg = slide.customBackground || palette.background;
  const textColor = slide.customTextColor || palette.text;
  const primaryColor = slide.customPrimaryColor || palette.primary;

  const fontHeadingMap = {
    "Inter": "font-sans",
    "Space Grotesk": "font-sans tracking-tight",
    "Playfair Display": "font-serif font-medium",
    "JetBrains Mono": "font-mono"
  };

  const fontBodyMap = {
    "Inter": "font-sans",
    "JetBrains Mono": "font-mono text-xs"
  };

  const headingFontClass = fontHeadingMap[palette.fontHeading as keyof typeof fontHeadingMap] || "font-sans";
  const bodyFontClass = fontBodyMap[palette.fontBody as keyof typeof fontBodyMap] || "font-sans";

  // Aspect ratio helper CSS
  const getAspectClass = () => {
    switch (brand.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-w-[340px]';
      case '16:9':
        return 'aspect-video max-w-[620px]';
      case '1:1':
      default:
        return 'aspect-square max-w-[500px]';
    }
  };

  // Helper to change specific properties of current slide
  const changeProperty = (property: keyof Slide, value: any) => {
    onUpdateSlide({
      ...slide,
      [property]: value
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    changeProperty("title", e.target.value);
  };

  const handleBulletChange = (idx: number, val: string) => {
    const list = Array.isArray(slide.content) ? [...slide.content] : [slide.content];
    list[idx] = val;
    changeProperty("content", list);
  };

  const handleAddBulletItem = () => {
    const list = Array.isArray(slide.content) ? [...slide.content] : [slide.content];
    list.push("Novo item estratégico de conteúdo");
    changeProperty("content", list);
  };

  const handleRemoveBulletItem = (idx: number) => {
    const list = Array.isArray(slide.content) ? [...slide.content] : [slide.content];
    if (list.length <= 1) return;
    list.splice(idx, 1);
    changeProperty("content", list);
  };

  return (
    <div className="flex-1 bg-slate-900 flex flex-col md:flex-row focus-element relative" id="editor-workspace-container">
      {/* Central Visual Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 border-r border-slate-800 bg-slate-900/40 relative">
        {/* Dynamic Aspect Ratio Canvas Card */}
        <div
          style={{ backgroundColor: bg }}
          className={`w-full ${getAspectClass()} rounded-2xl shadow-2xl relative flex flex-col justify-between p-10 overflow-hidden transition-all duration-300 border border-white/5`}
          id="visual-canvas-card"
        >
          {/* Real AI background image */}
          {slide.imageUrl && slide.imageLayout === 'background' && (
            <div 
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.28] transition-opacity duration-500 z-0"
              id="slide-ai-background-layer"
            />
          )}

          {/* Real AI side image banner */}
          {slide.imageUrl && slide.imageLayout === 'side' && (
            <div 
              className="absolute right-6 top-16 bottom-16 w-[34%] rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-20"
              id="slide-ai-side-layer"
            >
              <img src={slide.imageUrl} alt="IA Split Layout" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}

          {/* Real AI card image */}
          {slide.imageUrl && slide.imageLayout === 'card' && (
            <div 
              className="absolute right-8 bottom-28 w-36 h-36 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl z-20 hover:scale-105 transition-transform duration-300"
              id="slide-ai-card-layer"
            >
              <img src={slide.imageUrl} alt="IA Card" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}

          {/* Subtle Decorative design layers */}
          {slide.type === 'cover' && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-white to-transparent" />
          )}

          {/* Grid Background Pattern mock details */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Watermark / Logo header */}
          {brand.showWatermark && (
            <div
              style={{ color: textColor + "B3" }}
              className={`text-center space-y-1 select-none z-10`}
              id="top-brand-watermark"
            >
              <p className="text-[11px] font-bold tracking-widest font-sans uppercase">
                {brand.handle || "@SEUAUTOR"}
              </p>
              <div className="h-0.5 w-24 bg-current opacity-20 mx-auto" />
            </div>
          )}

          {/* Render Slide Content depending on layout type */}
          <div className={`flex-1 flex flex-col justify-center py-6 z-10 ${slide.imageUrl && slide.imageLayout === 'side' ? 'max-w-[60%]' : ''}`} id="slide-content-block">
            {slide.type === 'cover' ? (
              // 1. Cover Layer layout
              <div className="text-center space-y-6">
                <span
                  style={{ color: primaryColor }}
                  className="inline-block text-[11px] font-extrabold uppercase tracking-widest font-mono"
                >
                  CONTEÚDO DA SÉRIE
                </span>
                
                {/* Editable Title */}
                <textarea
                  className={`w-full bg-transparent text-center focus:ring-1 focus:ring-emerald-500/50 rounded-lg p-2 resize-none text-2xl lg:text-3xl font-extrabold leading-tight focus:outline-none focus:bg-slate-950/20`}
                  style={{ color: textColor, fontFamily: headingFontClass }}
                  value={slide.title}
                  rows={3}
                  onChange={handleTitleChange}
                  onClick={() => setSelectedElement('title')}
                />

                {/* Subtitle / Description sentence */}
                <input
                  className={`w-full bg-transparent text-center focus:ring-1 focus:ring-emerald-500/50 rounded-lg p-2 text-sm text-slate-400 focus:outline-none focus:bg-slate-950/20`}
                  style={{ color: textColor + "CC", fontFamily: bodyFontClass }}
                  value={Array.isArray(slide.content) ? slide.content.join(" ") : slide.content}
                  onChange={(e) => changeProperty("content", [e.target.value])}
                  onClick={() => setSelectedElement('content')}
                />

                <div className="pt-2">
                  <span
                    style={{ color: primaryColor }}
                    className="animate-pulse inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide font-mono"
                  >
                    Arrasta para o lado ➔
                  </span>
                </div>
              </div>
            ) : slide.type === 'quote' ? (
              // 2. Beautiful Quote template
              <div className="text-center space-y-4">
                <span style={{ color: primaryColor }} className="text-6xl font-serif leading-none block select-none">“</span>
                
                <textarea
                  className={`w-full bg-transparent text-center focus:ring-1 focus:ring-emerald-500/50 rounded-lg p-2 resize-none text-base lg:text-lg font-medium italic focus:outline-none focus:bg-slate-950/20`}
                  style={{ color: textColor, fontFamily: headingFontClass }}
                  value={slide.title}
                  rows={4}
                  onChange={handleTitleChange}
                  onClick={() => setSelectedElement('title')}
                />

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold uppercase">
                  <span className="w-4 h-px bg-current opacity-40" />
                  <input
                    className="bg-transparent tracking-widest text-center text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded px-1 max-w-[200px]"
                    style={{ color: textColor + "B3", fontFamily: bodyFontClass }}
                    value={Array.isArray(slide.content) ? slide.content.join(" ") : slide.content}
                    onChange={(e) => changeProperty("content", [e.target.value])}
                    onClick={() => setSelectedElement('content')}
                    placeholder="AUTOR DA CITAÇÃO"
                  />
                  <span className="w-4 h-px bg-current opacity-40" />
                </div>
              </div>
            ) : slide.type === 'checklist' ? (
              // 3. Checklist list items template
              <div className="space-y-4">
                <input
                  className={`w-full bg-transparent focus:ring-1 focus:ring-emerald-500/50 rounded-lg p-1.5 text-xl lg:text-2xl font-extrabold focus:outline-none focus:bg-slate-950/20`}
                  style={{ color: textColor, fontFamily: headingFontClass }}
                  value={slide.title}
                  onChange={handleTitleChange}
                  onClick={() => setSelectedElement('title')}
                />

                <div className="space-y-2.5">
                  {(Array.isArray(slide.content) ? slide.content : [slide.content]).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 group/item">
                      <div
                        style={{ backgroundColor: primaryColor }}
                        className="w-5 h-5 rounded-full flex items-center justify-center mt-1 text-[10px] text-slate-950 font-bold flex-shrink-0"
                      >
                        ✓
                      </div>
                      <input
                        className={`flex-1 bg-transparent text-sm focus:ring-1 focus:ring-emerald-500/50 rounded-lg p-1 focus:outline-none focus:bg-slate-950/20`}
                        style={{ color: textColor + "E6", fontFamily: bodyFontClass }}
                        value={item}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        onClick={() => setSelectedElement('content')}
                      />
                      <button
                        onClick={() => handleRemoveBulletItem(idx)}
                        className="opacity-0 group-hover/item:opacity-100 p-1 text-red-400 hover:text-red-300 transition text-xs cursor-pointer"
                        title="Remover item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={handleAddBulletItem}
                    className="text-xs hover:underline flex items-center gap-1 font-semibold transition mt-2 cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    + Adicionar marcador
                  </button>
                </div>
              </div>
            ) : slide.type === 'cta' ? (
              // 4. CTA (Final Page Call to Action Template)
              <div className="text-center space-y-6">
                <textarea
                  className={`w-full bg-transparent text-center focus:ring-1 focus:ring-emerald-500/50 rounded-lg p-2 resize-none text-2xl lg:text-3xl font-extrabold uppercase leading-tight focus:outline-none focus:bg-slate-950/20`}
                  style={{ color: textColor, fontFamily: headingFontClass }}
                  value={slide.title}
                  rows={2}
                  onChange={handleTitleChange}
                  onClick={() => setSelectedElement('title')}
                />

                <div className="space-y-1">
                  {(Array.isArray(slide.content) ? slide.content : [slide.content]).map((item, idx) => (
                    <input
                      key={idx}
                      className="w-full bg-transparent text-center focus:ring-1 focus:ring-emerald-500/50 rounded-lg p-1 text-sm focus:outline-none focus:bg-slate-950/20"
                      style={{ color: textColor + "CC", fontFamily: bodyFontClass }}
                      value={item}
                      onChange={(e) => handleBulletChange(idx, e.target.value)}
                      onClick={() => setSelectedElement('content')}
                    />
                  ))}
                </div>

                {/* Animated Simulated Premium click button */}
                <div className="pt-4">
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="px-6 py-3 rounded-xl inline-block max-w-[280px] font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all duration-300 text-slate-950 uppercase tracking-wider"
                  >
                    <input
                      className="bg-transparent text-center text-xs font-bold uppercase cursor-pointer focus:outline-none w-full"
                      value={slide.captionText || "Salvar para ler depois"}
                      onChange={(e) => changeProperty("captionText", e.target.value)}
                      placeholder="TEXTO DO BOTÃO"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // 5. Classic Content Slide layout
              <div className="space-y-4">
                <span
                  style={{ color: primaryColor }}
                  className="text-xs font-extrabold uppercase font-mono tracking-wider"
                >
                  {slide.stickerIcon ? `[${slide.stickerIcon.toUpperCase()}]` : "FRENTE"}
                </span>

                <textarea
                  className={`w-full bg-transparent focus:ring-1 focus:ring-emerald-500/50 rounded-lg p-2 resize-none text-xl lg:text-2xl font-extrabold focus:outline-none focus:bg-slate-950/20`}
                  style={{ color: textColor, fontFamily: headingFontClass }}
                  value={slide.title}
                  rows={2}
                  onChange={handleTitleChange}
                  onClick={() => setSelectedElement('title')}
                />

                <div className="space-y-2">
                  {(Array.isArray(slide.content) ? slide.content : [slide.content]).map((p, idx) => (
                    <textarea
                      key={idx}
                      className={`w-full bg-transparent focus:ring-1 focus:ring-emerald-500/50 rounded-lg p-2 resize-none text-sm focus:outline-none focus:bg-slate-950/20`}
                      style={{ color: textColor + "D9", fontFamily: bodyFontClass }}
                      value={p}
                      rows={3}
                      onChange={(e) => handleBulletChange(idx, e.target.value)}
                      onClick={() => setSelectedElement('content')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Slide Footer */}
          <div className="flex items-center justify-between mt-auto z-10" id="bottom-brand-watermark">
            <span
              style={{ color: textColor + "B3" }}
              className="text-xs font-semibold font-mono flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: primaryColor }} />
              {brand.handle || "@SEUPROFIL"}
            </span>

            {brand.showSlideNumber && (
              <span
                style={{ color: textColor + "99" }}
                className="text-xs font-bold font-mono bg-white/5 px-2 py-0.5 rounded-lg border border-white/5"
              >
                PÁGINA {slide.id.replace("slide-", "") || "1"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Slide Customizer Panel (Right Part) */}
      <div className="w-full md:w-80 bg-slate-950/90 flex flex-col p-5 space-y-6 overflow-y-auto scrollbar-thin" id="slide-properties-toolbar">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <LayoutTemplate className="w-4 h-4 text-emerald-400" />
            Layout do Slide
          </h4>
          <div className="grid grid-cols-2 gap-2" id="layout-choice-grid">
            {[
              { type: 'cover', icon: '👑', label: 'Capa / Capa Viral' },
              { type: 'content', icon: '📝', label: 'Conteúdo Padrão' },
              { type: 'checklist', icon: '✓', label: 'Lista Passo a Passo' },
              { type: 'quote', icon: '“', label: 'Citação / Story' },
              { type: 'cta', icon: '📣', label: 'Chamada CTA Final' },
            ].map((layout) => (
              <button
                key={layout.type}
                onClick={() => changeProperty("type", layout.type)}
                className={`p-2.5 rounded-xl text-left border flex flex-col items-start gap-1 transition-all duration-300 cursor-pointer ${
                  slide.type === layout.type
                    ? 'border-emerald-500 bg-slate-900 font-bold text-emerald-400'
                    : 'border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <span className="text-lg">{layout.icon}</span>
                <span className="text-[10px] leading-tight">{layout.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Rephrasing Helper Actions */}
        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="w-4 h-4" />
            Escritor Inteligente IA
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Selecione uma ação rápida abaixo para aprimorar, compactar ou adicionar gatilhos ao texto deste slide:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1" id="ai-rephrase-grid">
            <button
              onClick={() => onAIRewrite('rewrite')}
              disabled={isRewriting}
              className="p-1.5 bg-slate-950 text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg text-[10px] font-semibold border border-slate-800 transition cursor-pointer"
            >
              ✨ Melhorar Copy
            </button>
            <button
              onClick={() => onAIRewrite('viral-hook')}
              disabled={isRewriting}
              className="p-1.5 bg-slate-950 text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg text-[10px] font-semibold border border-slate-800 transition cursor-pointer"
            >
              🔥 Título Viral
            </button>
            <button
              onClick={() => onAIRewrite('expand')}
              disabled={isRewriting}
              className="p-1.5 bg-slate-950 text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg text-[10px] font-semibold border border-slate-800 transition cursor-pointer"
            >
              ➕ Expandir Texto
            </button>
            <button
              onClick={() => onAIRewrite('summarize')}
              disabled={isRewriting}
              className="p-1.5 bg-slate-950 text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg text-[10px] font-semibold border border-slate-800 transition cursor-pointer"
            >
              ⚡ Resumir/Direct
            </button>
          </div>
          {isRewriting && (
            <div className="text-[9px] text-emerald-500 font-bold animate-pulse text-center">
              Reescrevendo estrutura com IA...
            </div>
          )}
        </div>

        {/* Gerador de Imagem IA Panel */}
        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Gerador de Imagem IA</span>
          </h4>
          
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Escreva o conceito visual que deseja colocar no slide ou clique em um preset para formatar o prompt:
          </p>

          <div className="space-y-2">
            <textarea
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/40 rounded-lg p-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-slate-200 resize-none font-sans"
              rows={3}
              placeholder="Ex: Uma lâmpada neon 3D flutuando no espaço escuro"
              value={imgPrompt}
              onChange={(e) => setImgPrompt(e.target.value)}
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1">
              {[
                { name: "Tech 3D", style: ", stunning 3D glassmorphic tech clay render design, futuristic visual, high detail" },
                { name: "Vetor Flat", style: ", flat modern vector art shape design, minimal style, premium layout" },
                { name: "Neon Glow", style: ", magical dark neon glow organic fluid aesthetic, dynamic cyberpunk colors" },
                { name: "Retrato Corp", style: ", high-end corporate lifestyle atmospheric workspace photography" }
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setImgPrompt(prev => prev + preset.style)}
                  className="px-1.5 py-0.5 rounded bg-slate-950 text-[8px] text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-900"
                >
                  {preset.name} +
                </button>
              ))}
            </div>

            {/* Prompt Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!imgPrompt) return;
                  setIsGeneratingImg(true);
                  setImgLoadError("");
                  try {
                    // Map current aspect ratio
                    let aspRatio = "1:1";
                    if (brand.aspectRatio === "9:16") aspRatio = "9:16";
                    else if (brand.aspectRatio === "16:9") aspRatio = "16:9";

                    const response = await fetch("/api/generate-image", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        prompt: imgPrompt,
                        aspectRatio: aspRatio
                      })
                    });

                    if (!response.ok) {
                      throw new Error("Pico de solicitações na API");
                    }

                    const data = await response.json();
                    if (data.imageUrl) {
                      onUpdateSlide({
                        ...slide,
                        imagePrompt: imgPrompt,
                        imageUrl: data.imageUrl,
                        imageLayout: slide.imageLayout && slide.imageLayout !== 'none' ? slide.imageLayout : "card"
                      });
                    } else {
                      throw new Error("Dados corrompidos");
                    }
                  } catch (err) {
                    console.error(err);
                    setImgLoadError("Houve uma instabilidade. Utilizando banco inteligente como fallback.");
                    // Fallback keyword retrieval
                    const keywords = imgPrompt
                      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
                      .split(/\s+/)
                      .filter((w) => w.length > 3)
                      .slice(0, 3)
                      .join(",");
                    const fallbackUrl = `https://images.unsplash.com/featured/?${encodeURIComponent(keywords || "business,marketing")}&q=80&w=700`;
                    
                    onUpdateSlide({
                      ...slide,
                      imagePrompt: imgPrompt,
                      imageUrl: fallbackUrl,
                      imageLayout: slide.imageLayout && slide.imageLayout !== 'none' ? slide.imageLayout : "card"
                    });
                  } finally {
                    setIsGeneratingImg(false);
                  }
                }}
                disabled={isGeneratingImg}
                className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-[10px] font-black tracking-wider transition duration-300 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingImg ? (
                  <span className="flex items-center gap-1 justify-center">
                    <span className="w-2.5 h-2.5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                    Gerando...
                  </span>
                ) : "Gerar Imagem IA"}
              </button>

              {slide.imageUrl && (
                <button
                  onClick={() => {
                    onUpdateSlide({
                      ...slide,
                      imageUrl: undefined,
                      imageLayout: "none"
                    });
                  }}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-red-500/10 text-red-400 rounded text-[10px] border border-slate-800 hover:border-red-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Remover Imagem"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {imgLoadError && (
              <p className="text-[8px] text-amber-400 text-center leading-tight">{imgLoadError}</p>
            )}

            {/* Layout representation position toggler */}
            {slide.imageUrl && (
              <div className="pt-2 border-t border-slate-800/40 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Estilo de Exibição</span>
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/5 px-1 rounded">Ativo</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(['card', 'side', 'background', 'none'] as const).map((lay) => {
                    const labelMap = { card: "Destaque", side: "Lateral", background: "Fundo", none: "Ocultar" };
                    const isSel = (slide.imageLayout || 'none') === lay;
                    return (
                      <button
                        key={lay}
                        onClick={() => {
                          onUpdateSlide({
                            ...slide,
                            imageLayout: lay
                          });
                        }}
                        className={`py-1 rounded text-[9px] font-bold text-center transition ${
                          isSel
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-950 text-slate-400 border border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        {labelMap[lay]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slide Color Overrides panel */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-400" />
            Cores Deste Slide
          </h4>
          <div className="space-y-3" id="color-picker-slots">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">Fundo Individual</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => changeProperty("customBackground", e.target.value)}
                  className="w-10 h-7 rounded border border-slate-800 bg-transparent cursor-pointer"
                />
                <button
                  onClick={() => changeProperty("customBackground", undefined)}
                  className="text-[9px] text-slate-500 hover:text-slate-200"
                  title="Restaurar padrão"
                >
                  Remover
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">Texto Individual</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => changeProperty("customTextColor", e.target.value)}
                  className="w-10 h-7 rounded border border-slate-800 bg-transparent cursor-pointer"
                />
                <button
                  onClick={() => changeProperty("customTextColor", undefined)}
                  className="text-[9px] text-slate-500 hover:text-slate-200"
                  title="Restaurar padrão"
                >
                  Remover
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">Destaque Individual</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => changeProperty("customPrimaryColor", e.target.value)}
                  className="w-10 h-7 rounded border border-slate-800 bg-transparent cursor-pointer"
                />
                <button
                  onClick={() => changeProperty("customPrimaryColor", undefined)}
                  className="text-[9px] text-slate-500 hover:text-slate-200"
                  title="Restaurar padrão"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
