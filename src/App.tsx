import React, { useState } from "react";
import { Sparkles, Download, Play, FileText, Layout, BookOpen, Layers, CheckCircle, RefreshCw, Palette, ExternalLink, HelpCircle } from "lucide-react";
import SidebarGenerator from "./components/SidebarGenerator";
import SlidesList from "./components/SlidesList";
import EditorWorkspace from "./components/EditorWorkspace";
import LegendaGenerator from "./components/LegendaGenerator";
import EngagementAuditor from "./components/EngagementAuditor";
import PresentationPlayer from "./components/PresentationPlayer";
import AIGenerator from "./components/AIGenerator";
import { CarouselData, Slide, BrandSettings, PREMIUM_TEMPLATES } from "./types";
import { drawSlideToCanvas, downloadDataUrl } from "./utils/canvasExporter";

// Default High-Converting Sample Carousel to populate on first load
const INITIAL_DEMO_CAROUSEL: CarouselData = {
  theme: "Como Atrair Clientes High-Ticket",
  suggestedPalette: {
    background: "#05161A",
    text: "#E2F0F3",
    primary: "#0F969C",
    fontHeading: "Playfair Display",
    fontBody: "Inter"
  },
  slides: [
    {
      id: "slide-1",
      type: "cover",
      title: "COMO FECHAR CONTRATOS DE R$ 10.000+ SEM SOFRER",
      content: ["O passo a passo definitivo para mídias sociais atraírem compradores prontos para fechar vendas."],
      stickerIcon: "star"
    },
    {
      id: "slide-2",
      type: "content",
      title: "1. Pare de Postar Somente Dicas Básicas",
      content: [
        "Clientes de alto padrão não buscam tutoriais rápidos. Eles procuram líderes que resolvem problemas operacionais profundos e trazem clareza estratégica."
      ],
      stickerIcon: "alert-circle"
    },
    {
      id: "slide-3",
      type: "content",
      title: "2. Posicionamento de Extremo Valor",
      content: [
        "Foque 80% do seu feed na sofisticação da sua entrega e na segurança das suas decisões operacionais, e apenas 20% em novidades corporativas."
      ],
      stickerIcon: "trending-up"
    },
    {
      id: "slide-4",
      type: "checklist",
      title: "3. Checklist de Atração Premium",
      content: [
        "Identidade visual com paletas escuras e limpas",
        "Bio resolutiva com proposta única de valor",
        "Link direto para diagnóstico de 15 minutos"
      ],
      stickerIcon: "check-circle"
    },
    {
      id: "slide-5",
      type: "quote",
      title: "O comprador de baixo ticket escolhe pelo preço. O comprador premium seleciona pela confiança, velocidade e segurança da solução.",
      content: ["Roberto Samuel — Especialista Comercial"],
      stickerIcon: "award"
    },
    {
      id: "slide-6",
      type: "content",
      title: "4. Qualificação Rápida via Direct",
      content: [
        "Não fale preço pelo direct. Use esse canal para qualificar o orçamento e enviar um link para uma videoconferência fechada de diagnóstico."
      ],
      stickerIcon: "target"
    },
    {
      id: "slide-7",
      type: "cta",
      title: "AGORA A DECISÃO É SUA!",
      content: [
        "Gostou destas regras? Qualifique seu negócio agora.",
        "Toque no link da Bio e agende sua mentoria estratégica."
      ],
      captionText: "QUERO MINHA REUNIÃO",
      stickerIcon: "heart"
    }
  ]
};

