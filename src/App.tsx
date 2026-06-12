import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Type, 
  Settings, 
  Layers, 
  Download, 
  Copy, 
  Plus, 
  Trash2, 
  Eye, 
  Code, 
  Palette, 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Check, 
  ExternalLink,
  Printer,
  ChevronRight,
  Info
} from 'lucide-react';
import { generateQRMatrix, QRData } from './utils/qrGenerator';
import { generateScadCode, TextLine, ScadParams } from './utils/scadGenerator';
import ThreePreview from './components/ThreePreview';

// Preset colors corresponding to standard PLA filaments
const PLA_COLORS = [
  { name: 'Branco Puro', hex: '#f8fafc' },
  { name: 'Preto Matte', hex: '#18181b' },
  { name: 'Vermelho Fogo', hex: '#dc2626' },
  { name: 'Azul Cobalto', hex: '#1d4ed8' },
  { name: 'Ouro Seda', hex: '#d97706' },
  { name: 'Verde Bambu', hex: '#15803d' },
  { name: 'Laranja Neon', hex: '#ea580c' },
  { name: 'Cinza Espacial', hex: '#4b5563' },
];

export interface FontOption {
  name: string;
  value: string;
  family: string;
}

// 52 beautiful premium fonts
const AVAILABLE_FONTS: FontOption[] = [
  // --- MODERN SANS-SERIF ---
  { name: 'Inter (Padrão)', value: 'Inter:style=Bold', family: 'Inter' },
  { name: 'Roboto', value: 'Roboto:style=Bold', family: 'Roboto' },
  { name: 'Montserrat', value: 'Montserrat:style=Bold', family: 'Montserrat' },
  { name: 'Poppins', value: 'Poppins:style=Bold', family: 'Poppins' },
  { name: 'Lato', value: 'Lato:style=Bold', family: 'Lato' },
  { name: 'Open Sans', value: 'Open Sans:style=Bold', family: 'Open Sans' },
  { name: 'Oswald', value: 'Oswald:style=Bold', family: 'Oswald' },
  { name: 'Raleway', value: 'Raleway:style=Bold', family: 'Raleway' },
  { name: 'Ubuntu', value: 'Ubuntu:style=Bold', family: 'Ubuntu' },
  { name: 'Nunito', value: 'Nunito:style=Bold', family: 'Nunito' },
  { name: 'Josefin Sans', value: 'Josefin Sans:style=Bold', family: 'Josefin Sans' },
  { name: 'Quicksand', value: 'Quicksand:style=Bold', family: 'Quicksand' },
  { name: 'Comfortaa', value: 'Comfortaa:style=Bold', family: 'Comfortaa' },
  { name: 'Kanit', value: 'Kanit:style=Bold', family: 'Kanit' },
  { name: 'Signika', value: 'Signika:style=Bold', family: 'Signika' },
  { name: 'Exo 2', value: 'Exo 2:style=Bold', family: 'Exo 2' },
  { name: 'Roboto Condensed', value: 'Roboto Condensed:style=Bold', family: 'Roboto Condensed' },

  // --- ELEGANT SERIF & CLASSICS ---
  { name: 'Georgia', value: 'Georgia:style=Bold', family: 'Georgia' },
  { name: 'Playfair Display', value: 'Playfair Display:style=Bold', family: 'Playfair Display' },
  { name: 'Merriweather', value: 'Merriweather:style=Bold', family: 'Merriweather' },
  { name: 'Lora', value: 'Lora:style=Bold', family: 'Lora' },
  { name: 'PT Serif', value: 'PT Serif:style=Bold', family: 'PT Serif' },
  { name: 'Cinzel', value: 'Cinzel:style=Bold', family: 'Cinzel' },
  { name: 'Times New Roman', value: 'Times New Roman:style=Bold', family: 'Times New Roman' },

  // --- TECHNICAL MONOSPACED & CODING ---
  { name: 'JetBrains Mono', value: 'JetBrains Mono:style=Bold', family: 'JetBrains Mono' },
  { name: 'Fira Code', value: 'Fira Code:style=Bold', family: 'Fira Code' },
  { name: 'Source Code Pro', value: 'Source Code Pro:style=Bold', family: 'Source Code Pro' },
  { name: 'Space Mono', value: 'Space Mono:style=Bold', family: 'Space Mono' },
  { name: 'Inconsolata', value: 'Inconsolata:style=Bold', family: 'Inconsolata' },
  { name: 'Roboto Mono', value: 'Roboto Mono:style=Bold', family: 'Roboto Mono' },
  { name: 'Share Tech Mono', value: 'Share Tech Mono:style=Regular', family: 'Share Tech Mono' },

  // --- HANDWRITTEN, CASUAL & CURSIVE ---
  { name: 'Caveat (Manuscrita)', value: 'Caveat:style=Bold', family: 'Caveat' },
  { name: 'Pacifico (Cursiva)', value: 'Pacifico:style=Regular', family: 'Pacifico' },
  { name: 'Dancing Script', value: 'Dancing Script:style=Bold', family: 'Dancing Script' },
  { name: 'Sacramento', value: 'Sacramento:style=Regular', family: 'Sacramento' },
  { name: 'Great Vibes', value: 'Great Vibes:style=Regular', family: 'Great Vibes' },
  { name: 'Alex Brush', value: 'Alex Brush:style=Regular', family: 'Alex Brush' },
  { name: 'Satisfy', value: 'Satisfy:style=Regular', family: 'Satisfy' },
  { name: 'Courgette', value: 'Courgette:style=Regular', family: 'Courgette' },

  // --- DISPLAY, ARTISTIC & RETRO ---
  { name: 'Impact (Super Negrito)', value: 'Impact:style=Regular', family: 'Impact' },
  { name: 'Bebas Neue', value: 'Bebas Neue:style=Regular', family: 'Bebas Neue' },
  { name: 'Anton', value: 'Anton:style=Regular', family: 'Anton' },
  { name: 'Archivo Black', value: 'Archivo Black:style=Regular', family: 'Archivo Black' },
  { name: 'Cinzel Decorative', value: 'Cinzel Decorative:style=Bold', family: 'Cinzel Decorative' },
  { name: 'Permanent Marker', value: 'Permanent Marker:style=Regular', family: 'Permanent Marker' },
  { name: 'Righteous', value: 'Righteous:style=Regular', family: 'Righteous' },
  { name: 'Acme', value: 'Acme:style=Regular', family: 'Acme' },
  { name: 'Lobster', value: 'Lobster:style=Regular', family: 'Lobster' },
  { name: 'Fredoka One', value: 'Fredoka One:style=Regular', family: 'Fredoka One' },
  { name: 'Special Elite (Retro Type)', value: 'Special Elite:style=Regular', family: 'Special Elite' },
  { name: 'Creepster (Horror/Gothic)', value: 'Creepster:style=Regular', family: 'Creepster' },
  { name: 'Press Start 2P (8-Bit)', value: 'Press Start 2P:style=Regular', family: 'Press Start 2P' },
];

