import { useState, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, X, Volume2, VolumeX, Download, Sparkles, Monitor } from "lucide-react";
import { Slide, SuggestedPalette, BrandSettings } from "../types";
import { drawSlideToCanvas } from "../utils/canvasExporter";

interface PresentationPlayerProps {
  slides: Slide[];
  palette: SuggestedPalette;
  brand: BrandSettings;
  theme: string;
  onClose: () => void;
}

export default function PresentationPlayer({ slides, palette, brand, theme, onClose }: PresentationPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalSec, setIntervalSec] = useState(4);
  const [soundOn, setSoundOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  // Web Audio Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const synthIntervalRef = useRef<any | null>(null);

  // Timers
  const playTimerRef = useRef<any | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, intervalSec * 1000);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, intervalSec, slides.length]);

  // Audio Synthesizer Loop
  useEffect(() => {
    if (soundOn) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Custom synthesizer instrument
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        // Chill synth triangle wave
        osc.type = "triangle";
        filter.type = "lowpass";
        filter.frequency.value = 600;

        gain.gain.value = 0.05; // soft hum volume

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;

        osc.start();

        // Harmonious chord progressions (Major 7th hums)
        const chords = [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [349.23, 440.00, 523.25, 659.25], // Fmaj7
          [293.66, 349.23, 440.00, 587.33], // Dm7
          [392.00, 493.88, 587.33, 739.99], // Gmaj7
        ];

        let chordIdx = 0;
        synthIntervalRef.current = setInterval(() => {
          if (oscillatorRef.current && ctx.state === "running") {
            // Pick note and play
            const chord = chords[chordIdx];
            const baseNote = chord[Math.floor(Math.random() * chord.length)];
            oscillatorRef.current.frequency.setValueAtTime(baseNote, ctx.currentTime);
            chordIdx = (chordIdx + 1) % chords.length;
          }
        }, 1200);

      } catch (err) {
        console.error("Audio Context not supported in this iframe:", err);
      }
    } else {
      stopSynthesizer();
    }

    return () => {
      stopSynthesizer();
    };
  }, [soundOn]);

  const stopSynthesizer = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (err) {}
      oscillatorRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  /**
   * Powerful browser-side slide recording capture to generate full MP4/WebM presentations
   */
  const handleRecordVideo = async () => {
    setRecording(true);
    setRecordingProgress(0);
    setIsPlaying(false);
    
    try {
      const recordedChunks: Blob[] = [];
      const recordCanvas = document.createElement("canvas");
      const recordCtx = recordCanvas.getContext("2d");
      
      const width = 1080;
      const height = brand.aspectRatio === "9:16" ? 1920 : (brand.aspectRatio === "16:9" ? 608 : 1080);
      recordCanvas.width = width;
      recordCanvas.height = height;

      // Select capture fps
      const stream = recordCanvas.captureStream(24); // 24 FPS stream
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `carrossel-viral-slide-${theme.replace(/\s+/g, '-').toLowerCase() || 'post'}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setRecording(false);
      };

      mediaRecorder.start();

      // Sequentially draw each slide onto canvas and capture
      for (let i = 0; i < slides.length; i++) {
        setRecordingProgress(Math.round(((i + 1) / slides.length) * 100));
        
        const tempCanvas = await drawSlideToCanvas(slides[i], i, slides.length, palette, brand);
        if (recordCtx) {
          recordCtx.drawImage(tempCanvas, 0, 0);
        }

        // Wait to record frames
        await new Promise((r) => setTimeout(r, 2000));
      }

      mediaRecorder.stop();
    } catch (err) {
      console.error("Recording not supported or failed:", err);
      alert("Seu navegador não oferece suporte para gravação de canvas de mídia.");
      setRecording(false);
    }
  };

  const activeSlide = slides[activeIndex];
  const slideBg = activeSlide?.customBackground || palette.background;
  const slideText = activeSlide?.customTextColor || palette.text;
  const slideAccent = activeSlide?.customPrimaryColor || palette.primary;

  const fontHeadingMap = {
    "Inter": "font-sans",
    "Space Grotesk": "font-sans tracking-tight",
    "Playfair Display": "font-serif",
    "JetBrains Mono": "font-mono"
  };

  const fontBodyMap = {
    "Inter": "font-sans",
    "JetBrains Mono": "font-mono"
  };

  const textHeadingFont = fontHeadingMap[palette.fontHeading as keyof typeof fontHeadingMap] || "font-sans";
  const textBodyFont = fontBodyMap[palette.fontBody as keyof typeof fontBodyMap] || "font-sans";

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6" id="presentation-player-overlay">
      {/* Top action header controls */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
            Modo Apresentação Vídeo
            {recording && (
              <span className="text-[10px] bg-red-500 text-slate-950 rounded-lg px-2 py-0.5 font-bold animate-pulse">
                GRAVANDO VÍDEO ({recordingProgress}%)
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound Synthesizer toggler */}
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`p-2 rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold ${
              soundOn
                ? "bg-emerald-500 text-slate-950 border-emerald-500"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-100"
            }`}
            title="Sintetizar Música de Loop Chill"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {soundOn ? "Música ON" : "Música OFF"}
          </button>

          {/* Record Video trigger */}
          <button
            onClick={handleRecordVideo}
            disabled={recording}
            className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold transition ${
              recording
                ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
            }`}
            title="Renderizar e Gravar como Vídeo MP4/WebM"
          >
            <Download className="w-4 h-4" />
            Exportar Vídeo
          </button>

          <button
            onClick={() => {
              stopSynthesizer();
              onClose();
            }}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-xl transition border border-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Central Presentation Area */}
      <div className="flex-1 w-full max-w-4xl flex items-center justify-center relative">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          disabled={recording}
          className="absolute left-0 p-3 bg-slate-900/60 hover:bg-slate-900 text-slate-100 hover:text-emerald-400 rounded-full transition border border-slate-800 cursor-pointer z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Visual Card viewport */}
        <div
          style={{ backgroundColor: slideBg }}
          className={`w-full ${
            brand.aspectRatio === "9:16" ? "aspect-[9/16] max-h-[70vh] lg:max-h-[80vh] w-auto" : "aspect-square max-h-[70vh] lg:max-h-[80vh] w-auto"
          } rounded-3xl shadow-2xl p-12 flex flex-col justify-between tracking-wide relative overflow-hidden select-none border border-white/5`}
        >
          {/* Cover glow decorator */}
          {activeSlide?.type === "cover" && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-white to-transparent" />
          )}

          {/* Grid Background Pattern mock details */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Watermark brand details */}
          {brand.showWatermark && (
            <div style={{ color: slideText + "B3" }} className="text-center space-y-1">
              <p className="text-[13px] font-bold tracking-widest font-sans uppercase">
                {brand.handle.toUpperCase()}
              </p>
              <div className="h-0.5 w-24 bg-current opacity-20 mx-auto" />
            </div>
          )}

          {/* Slides items container layouts depending on style */}
          <div className="flex-1 flex flex-col justify-center py-6" id="presentation-item-renderer">
            {activeSlide?.type === "cover" ? (
              <div className="text-center space-y-8">
                <span style={{ color: slideAccent }} className="text-xs font-extrabold uppercase tracking-widest font-mono">
                  SÉRIE DE CONTEÚDO
                </span>
                <h1 style={{ color: slideText, fontFamily: textHeadingFont }} className="text-3xl lg:text-4xl font-extrabold leading-tight">
                  {activeSlide.title}
                </h1>
                <p style={{ color: slideText + "B3", fontFamily: textBodyFont }} className="text-base">
                  {Array.isArray(activeSlide.content) ? activeSlide.content.join(" ") : activeSlide.content}
                </p>
              </div>
            ) : activeSlide?.type === "quote" ? (
              <div className="text-center space-y-4">
                <span style={{ color: slideAccent }} className="text-7xl font-serif block select-none leading-none">“</span>
                <p style={{ color: slideText, fontFamily: textHeadingFont }} className="text-xl italic font-medium leading-relaxed">
                  {activeSlide.title}
                </p>
                <p style={{ color: slideAccent, fontFamily: textBodyFont }} className="text-xs font-mono tracking-wider font-bold">
                  — {Array.isArray(activeSlide.content) ? activeSlide.content.join(" ") : activeSlide.content}
                </p>
              </div>
            ) : activeSlide?.type === "checklist" ? (
              <div className="space-y-6">
                <h2 style={{ color: slideText, fontFamily: textHeadingFont }} className="text-2xl font-black">
                  {activeSlide.title}
                </h2>
                <div className="space-y-3">
                  {(Array.isArray(activeSlide.content) ? activeSlide.content : [activeSlide.content]).map((item, id) => (
                    <div key={id} className="flex gap-3 text-sm">
                      <span style={{ backgroundColor: slideAccent }} className="w-5 h-5 rounded-full flex items-center justify-center text-slate-950 font-bold p-0.5 flex-shrink-0">✓</span>
                      <span style={{ color: slideText + "E6", fontFamily: textBodyFont }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeSlide?.type === "cta" ? (
              <div className="text-center space-y-8">
                <h2 style={{ color: slideText, fontFamily: textHeadingFont }} className="text-3xl font-black uppercase">
                  {activeSlide.title}
                </h2>
                <div className="space-y-3">
                  {(Array.isArray(activeSlide.content) ? activeSlide.content : [activeSlide.content]).map((p, id) => (
                    <p key={id} style={{ color: slideText + "B3", fontFamily: textBodyFont }} className="text-base font-semibold leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
                <div style={{ backgroundColor: slideAccent }} className="px-6 py-3 rounded-2xl inline-block max-w-[280px] font-black text-slate-950 text-xs shadow-lg uppercase tracking-widest animate-bounce">
                  {activeSlide.captionText || "Salvar para ler depois"}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 style={{ color: slideText, fontFamily: textHeadingFont }} className="text-2xl font-black">
                  {activeSlide?.title}
                </h2>
                <div className="space-y-3">
                  {(Array.isArray(activeSlide?.content) ? activeSlide.content : [activeSlide?.content || '']).map((p, id) => (
                    <p key={id} style={{ color: slideText + "CC", fontFamily: textBodyFont }} className="text-sm font-light leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer handle bar watermark brand */}
          <div className="flex items-center justify-between mt-auto">
            <span style={{ color: slideText + "B3" }} className="text-xs font-semibold font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: slideAccent }} />
              {brand.handle}
            </span>
            <span style={{ color: slideText + "99" }} className="text-xs font-bold font-mono">
              SLIDE {activeIndex + 1}/{slides.length}
            </span>
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={recording}
          className="absolute right-0 p-3 bg-slate-900/60 hover:bg-slate-900 text-slate-100 hover:text-emerald-400 rounded-full transition border border-slate-800 cursor-pointer z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom slide player controller controls bar */}
      <div className="w-full max-w-lg mt-6 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={recording}
            className={`p-3 rounded-full flex items-center justify-center transition cursor-pointer ${
              isPlaying ? "bg-amber-500 text-slate-950" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <div className="text-left">
            <span className="block text-[8px] uppercase font-bold tracking-widest text-slate-500">Auto Play</span>
            <span className="text-xs font-bold text-slate-200">
              {isPlaying ? `Avançando a cada ${intervalSec}s` : "Pausado"}
            </span>
          </div>
        </div>

        {/* Transition Interval Timer selector slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Timer:</span>
          <input
            type="range"
            min={2}
            max={12}
            step={1}
            value={intervalSec}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
            className="w-24 accent-emerald-500 bg-slate-950 h-1 rounded-lg cursor-pointer"
            title="Ajustar tempo de transição"
          />
          <span className="text-xs font-bold text-slate-300 font-mono">{intervalSec}s</span>
        </div>
      </div>
    </div>
  );
}