export default function App() {
  const [carouselData, setCarouselData] = useState<CarouselData>(INITIAL_DEMO_CAROUSEL);
  const [activeSlideId, setActiveSlideId] = useState<string>("slide-1");
  const [sidebarTab, setSidebarTab] = useState<'generator' | 'brand' | 'elements'>('generator');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [showPresentation, setShowPresentation] = useState<boolean>(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'editor' | 'auditor' | 'legenda'>('editor');
  const [globalThemeType, setGlobalThemeType] = useState<string>("emerald-luxury");

  // Branding defaults
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    handle: "@seu.perfil",
    aspectRatio: '1:1',
    showSlideNumber: true,
    showWatermark: true,
  });

  const activeSlide = carouselData.slides.find(s => s.id === activeSlideId) || carouselData.slides[0] || null;

  // AI-powered generator handler calling our API proxy safely
  const handleGenerateCarousel = async (params: {
    prompt: string;
    niche: string;
    objective: string;
    targetAudience: string;
    numberOfSlides: number;
  }) => {
    setIsLoading(true);
    setSidebarTab('generator');
    try {
      const response = await fetch("/api/generate-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error("Erro de infraestrutura ao contatar IA");
      }

      const generatedData: CarouselData = await response.json();
      setCarouselData(generatedData);
      
      if (generatedData.slides.length > 0) {
        setActiveSlideId(generatedData.slides[0].id);
      }
      
      // Auto switch tabs
      setActiveWorkspaceTab('editor');
    } catch (err) {
      console.error(err);
      alert("Houve um pico de acessos. Por favor, tente novamente em alguns segundos.");
    } finally {
      setIsLoading(false);
    }
  };

  // AI Rewrite text handler for current selection
  const handleAIRewrite = async (action: 'rewrite' | 'expand' | 'summarize' | 'professional' | 'viral-hook') => {
    if (!activeSlide) return;
    setIsRewriting(true);
    try {
      const response = await fetch("/api/rewrite-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeSlide.title,
          content: activeSlide.content,
          type: activeSlide.type,
          niche: carouselData.theme,
          action
        })
      });

      if (!response.ok) throw new Error("Erro na solicitação de rewrite");
      
      const resData = await response.json();

      updateSlide({
        ...activeSlide,
        title: resData.newTitle,
        content: resData.newContent,
        captionText: resData.captionText || activeSlide.captionText
      });

    } catch (err) {
      console.error(err);
      alert("Não foi possível acionar a reescrita técnica.");
    } finally {
      setIsRewriting(false);
    }
  };

  // Individual slide updater
  const updateSlide = (updated: Slide) => {
    const list = carouselData.slides.map(s => s.id === updated.id ? updated : s);
    setCarouselData({
      ...carouselData,
      slides: list
    });
  };

  // Slides configuration manager actions
  const handleAddSlide = () => {
    const newId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id: newId,
      type: 'content',
      title: "Título de Nova Ideia",
      content: ["Espaço reservado para colocar seus tópicos persuasivos baseados na jornada do usuário."],
      stickerIcon: 'check-circle'
    };

    setCarouselData({
      ...carouselData,
      slides: [...carouselData.slides, newSlide]
    });
    setActiveSlideId(newId);
  };

  const handleDuplicateSlide = (id: string) => {
    const target = carouselData.slides.find(s => s.id === id);
    if (!target) return;

    const newId = `slide-${Date.now()}`;
    const duplicated: Slide = {
      ...target,
      id: newId,
      title: `${target.title} (Cópia)`
    };

    const index = carouselData.slides.findIndex(s => s.id === id);
    const updatedSlides = [...carouselData.slides];
    updatedSlides.splice(index + 1, 0, duplicated);

    setCarouselData({
      ...carouselData,
      slides: updatedSlides
    });
    setActiveSlideId(newId);
  };

  const handleDeleteSlide = (id: string) => {
    if (carouselData.slides.length <= 1) return;
    const remaining = carouselData.slides.filter(s => s.id !== id);
    setCarouselData({
      ...carouselData,
      slides: remaining
    });
    if (activeSlideId === id) {
      setActiveSlideId(remaining[0].id);
    }
  };

  const handleMoveSlide = (id: string, direction: 'up' | 'down') => {
    const idx = carouselData.slides.findIndex(s => s.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === carouselData.slides.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const list = [...carouselData.slides];
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    setCarouselData({
      ...carouselData,
      slides: list
    });
  };

  // Global theme customizer apply
  const applyPresetPremiumTemplate = (tplId: string) => {
    const tpl = PREMIUM_TEMPLATES.find(p => p.id === tplId);
    if (!tpl) return;
    setGlobalThemeType(tplId);
    setCarouselData({
      ...carouselData,
      suggestedPalette: { ...tpl.palette }
    });
  };

  const changePaletteColor = (colorKey: 'background' | 'text' | 'primary', value: string) => {
    setCarouselData({
      ...carouselData,
      suggestedPalette: {
        ...carouselData.suggestedPalette,
        [colorKey]: value
      }
    });
  };

  const changePaletteFont = (fontKey: 'fontHeading' | 'fontBody', value: string) => {
    setCarouselData({
      ...carouselData,
      suggestedPalette: {
        ...carouselData.suggestedPalette,
        [fontKey]: value
      }
    });
  };

  // Exporters loops triggers
  const handleExportCurrentPNG = async () => {
    if (!activeSlide) return;
    try {
      const idx = carouselData.slides.findIndex(s => s.id === activeSlide.id);
      const canvas = await drawSlideToCanvas(
        activeSlide,
        idx,
        carouselData.slides.length,
        carouselData.suggestedPalette,
        brandSettings
      );
      const url = canvas.toDataURL("image/png");
      downloadDataUrl(url, `slide-${idx + 1}-carrossel-${carouselData.theme.replace(/\s+/g, '-').toLowerCase()}.png`);
    } catch (err) {
      console.error(err);
      alert("Não foi possível compilar imagem no momento.");
    }
  };

  const handleExportCurrentJPG = async () => {
    if (!activeSlide) return;
    try {
      const idx = carouselData.slides.findIndex(s => s.id === activeSlide.id);
      const canvas = await drawSlideToCanvas(
        activeSlide,
        idx,
        carouselData.slides.length,
        carouselData.suggestedPalette,
        brandSettings
      );
      const url = canvas.toDataURL("image/jpeg", 0.95);
      downloadDataUrl(url, `slide-${idx + 1}-carrossel-${carouselData.theme.replace(/\s+/g, '-').toLowerCase()}.jpg`);
    } catch (err) {
      console.error(err);
      alert("Não foi possível compilar imagem no momento.");
    }
  };

  const handleExportAllPNG = async () => {
    if (carouselData.slides.length === 0) return;
    try {
      for (let i = 0; i < carouselData.slides.length; i++) {
        const canvas = await drawSlideToCanvas(
          carouselData.slides[i],
          i,
          carouselData.slides.length,
          carouselData.suggestedPalette,
          brandSettings
        );
        const url = canvas.toDataURL("image/png");
        downloadDataUrl(url, `carrossel-slide-${i + 1}.png`);
        
        // Wait minor delay to bypass active script block limit
        await new Promise(r => setTimeout(r, 250));
      }
    } catch (err) {
      console.error(err);
      alert("Falha ao preparar download sucessivo de imagens.");
    }
  };

  const handleExportAllJPG = async () => {
    if (carouselData.slides.length === 0) return;
    try {
      for (let i = 0; i < carouselData.slides.length; i++) {
        const canvas = await drawSlideToCanvas(
          carouselData.slides[i],
          i,
          carouselData.slides.length,
          carouselData.suggestedPalette,
          brandSettings
        );
        const url = canvas.toDataURL("image/jpeg", 0.95);
        downloadDataUrl(url, `carrossel-slide-${i + 1}.jpg`);
        
        // Wait minor delay to bypass active script block limit
        await new Promise(r => setTimeout(r, 250));
      }
    } catch (err) {
      console.error(err);
      alert("Falha ao preparar download sucessivo de imagens.");
    }
  };

  // Dynamic sandbox rendering for vector printing multi-page PDF documents
  const triggerNativePDFPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app-root">
      {/* Top Header bar with professional navigation actions */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-30" id="top-bar-controls">
        <div className="flex items-center gap-2.5">
          {/* Logo with emerald sparkles ring */}
          <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center justify-center font-bold text-lg shadow-inner">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-slate-100 uppercase">
              Carrossel<span className="text-emerald-400">.AI</span>
            </h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">
              SaaS Creator Suite
            </p>
          </div>
        </div>

        {/* Global actions and exports selectors */}
        <div className="flex items-center gap-2.5">
          {/* Play slideshow presentation */}
          <button
            onClick={() => setShowPresentation(true)}
            className="py-2 px-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
            id="play-presentation-topbar"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            <span>Modo Apresentação</span>
          </button>

          {/* Export PDF through elegant printing */}
          <button
            onClick={triggerNativePDFPrint}
            className="py-2 px-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
            id="export-pdf-topbar"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar PDF</span>
          </button>

          {/* Download active/all files dropdown */}
          <div className="relative group">
            <button
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/10 cursor-pointer"
              id="download-images-topbar"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Imagens</span>
            </button>
            
            {/* Elegant dropdown flyout */}
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-1.5 hidden group-hover:block transition z-50">
              <div className="px-3 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/60 mb-1">
                Download Simples
              </div>
              <button
                onClick={handleExportCurrentPNG}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
              >
                Baixar Slide Atual (PNG)
              </button>
              <button
                onClick={handleExportCurrentJPG}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
              >
                Baixar Slide Atual (JPG)
              </button>

              <div className="px-3 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-800/60 my-1">
                Download Completo
              </div>
              <button
                onClick={handleExportAllPNG}
                className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-slate-800 rounded-lg transition font-medium"
              >
                Salvar Carrossel (ZIP de PNGs)
              </button>
              <button
                onClick={handleExportAllJPG}
                className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-slate-800 rounded-lg transition font-medium"
              >
                Salvar Carrossel (ZIP de JPGs)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main SaaS panel workspace area splitting generators & editor boards */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Settings generator & brand parameters rail */}
        <SidebarGenerator
          onGenerate={handleGenerateCarousel}
          isLoading={isLoading}
          activeTab={sidebarTab}
          setActiveTab={setSidebarTab}
          brandSettings={brandSettings}
          setBrandSettings={setBrandSettings}
          activeSlide={activeSlide}
          onUpdateSlide={updateSlide}
          carouselTheme={carouselData.theme}
          slidesCount={carouselData.slides.length}
          activeSlideIndex={carouselData.slides.findIndex(s => s.id === activeSlideId)}
          renderAIGenerator={
            <AIGenerator
              activeSlide={activeSlide}
              onUpdateSlide={updateSlide}
              carouselTheme={carouselData.theme}
              aspectRatio={brandSettings?.aspectRatio || "1:1"}
            />
          }
        />

        {/* Medium Selector Thumbnails Slider */}
        <SlidesList
          slides={carouselData.slides}
          activeSlideId={activeSlideId}
          setActiveSlideId={setActiveSlideId}
          palette={carouselData.suggestedPalette}
          onAddSlide={handleAddSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onMoveSlide={handleMoveSlide}
        />

        {/* Central Display Workspace containing canvases layouts and analytics widgets */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900/10">
          {/* Premium Library / Preset colors switcher header rail */}
          <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Tema do Carrossel:</span>
              <span className="text-xs font-extrabold text-slate-200 font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                {carouselData.theme.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-2">Presets de Cor Premium:</span>
              <select
                value={globalThemeType}
                onChange={(e) => applyPresetPremiumTemplate(e.target.value)}
                className="text-xs bg-slate-900 text-slate-200 border border-slate-800 rounded-lg p-1.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              >
                {PREMIUM_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>

              {/* Quick direct edits of global palette */}
              <div className="flex items-center gap-2.5 ml-2 pl-2 border-l border-slate-800">
                <input
                  type="color"
                  value={carouselData.suggestedPalette.background}
                  onChange={(e) => changePaletteColor('background', e.target.value)}
                  className="w-5 h-5 rounded overflow-hidden cursor-pointer bg-transparent border-0"
                  title="Cor de Fundo Global"
                />
                <input
                  type="color"
                  value={carouselData.suggestedPalette.text}
                  onChange={(e) => changePaletteColor('text', e.target.value)}
                  className="w-5 h-5 rounded overflow-hidden cursor-pointer bg-transparent border-0"
                  title="Cor de Texto Global"
                />
                <input
                  type="color"
                  value={carouselData.suggestedPalette.primary}
                  onChange={(e) => changePaletteColor('primary', e.target.value)}
                  className="w-5 h-5 rounded overflow-hidden cursor-pointer bg-transparent border-0"
                  title="Cor de Destaque Global"
                />
              </div>

              {/* Quick Font Selection Overrides */}
              <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-slate-800">
                <select
                  value={carouselData.suggestedPalette.fontHeading}
                  onChange={(e) => changePaletteFont('fontHeading', e.target.value)}
                  className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 rounded p-1"
                >
                  <option value="Inter">Sans (Inter)</option>
                  <option value="Space Grotesk">Tech (Space Grotesk)</option>
                  <option value="Playfair Display">Luxury (Playfair)</option>
                  <option value="JetBrains Mono">Code (JetBrains)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Central canvas and slide edits workspace */}
          <div className="flex-1 min-h-[400px]">
            <EditorWorkspace
              slide={activeSlide}
              palette={carouselData.suggestedPalette}
              brand={brandSettings}
              onUpdateSlide={updateSlide}
              onAIRewrite={handleAIRewrite}
              isRewriting={isRewriting}
            />
          </div>

          {/* Expandable Bottom tabs deck containing Legenda Creator and Auditing */}
          <div className="bg-slate-950 border-t border-slate-850 p-5 mt-auto space-y-6" id="analytics-panel">
            {/* Dynamic Dashboard Tab navigators */}
            <div className="flex border-b border-slate-800 max-w-sm pb-1.5 gap-2">
              <button
                onClick={() => setActiveWorkspaceTab('editor')}
                className={`flex-1 py-1 px-3 text-xs font-semibold rounded-lg text-center cursor-pointer transition ${
                  activeWorkspaceTab === 'editor'
                    ? 'bg-slate-900 text-emerald-400 border border-slate-850 font-bold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                Esboço Rápido
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('legenda')}
                className={`flex-1 py-1 px-3 text-xs font-semibold rounded-lg text-center cursor-pointer transition flex items-center justify-center gap-1.5 ${
                  activeWorkspaceTab === 'legenda'
                    ? 'bg-slate-900 text-emerald-400 border border-slate-850 font-bold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Legenda IA
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('auditor')}
                className={`flex-1 py-1 px-3 text-xs font-semibold rounded-lg text-center cursor-pointer transition flex items-center justify-center gap-1.5 ${
                  activeWorkspaceTab === 'auditor'
                    ? 'bg-slate-900 text-emerald-400 border border-slate-850 font-bold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auditar Post
              </button>
            </div>

            {/* Display active analytical workspace panels */}
            {activeWorkspaceTab === 'editor' && (
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Roteiro e Estruturação Sincronizados
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
                    Cada slide possui um layout focado em um objetivo específico. Use as guias superiores ("Legenda IA" e "Auditar Post") para fechar um pacote com os textos de mídias sociais adequados ao seu nicho.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveWorkspaceTab('legenda')}
                    className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-xl border border-emerald-500/10 transition cursor-pointer"
                  >
                    Gerar Legenda do Post
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab('auditor')}
                    className="px-4 py-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-bold rounded-xl border border-purple-500/10 transition cursor-pointer"
                  >
                    Análise do Post IA
                  </button>
                </div>
              </div>
            )}

            {activeWorkspaceTab === 'legenda' && (
              <LegendaGenerator
                theme={carouselData.theme}
                niche={brandSettings.handle}
                slides={carouselData.slides}
              />
            )}

            {activeWorkspaceTab === 'auditor' && (
              <EngagementAuditor
                theme={carouselData.theme}
                niche={brandSettings.handle}
                slides={carouselData.slides}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Presentation layer views */}
      {showPresentation && (
        <PresentationPlayer
          slides={carouselData.slides}
          palette={carouselData.suggestedPalette}
          brand={brandSettings}
          theme={carouselData.theme}
          onClose={() => setShowPresentation(false)}
        />
      )}

      {/* Sandboxed Printable elements for PDF vector conversion downloads (hidden by default) */}
      <div id="print-pdf-sandbox">
        {carouselData.slides.map((sld, i) => (
          <div
            key={sld.id}
            style={{
              backgroundColor: sld.customBackground || carouselData.suggestedPalette.background,
              color: sld.customTextColor || carouselData.suggestedPalette.text,
              fontFamily: carouselData.suggestedPalette.fontBody === "JetBrains Mono" ? "monospace" : "sans-serif"
            }}
            className="print-slide-page relative flex flex-col justify-between"
          >
            {/* Header watermark */}
            {brandSettings.showWatermark && (
              <div className="text-center font-bold tracking-widest text-[#888888] uppercase mb-10 text-lg">
                {brandSettings.handle.toUpperCase()}
              </div>
            )}

            {/* Slide message */}
            <div className="flex-1 flex flex-col justify-center text-center my-auto px-6">
              <h1
                style={{
                  fontFamily: carouselData.suggestedPalette.fontHeading === "Playfair Display" ? "serif" : "sans-serif",
                  color: sld.customTextColor || carouselData.suggestedPalette.text
                }}
                className="text-4xl font-extrabold leading-tight mb-8"
              >
                {sld.title}
              </h1>

              <div className="space-y-4 max-w-2xl mx-auto">
                {(Array.isArray(sld.content) ? sld.content : [sld.content]).map((text, idx) => (
                  <p key={idx} className="text-xl leading-relaxed text-[#555555]">
                    {text}
                  </p>
                ))}
              </div>
            </div>

            {/* Footer handles */}
            <div className="mt-10 flex items-center justify-between text-[#888888] text-base">
              <span className="font-bold">{brandSettings.handle}</span>
              {brandSettings.showSlideNumber && (
                <span>{i + 1}/{carouselData.slides.length}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