export default function App() {
  // --- STATE ---
  
  // Tab control: 'preview' (3D), 'guide' (printing manual)
  const [activeTab, setActiveTab] = useState<'preview' | 'guide'>('preview');

  // Ref for ThreePreview component to trigger STL download
  const threeRef = useRef<any>(null);

  // Input States
  const [qrLink, setQrLink] = useState('https://makerworld.com');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const reliefType = 'alto'; // Forced to 'alto' per user request (Removed Baixo-Relevo option)
  const [useLibraryQr, setUseLibraryQr] = useState(false); // Default to false (Self-contained) for MakerWorld compatibility
  
  // Custom Wi-Fi states for easy and functional configuration
  const [qrMode, setQrMode] = useState<'text' | 'wifi'>('text');
  const [wifiSsid, setWifiSsid] = useState('MinhaRedeExemplo');
  const [wifiPassword, setWifiPassword] = useState('SenhaSecreta');
  const [wifiSecurity, setWifiSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  
  // Dimensional States (mm)
  const [plateWidth, setPlateWidth] = useState(80);
  const [plateHeight, setPlateHeight] = useState(110);
  const [plateThickness, setPlateThickness] = useState(3.0);
  const [cornerRadius, setCornerRadius] = useState(4);
  const [hasBorder, setHasBorder] = useState(true);
  const [borderWidth, setBorderWidth] = useState(2.0);
  const [borderDepth, setBorderDepth] = useState(1.0);

  // QR Settings
  const [qrSizeMm, setQrSizeMm] = useState(45);
  const [qrYOffset, setQrYOffset] = useState(20);
  const [qrReliefDepth, setQrReliefDepth] = useState(1.2);

  // Text Settings
  const [fontName, setFontName] = useState('Inter:style=Bold');
  const [textReliefDepth, setTextReliefDepth] = useState(1.2);
  const [textLines, setTextLines] = useState<TextLine[]>([
    { text: 'Texto Personalizado 1', fontSize: 6.0, yOffset: -18 },
    { text: 'Texto Personalizado 2', fontSize: 5.0, yOffset: -27 },
    { text: 'Texto Personalizado 3', fontSize: 4.5, yOffset: -35 },
  ]);

  // Color selection (visual only, for the 3D preview)
  const [colorBase, setColorBase] = useState('#f8fafc'); // Default: White Base
  const [colorDetails, setColorDetails] = useState('#18181b'); // Default: Black Text/QR

  // Derived QR Matrix Data
  const [qrData, setQrData] = useState<QRData>(() => generateQRMatrix('https://makerworld.com', 'M'));

  // UI States
  const [copied, setCopied] = useState(false);
  const [presets, setPresets] = useState<string[]>([]);

  // Update QR Matrix whenever qrLink or errorCorrection changes
  useEffect(() => {
    const data = generateQRMatrix(qrLink, errorCorrection);
    setQrData(data);
  }, [qrLink, errorCorrection]);

  // Helper dynamic presets
  const applyPreset = (type: 'wifi' | 'id' | 'social') => {
    if (type === 'wifi') {
      setQrMode('wifi');
      setWifiSsid('MinhaRedeExemplo');
      setWifiPassword('SenhaSecreta');
      setWifiSecurity('WPA');
      setQrLink('WIFI:S:MinhaRedeExemplo;T:WPA;P:SenhaSecreta;;');
      setPlateWidth(90);
      setPlateHeight(105);
      setPlateThickness(2.6);
      setQrSizeMm(48);
      setQrYOffset(18);
      setTextLines([
        { text: 'CONECTAR AO WI-FI', fontSize: 6.5, yOffset: -16 },
        { text: 'REDE: MinhaRedeExemplo', fontSize: 4.5, yOffset: -25 },
        { text: 'Aponte a câmera para conectar', fontSize: 3.5, yOffset: -33 },
      ]);
    } else if (type === 'id') {
      setQrMode('text');
      setQrLink('https://makerworld.com/pt/u/luchesioficial');
      setPlateWidth(75);
      setPlateHeight(115);
      setPlateThickness(3.0);
      setQrSizeMm(45);
      setQrYOffset(25);
      setTextLines([
        { text: 'MAKERWORLD PERFIL', fontSize: 6.0, yOffset: -10 },
        { text: 'MODELOS EXCLUSIVOS 3D', fontSize: 4.5, yOffset: -18 },
        { text: 'SIGA E APOIE !', fontSize: 4.0, yOffset: -26 },
      ]);
    } else if (type === 'social') {
      setQrMode('text');
      setQrLink('https://instagram.com/seu_usuario');
      setPlateWidth(80);
      setPlateHeight(100);
      setPlateThickness(2.8);
      setQrSizeMm(42);
      setQrYOffset(18);
      setTextLines([
        { text: 'COMO IMPRIMIR 3D', fontSize: 6.0, yOffset: -15 },
        { text: 'Visite nossa página e mande DM', fontSize: 4.0, yOffset: -23 },
      ]);
    }
  };

  // Special synchronized handlers for easy Wi-Fi building
  const handleWifiSsidChange = (ssid: string) => {
    setWifiSsid(ssid);
    setQrLink(`WIFI:S:${ssid};T:${wifiSecurity};P:${wifiPassword};;`);
    
    // Automatically update the plate text line starting with 'REDE:' to keep it synced
    setTextLines(prev => prev.map(line => {
      if (line.text.toUpperCase().includes('REDE:')) {
        return { ...line, text: `REDE: ${ssid}` };
      }
      return line;
    }));
  };

  const handleWifiPasswordChange = (password: string) => {
    setWifiPassword(password);
    setQrLink(`WIFI:S:${wifiSsid};T:${wifiSecurity};P:${password};;`);
  };

  const handleWifiSecurityChange = (security: 'WPA' | 'WEP' | 'nopass') => {
    setWifiSecurity(security);
    if (security === 'nopass') {
      setQrLink(`WIFI:S:${wifiSsid};T:nopass;P:;;`);
    } else {
      setQrLink(`WIFI:S:${wifiSsid};T:${security};P:${wifiPassword};;`);
    }
  };

  // Dynamic SCAD compilation string
  const scadCode = generateScadCode({
    qrLink,
    qrData,
    reliefType,
    plateWidth,
    plateHeight,
    plateThickness,
    cornerRadius,
    qrSizeMm,
    qrReliefDepth,
    qrYOffset,
    textReliefDepth,
    fontName,
    textLines,
    hasBorder,
    borderWidth,
    borderDepth,
    colorBase,
    colorDetails,
    useLibraryQr,
  });

  // Action methods
  const handleCopyCode = () => {
    navigator.clipboard.writeText(scadCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadScad = () => {
    const blob = new Blob([scadCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placa_personalizada_qr.scad`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Text List manipulation
  const handleTextChange = (index: number, val: string) => {
    const updated = [...textLines];
    updated[index].text = val;
    setTextLines(updated);
  };

  const handleFontSizeChange = (index: number, size: number) => {
    const updated = [...textLines];
    updated[index].fontSize = Number(size);
    setTextLines(updated);
  };

  const handleYOffsetChange = (index: number, y: number) => {
    const updated = [...textLines];
    updated[index].yOffset = Number(y);
    setTextLines(updated);
  };

  const addTextLine = () => {
    if (textLines.length >= 6) return; // Prevent too cluttery layout
    const lastLine = textLines[textLines.length - 1];
    const newY = lastLine ? lastLine.yOffset - 9 : -15;
    setTextLines([...textLines, { text: `LINHA ${textLines.length + 1}`, fontSize: 4.5, yOffset: newY }]);
  };

  const removeTextLine = (index: number) => {
    const filtered = textLines.filter((_, i) => i !== index);
    setTextLines(filtered);
  };

  // Sub-Tab selector state for categorizing layout customization options
  const [customizerTab, setCustomizerTab] = useState<'qr' | 'texts' | 'dimensions' | 'filaments'>('qr');

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* GLOWING WORKSPACE BACKGROUND ACCENTS */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-blue-950/15 via-indigo-950/5 to-transparent pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <header className="border-b border-white/5 bg-[#0b0c10]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/10 border border-white/10 animate-pulse">
              <QrCode size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-white font-sans">
                  Maker3D <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Placas Customizáveis</span>
                </h1>
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 font-semibold uppercase tracking-wider">
                  M600 Pronta
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Gere e baixe arquivos STL customizados com QR code direto para sua impressora 3D
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: UNIFIED SMART CUSTOMIZER SIDEBAR */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* UNIFIED MULTI-TAB CONTROLLER */}
          <div className="bg-[#0f111a]/85 rounded-2xl border border-white/5 overflow-hidden shadow-2xl shadow-black/45 backdrop-blur-xl">
            
            {/* COMPACT SECURE TABS HEADER BAR */}
            <div className="grid grid-cols-4 border-b border-white/5 bg-slate-950/40 p-1">
              <button
                onClick={() => setCustomizerTab('qr')}
                className={`py-2.5 px-1 rounded-xl text-[11px] font-bold tracking-wide flex flex-col items-center gap-1.5 transition-all duration-200 ${
                  customizerTab === 'qr'
                    ? 'bg-blue-600/15 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-blue-500/30'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
                title="Link & QR Code"
              >
                <QrCode size={15} />
                <span>1. Código QR</span>
              </button>

              <button
                onClick={() => setCustomizerTab('texts')}
                className={`py-2.5 px-1 rounded-xl text-[11px] font-bold tracking-wide flex flex-col items-center gap-1.5 transition-all duration-200 ${
                  customizerTab === 'texts'
                    ? 'bg-blue-600/15 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-blue-500/30'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
                title="Mensagens"
              >
                <Type size={15} />
                <span>2. Textos</span>
              </button>

              <button
                onClick={() => setCustomizerTab('dimensions')}
                className={`py-2.5 px-1 rounded-xl text-[11px] font-bold tracking-wide flex flex-col items-center gap-1.5 transition-all duration-200 ${
                  customizerTab === 'dimensions'
                    ? 'bg-blue-600/15 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-blue-500/30'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
                title="Tamanho Geral"
              >
                <Sliders size={15} />
                <span>3. Dimensões</span>
              </button>

              <button
                onClick={() => setCustomizerTab('filaments')}
                className={`py-2.5 px-1 rounded-xl text-[11px] font-bold tracking-wide flex flex-col items-center gap-1.5 transition-all duration-200 ${
                  customizerTab === 'filaments'
                    ? 'bg-blue-600/15 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-blue-500/30'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
                title="Exibição Visual & Simulação"
              >
                <Palette size={15} />
                <span>4. Aparência</span>
              </button>
            </div>

            {/* PERSISTENT SCAN WARNING ACCROSS ALL TABS */}
            <div className="mx-5 mt-4 p-3 bg-amber-500/10 border border-amber-500/15 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
              <span className="text-sm leading-none shrink-0 mt-0.5">⚠️</span>
              <div className="space-y-0.5">
                <p className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">Aviso importante: Teste o QR Code!</p>
                <p className="text-[10px] text-amber-200/80 leading-relaxed font-sans">
                  Use a câmera do seu celular para testar a leitura do QR Code na tela antes de gastar filamento imprimindo seu modelo 3D.
                </p>
              </div>
            </div>

            {/* TAB CONTENT SPACE */}
            <div className="p-5">
              
              {/* SUB TAB: QR CODE & CONEXÃO */}
              {customizerTab === 'qr' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-1">
                    <QrCode size={16} className="text-blue-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Link & Configuração do QR</h3>
                  </div>

                  {/* QR Mode Toggle Segment */}
                  <div className="grid grid-cols-2 gap-1 bg-slate-950/50 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setQrMode('text');
                        if (qrLink.startsWith('WIFI:')) {
                          setQrLink('https://makerworld.com');
                        }
                      }}
                      className={`py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-150 ${
                        qrMode === 'text'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      🌐 Link / Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQrMode('wifi');
                        const newLink = `WIFI:S:${wifiSsid};T:${wifiSecurity};P:${wifiPassword};;`;
                        setQrLink(newLink);
                      }}
                      className={`py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-150 ${
                        qrMode === 'wifi'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      📡 Rede Wi-Fi
                    </button>
                  </div>

                  {qrMode === 'text' ? (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400">
                        Link ou Conteúdo do QR Code
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={qrLink}
                          onChange={(e) => setQrLink(e.target.value)}
                          placeholder="https://exemplo.com ou texto"
                          className="w-full bg-[#141622] border border-white/5 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-mono shadow-inner"
                          id="input-qr-link"
                        />
                        {qrLink.startsWith('http') && (
                          <span className="absolute right-3.5 top-3 text-[9px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full font-mono font-medium border border-green-500/20">
                            URL Ativa
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        💡 Dica de fatiamento: Links menores geram QR mais eficientes e fáceis de fatiar/ler.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-[#141622]/60 p-3.5 rounded-xl border border-white/5 text-xs">
                      <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                        🔑 Configuração Simplificada de Wi-Fi
                      </span>
                      
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-400">
                          Nome da Rede (SSID):
                        </label>
                        <input
                          type="text"
                          value={wifiSsid}
                          onChange={(e) => handleWifiSsidChange(e.target.value)}
                          placeholder="Ex: MinhaRedeExemplo"
                          className="w-full bg-[#0a0b10] border border-white/5 focus:border-blue-500/50 rounded-lg px-3 py-2 text-white focus:outline-none transition-all font-mono"
                          id="wifi-ssid-input"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-400">
                            Senha do Wi-Fi:
                          </label>
                          <input
                            type="text"
                            value={wifiPassword}
                            onChange={(e) => handleWifiPasswordChange(e.target.value)}
                            disabled={wifiSecurity === 'nopass'}
                            placeholder={wifiSecurity === 'nopass' ? 'Sem senha' : 'Ex: Senha123'}
                            className="w-full bg-[#0a0b10] border border-white/5 focus:border-blue-500/50 rounded-lg px-3 py-2 text-white focus:outline-none transition-all font-mono disabled:opacity-40"
                            id="wifi-password-input"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-400">
                            Segurança:
                          </label>
                          <select
                            value={wifiSecurity}
                            onChange={(e) => handleWifiSecurityChange(e.target.value as any)}
                            className="w-full bg-[#0a0b10] border border-white/5 focus:border-blue-500/50 rounded-lg px-2.5 py-2 text-white focus:outline-none transition-all cursor-pointer"
                            id="wifi-security-select"
                          >
                            <option value="WPA">WPA / WPA2 (Comum)</option>
                            <option value="WEP">WEP (Antigo)</option>
                            <option value="nopass">Sem Senha (Aberta)</option>
                          </select>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 bg-[#07070a]/40 p-2 rounded border border-white/5 font-mono leading-relaxed break-all">
                        <span className="text-slate-400 block font-bold mb-0.5">Código Técnico Gerado:</span>
                        {qrLink}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-400">
                        Correção de Erros
                      </label>
                      <select
                        value={errorCorrection}
                        onChange={(e) => setErrorCorrection(e.target.value as any)}
                        className="w-full bg-[#141622] border border-white/5 focus:border-blue-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all cursor-pointer"
                        id="select-qr-correction"
                      >
                        <option value="L">L (7% Tolerância - Rápido)</option>
                        <option value="M">M (15% Tolerância - Ideal)</option>
                        <option value="Q">Q (25% Tolerância - Forte)</option>
                        <option value="H">H (30% Tolerância - Máximo)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-400">
                        Compilação OpenSCAD
                      </label>
                      <select
                        value={useLibraryQr ? 'lib' : 'self'}
                        onChange={(e) => setUseLibraryQr(e.target.value === 'lib')}
                        className="w-full bg-[#141622] border border-white/5 focus:border-blue-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all cursor-pointer"
                        id="select-scad-mode"
                      >
                        <option value="self">Auto-Matriz (Ideal para MakerWorld)</option>
                        <option value="lib">Biblioteca Externa (qrcode.scad)</option>
                      </select>
                    </div>
                  </div>

                  {!useLibraryQr && (
                    <div className="bg-blue-500/5 p-3.5 rounded-xl border border-blue-500/10 flex gap-3 text-xs text-slate-400 mt-2">
                      <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong className="text-blue-300">Modo Auto-Matriz:</strong> Compila a matriz QR diretamente nas coordenadas do OpenSCAD, permitindo que a peça seja fatiada perfeitamente no Makerworld sem qualquer plug-in!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SUB TAB: CUSTOMIZED TEXT CHANNELS */}
              {customizerTab === 'texts' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Type size={16} className="text-blue-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Linhas de Texto</h3>
                    </div>
                    <button
                      onClick={addTextLine}
                      disabled={textLines.length >= 6}
                      className="text-[10px] px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/35 text-blue-400 rounded-lg flex items-center gap-1.5 transition-all font-semibold uppercase border border-blue-500/20 disabled:opacity-20 disabled:pointer-events-none"
                      id="btn-add-text-line"
                    >
                      <Plus size={12} />
                      <span>Adicionar Linha</span>
                    </button>
                  </div>

                  {textLines.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs bg-[#141622]/40 rounded-xl border border-white/5">
                      Nenhum texto adicionado. Clique no botão de incluir acima.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 customize-scrollbar">
                      {textLines.map((line, index) => (
                        <div 
                          key={index} 
                          className="bg-[#141622]/80 p-3 rounded-xl border border-white/5 relative group space-y-2.5 hover:border-slate-800 transition duration-150"
                          id={`text-line-item-${index}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                              Elemento #{index + 1}
                            </span>
                            <button
                              onClick={() => removeTextLine(index)}
                              className="text-slate-500 hover:text-red-400 opacity-70 hover:opacity-100 transition duration-150 p-0.5"
                              title="Remover linha"
                              id={`btn-remove-text-${index}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {/* Text Input */}
                            <input
                              type="text"
                              value={line.text}
                              onChange={(e) => handleTextChange(index, e.target.value)}
                              placeholder={`Texto da linha ${index + 1}`}
                              className="w-full bg-slate-950/60 border border-white/5 focus:border-blue-500/50 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none transition-all"
                              id={`input-text-val-${index}`}
                            />

                            <div className="grid grid-cols-2 gap-3.5">
                              {/* Scale slider */}
                              <div className="space-y-0.5">
                                <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                                  <span>Tamanho</span>
                                  <span className="font-mono text-blue-400 font-bold">{line.fontSize}mm</span>
                                </div>
                                <input
                                  type="range"
                                  min="2"
                                  max="16"
                                  step="0.5"
                                  value={line.fontSize}
                                  onChange={(e) => handleFontSizeChange(index, Number(e.target.value))}
                                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                  id={`slider-font-size-${index}`}
                                />
                              </div>

                              {/* Y coord slide */}
                              <div className="space-y-0.5">
                                <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                                  <span>Posição Y</span>
                                  <span className="font-mono text-blue-400 font-bold">{line.yOffset}mm</span>
                                </div>
                                <input
                                  type="range"
                                  min="-100"
                                  max="100"
                                  step="1"
                                  value={line.yOffset}
                                  onChange={(e) => handleYOffsetChange(index, Number(e.target.value))}
                                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                  id={`slider-font-y-${index}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FONT FAMILY SELECTION (CUSTOM LIST EXPRESSED PRETTILY) */}
                  <div className="pt-3 border-t border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          <Type size={12} className="text-blue-400" />
                          Estilo da Fonte
                        </label>
                        <select
                          value={
                            AVAILABLE_FONTS.some((f) => f.value === fontName)
                              ? fontName
                              : 'custom'
                          }
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              setFontName('Arial:style=Bold');
                            } else {
                              setFontName(e.target.value);
                            }
                          }}
                          style={{
                            fontFamily: AVAILABLE_FONTS.find((f) => f.value === fontName)?.family || 'sans-serif'
                          }}
                          className="w-full bg-[#141622] border border-white/5 focus:border-blue-500/50 rounded-xl px-2.5 py-1.8 text-xs text-white focus:outline-none transition-all cursor-pointer"
                          id="select-font-style"
                        >
                          {AVAILABLE_FONTS.map((font) => (
                            <option
                              key={font.value}
                              value={font.value}
                              style={{ fontFamily: font.family }}
                              className="bg-[#0b0c10] text-white"
                            >
                              {font.name}
                            </option>
                          ))}
                          <option value="custom" className="bg-[#0b0c10] text-white font-sans">
                            ✏️ Outra (Digitar Nome)...
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-400">
                          Espessura Texto (mm)
                        </label>
                        <input
                          type="number"
                          min="0.2"
                          max="6"
                          step="0.1"
                          value={textReliefDepth}
                          onChange={(e) => setTextReliefDepth(Math.max(0.1, Number(e.target.value)))}
                          className="w-full bg-[#141622] border border-white/5 focus:border-blue-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                          id="input-text-depth"
                        />
                      </div>
                    </div>

                    {!AVAILABLE_FONTS.some((f) => f.value === fontName) && (
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400 font-semibold">Nome Customizado no OpenSCAD:</label>
                        <input
                          type="text"
                          value={fontName}
                          onChange={(e) => setFontName(e.target.value)}
                          placeholder="Ex: Arial:style=Bold"
                          className="w-full bg-[#07070a] border border-blue-500/30 focus:border-blue-500 rounded-xl px-3 py-1.8 text-[11px] text-white focus:outline-none transition-all font-mono"
                          id="input-font-name-custom"
                        />
                        <span className="text-[9px] text-slate-500 block">Identifica a fonte que a sua instalação local do OpenSCAD utilizará.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB TAB: PHYSICAL GEOM GRID */}
              {customizerTab === 'dimensions' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-1">
                    <Sliders size={16} className="text-blue-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Medidas Externas & Espessura</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-400">
                        Largura da Placa (mm)
                      </label>
                      <input
                        type="number"
                        value={plateWidth}
                        onChange={(e) => setPlateWidth(Math.max(10, Number(e.target.value)))}
                        className="w-full bg-[#141622] border border-white/5 focus:border-blue-500/50 rounded-xl px-3 py-1.8 text-xs text-white font-mono focus:outline-none"
                        id="input-plate-width"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-400">
                        Altura da Placa (mm)
                      </label>
                      <input
                        type="number"
                        value={plateHeight}
                        onChange={(e) => setPlateHeight(Math.max(10, Number(e.target.value)))}
                        className="w-full bg-[#141622] border border-white/5 focus:border-blue-500/50 rounded-xl px-3 py-1.8 text-xs text-white font-mono focus:outline-none"
                        id="input-plate-height"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-400">
                        Base / Prato (mm)
                      </label>
                      <input
                        type="number"
                        step="0.2"
                        value={plateThickness}
                        onChange={(e) => setPlateThickness(Math.max(0.4, Number(e.target.value)))}
                        className="w-full bg-[#141622] border border-white/5 focus:border-blue-500/50 rounded-xl px-3 py-1.8 text-xs text-white font-mono focus:outline-none"
                        id="input-plate-thickness"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-400">
                        Raio dos Cantos (mm)
                      </label>
                      <input
                        type="number"
                        value={cornerRadius}
                        onChange={(e) => setCornerRadius(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-[#141622] border border-white/5 focus:border-blue-500/50 rounded-xl px-3 py-1.8 text-xs text-white font-mono focus:outline-none"
                        id="input-corner-radius"
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3.5 space-y-3.5">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Posicionamento do QR code</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-400">
                          Tamanho do QR (mm)
                        </label>
                        <input
                          type="number"
                          value={qrSizeMm}
                          onChange={(e) => setQrSizeMm(Math.max(10, Number(e.target.value)))}
                          className="w-full bg-[#141622] border border-white/5 focus:border-blue-500/50 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                          id="input-qr-size"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-400">
                          Elevação QR (mm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={qrReliefDepth}
                          onChange={(e) => setQrReliefDepth(Math.max(0.1, Number(e.target.value)))}
                          className="w-full bg-[#141622] border border-white/5 focus:border-blue-500/50 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                          id="input-qr-depth"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Deslocamento Vertical (Y)</span>
                        <span className="font-mono text-blue-400 font-bold">{qrYOffset} mm</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          step="1"
                          value={qrYOffset}
                          onChange={(e) => setQrYOffset(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          id="slider-qr-y"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FRAME INTEGRITY SETTINGS */}
                  <div className="border-t border-white/5 pt-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-semibold text-white">Moldura/Borda Externa</span>
                        <span className="text-[10px] text-slate-400">Adiciona uma borda elevada para acabamento</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasBorder}
                        onChange={(e) => setHasBorder(e.target.checked)}
                        className="w-4.5 h-4.5 bg-[#141622] border border-white/5 text-blue-500 rounded cursor-pointer accent-blue-500 focus:ring-0"
                        id="checkbox-has-border"
                      />
                    </div>

                    {hasBorder && (
                      <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase font-bold text-slate-400">
                            Largura Borda (mm)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={borderWidth}
                            onChange={(e) => setBorderWidth(Math.max(0.1, Number(e.target.value)))}
                            className="w-full bg-[#141622] border border-white/5 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                            id="input-border-width"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase font-bold text-slate-400">
                            Espessura Borda (mm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={borderDepth}
                            onChange={(e) => setBorderDepth(Math.max(0.1, Number(e.target.value)))}
                            className="w-full bg-[#141622] border border-white/5 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                            id="input-border-depth"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB TAB: FILAMENT CHROME & PALETTE */}
              {customizerTab === 'filaments' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-1">
                    <Palette size={16} className="text-blue-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Simulador de Filamento PLA</h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Personalize as cores mostradas no visualizador 3D para combinar exatamente com as bobinas de filamento que você colocará na sua impressora.
                  </p>

                  <div className="space-y-4 bg-[#141622]/60 p-4 rounded-xl border border-white/5">
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Filamento Base (Fundo da placa):</span>
                      <div className="grid grid-cols-4 gap-2">
                        {PLA_COLORS.map((col) => (
                          <button
                            key={col.hex}
                            onClick={() => setColorBase(col.hex)}
                            className={`py-2 px-1 rounded-lg border text-[10px] font-medium flex flex-col items-center gap-1.5 transition-all text-slate-300 ${
                              colorBase === col.hex 
                                ? 'bg-[#0b0c10] border-blue-500/80 text-blue-400 shadow-md shadow-blue-500/10' 
                                : 'bg-[#07070a]/50 border-transparent hover:border-slate-800'
                            }`}
                            title={col.name}
                          >
                            <span className="w-5.5 h-5.5 rounded-full border border-white/10 shadow-inner" style={{ backgroundColor: col.hex }} />
                            <span className="truncate max-w-[55px] text-[8px]">{col.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Filamento de Detalhes (QR & Textos):</span>
                      <div className="grid grid-cols-4 gap-2">
                        {PLA_COLORS.map((col) => (
                          <button
                            key={col.hex}
                            onClick={() => setColorDetails(col.hex)}
                            className={`py-2 px-1 rounded-lg border text-[10px] font-medium flex flex-col items-center gap-1.5 transition-all text-slate-300 ${
                              colorDetails === col.hex 
                                ? 'bg-[#0b0c10] border-blue-500/80 text-blue-400 shadow-md shadow-blue-500/10' 
                                : 'bg-[#07070a]/50 border-transparent hover:border-slate-800'
                            }`}
                            title={col.name}
                          >
                            <span className="w-5.5 h-5.5 rounded-full border border-white/10 shadow-inner" style={{ backgroundColor: col.hex }} />
                            <span className="truncate max-w-[55px] text-[8px]">{col.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[11px] text-slate-400 leading-normal">
                    💡 <strong className="text-indigo-300">Dica:</strong> Para que o celular leia o código sem dificuldades de foco, prefira cores com contraste severo. Bases brancas, amarelas ou cinza-claro funcionam melhor com detalhes em preto, azul-marinho ou vermelho-escuro.
                  </div>
                </div>
              )}

            </div>
          </div>


          
        </div>

        {/* RIGHT COLUMN: RENDERER VIEWPORT & USER GUIDE */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* TAB HEADERS FOR VIEWPANEL */}
          <div className="bg-[#0f111a]/85 rounded-2xl border border-white/5 overflow-hidden shadow-2xl flex flex-col flex-grow backdrop-blur-xl">
            <div className="flex bg-slate-950/40 border-b border-white/5 justify-between items-center px-4 relative">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4.5 py-4 text-xs font-bold tracking-wider uppercase flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'preview'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                  id="tab-btn-preview"
                >
                  <Eye size={14} />
                  <span>Editor 3D</span>
                </button>

                <button
                  onClick={() => setActiveTab('guide')}
                  className={`px-4.5 py-4 text-xs font-bold tracking-wider uppercase flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'guide'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                  id="tab-btn-guide"
                >
                  <Printer size={14} />
                  <span>Manual Slicer</span>
                </button>
              </div>

              <div className="flex items-center gap-2 py-2 sm:py-0">
                <button
                  onClick={() => threeRef.current?.downloadSTL()}
                  className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-white px-4 py-2 rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-indigo-500/10 border border-white/5 hover:border-white/10"
                  id="btn-download-stl-header"
                >
                  <Download size={13} className="animate-bounce-slow" />
                  <span>Download .STL</span>
                </button>
              </div>
            </div>

            {/* TAB CONTAINER CONTENT */}
            <div className="p-4 flex-grow bg-slate-950/20">
              
              {activeTab === 'preview' && (
                <div className="space-y-4 relative">
                  
                  {/* FLOATING CAMERA CONTROL OVERLAY & REAL-TIME DIMENSIONAL BOX */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                    <div className="bg-[#121422]/90 backdrop-blur-md rounded-xl border border-white/5 px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">Gabarito:</span>
                        <span className="font-mono text-white font-bold">{plateWidth}x{plateHeight}x{plateThickness}mm</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Bordas: {hasBorder ? `${borderWidth}mm` : 'N/A'}</span>
                    </div>

                    <div className="bg-[#121422]/90 backdrop-blur-md rounded-xl border border-white/5 px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">Troca de Cor:</span>
                        <span className="font-mono text-indigo-400 font-bold">{plateThickness} mm</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Adicione um pause no slicer</span>
                    </div>
                  </div>

                  {/* THREE PREVIEW MODULE */}
                  <div className="relative border border-white/5 rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a0c12] to-[#121420] shadow-inner">
                    <ThreePreview
                      ref={threeRef}
                      plateWidth={plateWidth}
                      plateHeight={plateHeight}
                      plateThickness={plateThickness}
                      cornerRadius={cornerRadius}
                      qrData={qrData}
                      qrSizeMm={qrSizeMm}
                      qrReliefDepth={qrReliefDepth}
                      qrYOffset={qrYOffset}
                      reliefType={reliefType}
                      textReliefDepth={textReliefDepth}
                      fontName={fontName}
                      textLines={textLines}
                      hasBorder={hasBorder}
                      borderWidth={borderWidth}
                      borderDepth={borderDepth}
                      colorBase={colorBase}
                      colorDetails={colorDetails}
                    />
                  </div>

                  {/* SUMMARY INFO CARD PLACEMENT */}
                  <div className="bg-[#10121d] p-4 rounded-xl border border-white/5 flex items-start gap-3.5">
                    <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 space-y-1">
                      <p>
                        <strong className="text-white">Exploração de Modelagem:</strong> Use o botão esquerdo do mouse para girar o prato 3D, o botão direito para arrastar e a roda do mouse para dar zoom. Ative a <strong className="text-blue-400">Auto-rotação</strong> no player para analisar as sombras no relevo.
                      </p>
                      <p className="text-slate-500">
                        Os dados fornecidos simulam as propriedades físicas reais de um bico de extrusão de 0.4mm.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'guide' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* General Banner */}
                  <div className="bg-[#10121d] p-4 rounded-xl border border-white/5 flex gap-3">
                    <Printer className="text-blue-400 shrink-0 mt-0.5" size={18} />
                    <div className="text-xs text-slate-300">
                      <h4 className="font-semibold text-white text-sm mb-1">Como fatiar e imprimir em cores:</h4>
                      <p className="text-slate-400">
                        Para o QR code ser lido, a base precisa contrastar severamente com os relevos. Siga os métodos abaixo para atingir este resultado:
                      </p>
                    </div>
                  </div>

                  {/* Method 1: Single Color printer (Filament Swapping) */}
                  <div className="bg-[#10121d]/70 p-5 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/20">1</div>
                      <h4 className="font-semibold text-white text-sm">Troca manual de Filamento (Impressoras normais)</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Não é preciso possuir sistemas robóticos de multi-filamento (como o Bambu Lab AMS) para realizar impressões coloridas perfeitas. Faça o seguinte truque:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-slate-400 space-y-2">
                      <li>Use o STL exportado configurado como <strong className="text-white">Alto-Relevo</strong>.</li>
                      <li>Coloque no fatiador favorito (Cura, PrusaSlicer, OrcaSlicer, Bambu Studio).</li>
                      <li>Descubra em qual camada termina a base de <strong className="text-white">{plateThickness}mm</strong> e começam os desenhos do QR.</li>
                      <li>Clique com o botão direito na régua vertical de prévia de camadas do fatiador e escolha de acordo como <strong className="text-blue-400">"Adicionar Pausa" (Pause Layer)</strong> ou <strong className="text-blue-400">"Troca de Cor" (M600 Code)</strong>.</li>
                      <li>Quando a impressora parar na altura correta, remova a bobina clara, conecte a preta e continue o trabalho!</li>
                    </ul>
                  </div>

                  {/* Method 2: Multicolor Printer (Bambu AMS) */}
                  <div className="bg-[#10121d]/70 p-5 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/20">2</div>
                      <h4 className="font-semibold text-white text-sm">Uso automático no Bambu AMS / Prusa MMU</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Quem possui hardware de trocas automatizadas lida com fatiamentos programados limpos:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-slate-400 space-y-2">
                      <li>Importe o STL para o Bambu Studio normalmente.</li>
                      <li>Selecione a ferramenta <strong className="text-white">"Paint" (Pintura de Altura / Balde de Tinta)</strong>.</li>
                      <li>Configure a profundidade como "Height Range" ou balde para pegar apenas os últimos relevos volumétricos elevados acima de <strong className="text-white">{plateThickness}mm</strong>.</li>
                      <li>Defina a cor secundária desejada do AMS e fatiar. O fatiador apenas mudará a extrusora nos topos!</li>
                    </ul>
                  </div>


                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* FOOTER GENERAL AREA */}
      <footer className="border-t border-white/5 bg-[#07070a] py-10 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 space-y-2.5">
          <p className="text-slate-500">
            Desenvolvido exclusivamente para criadores de modelos 3D, suportando fatiamentos FDM precisos.
          </p>
          <p className="text-[10px] text-slate-600 max-w-xl mx-auto leading-relaxed">
            A conformidade de manifolds estruturais é assegurada pela união booleana de faces ortogonais no motor STL em tempo-real. Os modelos STL gerados atendem às especificações técnicas ISO/ASTM.
          </p>
        </div>
      </footer>
    </div>
  );
}

