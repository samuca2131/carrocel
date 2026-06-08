export interface SuggestedPalette {
  background: string;
  text: string;
  primary: string;
  fontHeading: string;
  fontBody: string;
}

export interface Slide {
  id: string;
  type: 'cover' | 'content' | 'checklist' | 'quote' | 'cta';
  title: string;
  content: string[];
  imagePrompt?: string;
  stickerIcon?: string;
  captionText?: string;
  // Individual slide customization (overrides global palette)
  customBackground?: string;
  customTextColor?: string;
  customPrimaryColor?: string;
  imageUrl?: string;
  imageLayout?: 'background' | 'side' | 'card' | 'none';
}

export interface CarouselData {
  theme: string;
  suggestedPalette: SuggestedPalette;
  slides: Slide[];
}

export interface SlideElement {
  id: string;
  type: 'title' | 'listItem' | 'badge' | 'icon' | 'watermark' | 'avatar';
  text: string;
  fontSize: number;
  color: string;
  x: number; // offset X (relative or absolute px)
  y: number; // offset Y
  align: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
}

export interface BrandSettings {
  handle: string; // Ex: @seuprofile
  logoUrl?: string;
  profileName?: string;
  profileAvatar?: string;
  customLogoText?: string;
  aspectRatio: '1:1' | '16:9' | '9:16'; // 1:1 is square feed, 9:16 is stories/reels, 16:9 is standard landscape
  showSlideNumber: boolean;
  showWatermark: boolean;
}

export interface AICaption {
  hookLine: string;
  captionIntro: string;
  bodyBullets: string[];
  ctaSentence: string;
  bonusAction?: string;
  hashtags: string[];
}

export interface EngagementAudit {
  hookScore: number;
  readabilityScore: number;
  ctaScore: number;
  retentionScore: number;
  overallScore: number;
  auditDetails: {
    strongPoints: string[];
    weakPoints: string[];
    designRecommendation: string;
    estimatedReadingTime: string;
  };
}

// Niches list
export const NICHE_OPTIONS = [
  "Marketing Digital",
  "Tráfego Pago",
  "Afiliados",
  "E-commerce",
  "Dropshipping",
  "Negócios Locais",
  "Restaurantes & Delivery",
  "Imobiliária",
  "Advocacia",
  "Contabilidade",
  "Medicina & Saúde",
  "Odontologia",
  "Psicologia",
  "Fitness & Academia",
  "Estética & Beleza",
  "Moda & Acessórios",
  "Turismo & Viagens",
  "Tecnologia",
  "Educação & Infoprodutos",
  "Coaching & Liderança",
  "Finanças & Investimentos",
  "Criptomoedas",
  "Desenvolvimento Pessoal",
  "Motivação"
];

// Content Objectives List
export const OBJECTIVE_OPTIONS = [
  { value: "Conversão & Vendas", label: "Vendas Diretas / Conversão" },
  { value: "Captação de Leads", label: "Captação de Contatos (Leads)" },
  { value: "Autoridade", label: "Posicionamento / Autoridade" },
  { value: "Educativo", label: "Educativo / Tutorial passo-a-passo" },
  { value: "Storytelling", label: "Storytelling / Narrativa emocional" },
  { value: "Motivacional", label: "Inspiracional / Viral / Motivacional" },
  { value: "Lançamento", label: "Antecipação de Lançamento" },
  { value: "Institucional", label: "Institucional / Apresentação de Serviços" }
];

// Standard Custom Visual templates
export interface PremiumTemplate {
  id: string;
  name: string;
  description: string;
  palette: SuggestedPalette;
  themeType: 'emerald' | 'slate' | 'cyberpunk' | 'luxury' | 'coral' | 'ocean' | 'neon-purple';
}

export const PREMIUM_TEMPLATES: PremiumTemplate[] = [
  {
    id: "emerald-luxury",
    name: "Verde Esmeralda Premium",
    description: "Visual luxuoso com fundos escuros profundos e detalhes dourados/esmeralda.",
    palette: {
      background: "#061A13",
      text: "#F0FDF4",
      primary: "#10B981",
      fontHeading: "Playfair Display",
      fontBody: "Inter"
    },
    themeType: 'emerald'
  },
  {
    id: "slate-minimal",
    name: "Slate Minimalista (Notion Style)",
    description: "Estilo limpo, moderno, focado em facilidade de leitura e alto contraste.",
    palette: {
      background: "#FAFAFA",
      text: "#0F172A",
      primary: "#E2E8F0",
      fontHeading: "Space Grotesk",
      fontBody: "Inter"
    },
    themeType: 'slate'
  },
  {
    id: "neon-cyber",
    name: "Cyberpunk Digital",
    description: "Visual de tecnologia com cores neon tóxicas contrastando em preto puro.",
    palette: {
      background: "#020205",
      text: "#FFFFFF",
      primary: "#06B6D4",
      fontHeading: "JetBrains Mono",
      fontBody: "JetBrains Mono"
    },
    themeType: 'cyberpunk'
  },
  {
    id: "chic-editorial",
    name: "Editorial Marfim Chic",
    description: "Estilo sofisticado e aristocrático de revistas, tons pastéis elegantes.",
    palette: {
      background: "#FDFBF7",
      text: "#292524",
      primary: "#D4AF37",
      fontHeading: "Playfair Display",
      fontBody: "Inter"
    },
    themeType: 'luxury'
  },
  {
    id: "coral-impact",
    name: "Coral Marketing Dinâmico",
    description: "Cores amigáveis e vibrantes de vendas e copywriting moderno.",
    palette: {
      background: "#0F172A",
      text: "#FFFFFF",
      primary: "#FF6B6B",
      fontHeading: "Space Grotesk",
      fontBody: "Inter"
    },
    themeType: 'coral'
  },
  {
    id: "ocean-flow",
    name: "Profissional Blue",
    description: "Estudo corporativo ideal para LinkedIn e assessoria financeira.",
    palette: {
      background: "#0B192C",
      text: "#ECEFF1",
      primary: "#1A80E6",
      fontHeading: "Inter",
      fontBody: "Inter"
    },
    themeType: 'ocean'
  },
  {
    id: "neon-vibes",
    name: "TokTok Neon Roxo",
    description: "Fundo ultra roxo escuro com tons de rosa chiclete e violeta néon.",
    palette: {
      background: "#120325",
      text: "#FDF8FF",
      primary: "#E413FA",
      fontHeading: "Space Grotesk",
      fontBody: "Inter"
    },
    themeType: 'neon-purple'
  }
];
