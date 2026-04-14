'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  MessageSquare, 
  Store, 
  ShieldCheck, 
  Globe, 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Zap,
  Smartphone,
  Info
} from 'lucide-react'
import { useLang } from '../components/LanguageProvider'
import { DICTIONARY } from '../lib/dictionaries'
import { C } from '../lib/theme'
import AnimatedSection from '../components/AnimatedSection'

// ─── DATOS DE LA DEMO INTERACTIVA ─────────────────────────────────────────────
const DEMO_TABS = [
  {
    icon: '🥖',
    labelKey: 'tabPanetteria',
    store: 'Panetteria Rossi',
    products: [
      { name: 'Pane casereccio',    price: '2.50',  img: 'https://loremflickr.com/300/300/bread,rustic?lock=1'     },
      { name: 'Cornetti freschi',   price: '1.20',  img: 'https://loremflickr.com/300/300/croissant,pastry?lock=2' },
      { name: 'Torta della nonna',  price: '14.00', img: 'https://loremflickr.com/300/300/cake,italian?lock=3'     },
      { name: 'Focaccia rosmarino', price: '3.50',  img: 'https://loremflickr.com/300/300/focaccia,bread?lock=4'   },
    ],
  },
  {
    icon: '🍊',
    labelKey: 'tabFruttivendolo',
    store: "Frutta e Verdura da Mario",
    products: [
      { name: 'Fragole biologiche', price: '3.90', img: 'https://loremflickr.com/300/300/strawberry,fresh?lock=5'  },
      { name: 'Arance di Sicilia',  price: '2.00', img: 'https://loremflickr.com/300/300/orange,citrus?lock=6'     },
      { name: 'Insalata mista',     price: '1.50', img: 'https://loremflickr.com/300/300/salad,vegetables?lock=7'  },
      { name: 'Pomodori datterini', price: '2.80', img: 'https://loremflickr.com/300/300/tomato,cherry?lock=8'     },
    ],
  },
  {
    icon: '☕',
    labelKey: 'tabBar',
    store: 'Bar Centrale',
    products: [
      { name: 'Caffè espresso',    price: '1.20', img: 'https://loremflickr.com/300/300/espresso,coffee?lock=9'  },
      { name: 'Cappuccino',        price: '1.50', img: 'https://loremflickr.com/300/300/cappuccino,coffee?lock=10'},
      { name: 'Tramezzino misto',  price: '2.50', img: 'https://loremflickr.com/300/300/sandwich,italian?lock=11' },
      { name: 'Succo di frutta',   price: '2.00', img: 'https://loremflickr.com/300/300/juice,fruit?lock=12'     },
    ],
  },
  {
    icon: '🏪',
    labelKey: 'tabNegozioLocale',
    store: 'Alimentari da Lucia',
    products: [
      { name: 'Olio extravergine',  price: '8.50', img: 'https://loremflickr.com/300/300/olive,oil?lock=13'      },
      { name: 'Pasta artigianale',  price: '2.20', img: 'https://loremflickr.com/300/300/pasta,italian?lock=14'  },
      { name: 'Marmellata artig.',  price: '4.90', img: 'https://loremflickr.com/300/300/jam,jar?lock=15'        },
      { name: 'Conserve (pack 3)',  price: '6.00', img: 'https://loremflickr.com/300/300/grocery,food?lock=16'   },
    ],
  },
]

export default function Home() {
  const { lang, changeLang: setLang } = useLang()
  const dict = DICTIONARY[lang]
  const [storeCount, setStoreCount] = useState(0)
  const [activeDemo, setActiveDemo] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [billing, setBilling] = useState('monthly')

  const t = (key) => dict[key] || key

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStoreCount(d.total || 0))
      .catch(() => {})

    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    { icon: <MessageSquare className="w-8 h-8 text-emerald-500" />, title: t('feat1Title'), desc: t('feat1Desc') },
    { icon: <Store className="w-8 h-8 text-emerald-500" />, title: t('feat2Title'), desc: t('feat2Desc') },
    { icon: <TrendingUp className="w-8 h-8 text-emerald-500" />, title: t('feat3Title'), desc: t('feat3Desc') },
    { icon: <Globe className="w-8 h-8 text-emerald-500" />, title: t('feat4Title'), desc: t('feat4Desc') },
    { icon: <Users className="w-8 h-8 text-emerald-500" />, title: t('feat5Title'), desc: t('feat5Desc') },
    { icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />, title: t('feat6Title'), desc: t('feat6Desc') },
  ]

  const steps = [
    { num: '1', title: t('step1Title'), time: t('step1Time'), desc: t('step1Desc'), icon: <Zap className="w-5 h-5" /> },
    { num: '2', title: t('step2Title'), time: t('step2Time'), desc: t('step2Desc'), icon: <Smartphone className="w-5 h-5" /> },
    { num: '3', title: t('step3Title'), time: t('step3Time'), desc: t('step3Desc'), icon: <ShoppingBag className="w-5 h-5" /> },
  ]

  const pricingPlans = [
    {
      key: 'free',
      name: lang === 'it' ? 'Gratuito' : 'Gratis',
      desc: lang === 'it' ? 'Prova a vendere gratis, senza limiti di tempo' : 'Prueba a vender gratis, sin límite de tiempo',
      monthly: 0,
      annual: 0,
      popular: false,
      cta: lang === 'it' ? 'Inizia gratis' : 'Empezar gratis',
      badge: null,
      highlights: [
        lang === 'it' ? '50 prodotti' : '50 productos',
        'POS ' + (lang === 'it' ? 'tattile' : 'táctil') + ' incluido',
        'Checkout WhatsApp',
        lang === 'it' ? 'Sottodominio gratuito' : 'Subdominio gratuito',
        '100 MB ' + (lang === 'it' ? 'di spazio' : 'almacenamiento'),
        'GDPR compliance',
      ],
    },
    {
      key: 'starter',
      name: lang === 'it' ? 'Starter' : 'Básico',
      desc: lang === 'it' ? 'Il tuo negozio base per iniziare a vendere' : 'Tu tienda básica para empezar a vender',
      monthly: 15,
      annual: 12,   // ≈ 20% ahorro → €144/año  (vs €180)
      popular: false,
      cta: lang === 'it' ? 'Inizia ora' : 'Empezar ahora',
      badge: null,
      highlights: [
        lang === 'it' ? '500 prodotti' : '500 productos',
        lang === 'it' ? 'Sottodominio personalizzato' : 'Subdominio personalizado',
        lang === 'it' ? 'Pagamenti Stripe / PayPal' : 'Pagos Stripe / PayPal',
        lang === 'it' ? 'Esportazione CSV' : 'Exportación CSV',
        '1 GB ' + (lang === 'it' ? 'di spazio' : 'almacenamiento'),
        lang === 'it' ? 'Supporto via email' : 'Soporte por email',
      ],
    },
    {
      key: 'pro',
      name: 'Pro',
      desc: lang === 'it' ? 'La scelta perfetta per i negozi in crescita' : 'La elección perfecta para negocios en crecimiento',
      monthly: 25,
      annual: 20,   // ≈ 20% ahorro → €240/año  (vs €300)
      popular: true,   // ← SIEMPRE DESTACADO
      cta: lang === 'it' ? 'Inizia ora' : 'Empezar ahora',
      badge: lang === 'it' ? '⭐ Più scelto' : '⭐ El más elegido',
      highlights: [
        lang === 'it' ? '5.000 prodotti' : '5.000 productos',
        lang === 'it' ? 'Rapporti finanziari avanzati' : 'Reportes financieros avanzados',
        lang === 'it' ? 'Catalogo Instagram / Facebook' : 'Catálogo Instagram / Facebook',
        lang === 'it' ? 'Codici sconto illimitati' : 'Códigos descuento ilimitados',
        '5 GB ' + (lang === 'it' ? 'di spazio' : 'almacenamiento'),
        lang === 'it' ? 'Supporto prioritario 24h' : 'Soporte prioritario 24h',
      ],
    },
    {
      key: 'grow',
      name: 'Grow',
      desc: lang === 'it' ? 'Il negozio completo per chi vuole crescere' : 'Tu tienda completa para crecer sin límites',
      monthly: 40,
      annual: 32,   // ≈ 20% ahorro → €384/año  (vs €480)
      popular: false,
      cta: lang === 'it' ? 'Contattaci' : 'Contactar',
      badge: null,
      highlights: [
        lang === 'it' ? 'Prodotti illimitati' : 'Productos ilimitados',
        lang === 'it' ? 'Recupero carrelli abbandonati' : 'Recuperación carritos abandonados',
        lang === 'it' ? 'Programma punti & Affiliati' : 'Programa de puntos y Afiliados',
        lang === 'it' ? 'Fatturazione elettronica' : 'Facturación electrónica',
        '20 GB ' + (lang === 'it' ? 'di spazio' : 'almacenamiento'),
        lang === 'it' ? 'Consulente dedicato' : 'Consultor dedicado',
      ],
    },
  ]

  const comparisonRows = [
    { label: lang === 'it' ? 'Comisione per vendita' : 'Comisión por venta',           vals: ['0%', '0%', '0%', '0%'] },
    { label: lang === 'it' ? 'Numero di prodotti' : 'Número de productos',              vals: ['50', '500', '5.000', lang === 'it' ? 'Illimitati' : 'Ilimitados'] },
    { label: 'POS ' + (lang === 'it' ? 'tattile' : 'táctil'),                           vals: [true, true, true, true] },
    { label: 'Checkout WhatsApp',                                                        vals: [true, true, true, true] },
    { label: lang === 'it' ? 'Spazio disco' : 'Almacenamiento',                         vals: ['100 MB', '1 GB', '5 GB', '20 GB'] },
    { label: lang === 'it' ? 'Subdominio personalizzato' : 'Subdominio personalizado',   vals: [false, true, true, true] },
    { label: lang === 'it' ? 'Pagamenti Stripe / PayPal' : 'Pagos Stripe / PayPal',     vals: [false, true, true, true] },
    { label: lang === 'it' ? 'Esportazione CSV / PDF' : 'Exportación CSV / PDF',        vals: [false, true, true, true] },
    { label: lang === 'it' ? 'Reporti finanziari' : 'Reportes financieros',             vals: [false, lang === 'it' ? 'Base' : 'Básicos', lang === 'it' ? 'Avanzati' : 'Avanzados', 'Premium'] },
    { label: lang === 'it' ? 'Catalogo Instagram/FB' : 'Catálogo Instagram/FB',         vals: [false, false, true, true] },
    { label: lang === 'it' ? 'Codici sconto' : 'Códigos descuento',                     vals: [false, false, true, true] },
    { label: lang === 'it' ? 'Carrelli abbandonati' : 'Carritos abandonados',            vals: [false, false, false, true] },
    { label: lang === 'it' ? 'Programma punti' : 'Programa de puntos',                  vals: [false, false, false, true] },
    { label: lang === 'it' ? 'Consulente dedicato' : 'Consultor dedicado',               vals: [false, false, false, true] },
    { label: 'Backup',                                                                   vals: [lang === 'it' ? 'Settimanale' : 'Semanal', lang === 'it' ? 'Settimanale' : 'Semanal', lang === 'it' ? 'Giornaliero' : 'Diario', lang === 'it' ? 'Giornaliero' : 'Diario'] },
    { label: lang === 'it' ? 'Supporto' : 'Soporte',                                    vals: ['Community', 'Email', lang === 'it' ? 'Prioritario' : 'Prioritario 24h', lang === 'it' ? 'Dedicato' : 'Dedicado'] },
  ]


  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
    { q: t('faq6Q'), a: t('faq6A') },
    { q: t('faq7Q'), a: t('faq7A') },
  ]

  return (
    <div className="bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-header py-2 sm:py-3' : 'bg-transparent py-3 sm:py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
          <a href="/" className="flex items-center gap-1.5 sm:gap-3 no-underline group shrink-0">
            <div className="relative overflow-hidden rounded-xl">
              <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl transition-transform group-hover:scale-110" priority />
            </div>
            <span className={`font-black text-sm sm:text-xl tracking-tighter ${isScrolled ? 'text-emerald-600' : 'text-white'}`}>
              TIENDAONLINE
            </span>
          </a>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            {['it', 'es', 'en'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${lang === l ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:text-white'}`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <a href="/login" className={`text-xs sm:text-sm font-semibold transition-colors text-center whitespace-nowrap ${isScrolled ? 'text-slate-600 hover:text-emerald-600' : 'text-emerald-50 hover:text-white'}`}>
              {t('accedi')}
            </a>
            <a href="/register" className="glow-btn bg-emerald-500 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xl shadow-emerald-500/20 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
              {t('ctaHeader')} <ArrowRight className="hidden sm:block w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-24 overflow-hidden mesh-gradient">
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="hero-glow top-[10%] left-[5%]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="hero-glow bottom-[10%] right-[10%] bg-blue-500/20" 
        />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-white text-xs font-bold tracking-wide mb-8 shadow-2xl"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            ✨ {t('heroBadge')}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8"
          >
            {t('heroTitle').split('\n').map((line, i) => (
              <span key={i} className={i === 1 ? 'text-emerald-300' : ''}>
                {line}<br/>
              </span>
            ))}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-emerald-50/80 leading-relaxed mb-12 max-w-2xl mx-auto"
          >
            {t('heroSubtitle')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <a href="/register" className="glow-btn bg-white text-emerald-900 px-10 py-5 rounded-2xl text-lg font-black shadow-2xl transition-all w-full sm:w-auto flex items-center justify-center gap-3">
              <ShoppingBag className="w-6 h-6" /> {t('heroCtaMain')}
            </a>
            <div className="flex -space-x-3 items-center">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-emerald-800 shadow-xl" alt="User" />
              ))}
              <div className="pl-6 text-emerald-100 text-sm font-bold">
                {t('heroStores').replace('{n}', storeCount)}
              </div>
            </div>
          </motion.div>

          {/* Social Proof Checkmarks */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {[t('heroCheck1'), t('heroCheck2'), t('heroCheck3')].map((check, i) => (
              <div key={i} className="flex items-center gap-2 text-emerald-100/70 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {check}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EL PROBLEMA ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {t('problemaTitle')}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📵', title: t('problema1Title'), desc: t('problema1Desc') },
              { icon: '💬', title: t('problema2Title'), desc: t('problema2Desc') },
              { icon: '💸', title: t('problema3Title'), desc: t('problema3Desc') },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.1} className="premium-shadow p-8 rounded-3xl bg-slate-50 border border-slate-100 group">
                <div className="text-5xl mb-6 transition-transform group-hover:scale-110 duration-500 transform-gpu">{item.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-sm">{item.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEMO INTERACTIVA ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-emerald-50 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
              {t('demoTitle')}
            </h2>
            <p className="text-lg text-slate-600 font-medium mb-10 leading-relaxed">
              {t('demoSubtitle')}
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {DEMO_TABS.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDemo(i)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all focus:outline-none ${activeDemo === i ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-white text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'}`}
                >
                  <span className="mr-2">{tab.icon}</span> {t(tab.labelKey)}
                </button>
              ))}
            </div>

            <div className="p-6 rounded-3xl bg-white/50 border border-emerald-100 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-emerald-900 font-black mb-2">
                <Store className="w-6 h-6" /> {DEMO_TABS[activeDemo].store}
              </div>
              <p className="text-slate-600 text-sm font-medium">
                {t('demoTabsInfo') || "Prueba la experiencia de navegación que tendrán tus clientes desde su móvil."}
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="relative flex justify-center">
            {/* Phone Mockup */}
            <div className="demo-phone w-[320px] transform-gpu transition-all duration-700 hover:rotate-2 hover:scale-105">
              <div className="demo-phone-inner h-[600px] flex flex-col bg-white">
                
                {/* Visual Header of internal store */}
                <div className="bg-emerald-600 p-5 pt-8">
                  <div className="font-black text-sm text-white mb-4">{DEMO_TABS[activeDemo].store}</div>
                  <div className="bg-white/10 rounded-xl px-3 py-2.5 text-[10px] text-emerald-50 flex items-center gap-2 border border-white/10">
                    <span className="opacity-50">🔍</span> {t('demoSearchPlaceholder')}
                  </div>
                </div>

                {/* Animated Product Grid */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeDemo}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-2 gap-3"
                    >
                      {DEMO_TABS[activeDemo].products.map((p, i) => (
                        <div key={i} className="product-card">
                          <img src={p.img} className="w-full h-24 object-cover" alt={p.name} loading="lazy" />
                          <div className="p-3">
                            <div className="text-[10px] font-bold text-slate-800 line-clamp-1 mb-1">{p.name}</div>
                            <div className="text-xs font-black text-emerald-600">€{p.price}</div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Sticky Action Button */}
                <div className="p-4 border-t border-slate-100">
                  <button className="w-full bg-[#25D366] text-white py-3 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> {t('demoOrderBtn')}
                  </button>
                </div>
              </div>

              {/* Decorative elements outside phone */}
              <div className="absolute -right-8 top-[20%] advanced-glass p-4 rounded-2xl shadow-xl animate-bounce duration-[3000ms]">
                <div className="text-xs font-black text-emerald-800">New Order! 🚀</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('howTitle')}</h2>
          </AnimatedSection>

          <div className="relative">
            {/* Progressive Line */}
            <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[3px] bg-slate-100 z-0">
              <div className="w-[66%] h-full bg-emerald-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {steps.map((step, i) => (
                <AnimatedSection key={i} delay={i * 0.1} className="text-center group">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-xl shadow-emerald-500/30 transition-transform group-hover:scale-110 group-hover:rotate-3">
                    {step.num}
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest mb-4 border border-amber-100">
                    {step.icon} {step.time}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-sm">{step.desc}</p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">{t('featuresTitle')}</h2>
            <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <AnimatedSection key={i} delay={i * 0.05} className="p-10 rounded-[40px] bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-all hover:bg-slate-800 group transform-gpu">
                <div className="mb-8 p-4 bg-slate-900 rounded-2xl inline-block group-hover:rotate-6 transition-transform">{feat.icon}</div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('pricingTitle')}</h2>
            <p className="text-lg text-slate-600 font-medium">{t('pricingSubtitle')}</p>
          </AnimatedSection>

          {/* Billing Toggle */}
          <AnimatedSection className="flex justify-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-7 py-3 rounded-xl font-black text-sm transition-all ${
                  billing === 'monthly' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'
                }`}
              >
                {lang === 'it' ? 'Mensile' : 'Mensual'}
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={`px-7 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${
                  billing === 'annual' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'
                }`}
              >
                {lang === 'it' ? 'Annuale' : 'Anual'}
                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wide">
                  -20%
                </span>
              </button>
            </div>
          </AnimatedSection>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {pricingPlans.map((plan, i) => {
              const price = billing === 'annual' ? plan.annual : plan.monthly
              const annualTotal = plan.annual * 12
              const monthlyTotal = plan.monthly * 12
              const savings = monthlyTotal - annualTotal
              const isPro = plan.popular

              return (
                <AnimatedSection key={plan.key} delay={i * 0.08}
                  className={`relative flex flex-col rounded-[32px] overflow-hidden transition-all ${
                    isPro
                      ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-500/30 scale-105 z-10'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 hover:border-emerald-300 hover:shadow-xl'
                  }`}
                >
                  {plan.badge && (
                    <div className="bg-amber-400 text-emerald-900 text-center text-[9px] font-black uppercase tracking-[2px] py-2">
                      ⭐ {plan.badge}
                    </div>
                  )}

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h3 className={`text-xl font-black mb-1 ${isPro ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                      <p className={`text-xs font-semibold leading-snug ${isPro ? 'text-emerald-100' : 'text-slate-500'}`}>{plan.desc}</p>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        {price === 0 ? (
                          <span className={`text-5xl font-black ${isPro ? 'text-white' : 'text-slate-900'}`}>
                            {lang === 'it' ? 'Gratis' : 'Gratis'}
                          </span>
                        ) : (
                          <>
                            <span className={`text-5xl font-black tracking-tighter ${isPro ? 'text-white' : 'text-slate-900'}`}>€{price}</span>
                            <span className={`text-sm font-bold ${isPro ? 'text-emerald-100' : 'text-slate-400'}`}>/mes</span>
                          </>
                        )}
                      </div>
                      {price === 0 && (
                        <div className={`mt-2 text-[11px] font-semibold ${
                          isPro ? 'text-emerald-200' : 'text-slate-400'
                        }`}>
                          {lang === 'it' ? 'Nessun costo nascosto' : lang === 'en' ? 'No hidden costs' : 'Sin ningún costo oculto'}
                        </div>
                      )}
                      {billing === 'annual' && savings > 0 && (
                        <div className={`mt-2 text-[11px] font-black ${
                          isPro ? 'text-emerald-200' : 'text-emerald-600'
                        }`}>
                          €{annualTotal}/año · {lang === 'it' ? 'Risparmi' : 'Ahorras'} €{savings}
                        </div>
                      )}
                      {billing === 'monthly' && price > 0 && (
                        <div className={`mt-2 text-[11px] font-semibold ${
                          isPro ? 'text-emerald-200' : 'text-slate-400'
                        }`}>
                          {lang === 'it' ? 'Alta gratuita' : 'Alta gratis'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3 mb-8">
                      {plan.highlights.map((f, fi) => (
                        <div key={fi} className="flex items-start gap-2.5">
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            isPro ? 'text-white' : 'text-emerald-500'
                          }`} />
                          <div className="flex-1">
                            <span className={`block text-xs font-semibold leading-tight ${
                              isPro ? 'text-emerald-50' : 'text-slate-700'
                            }`}>{f}</span>
                            {f === 'GDPR compliance' && (
                              <span className={`block mt-1 text-[10px] font-medium leading-tight ${
                                isPro ? 'text-emerald-200/80' : 'text-slate-400'
                              }`}>
                                {lang === 'it' ? 'Protezione dei dati e privacy sui clienti.' : lang === 'en' ? 'Legal data & privacy protection.' : 'Protección de datos y privacidad.'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <a
                      href={plan.key === 'grow' ? '/contatti' : '/register'}
                      className={`glow-btn block w-full py-4 rounded-2xl font-black text-center text-sm transition-all ${
                        isPro
                          ? 'bg-white text-emerald-700 hover:bg-emerald-50'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {plan.cta} →
                    </a>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>

          {/* Comparison Table */}
          <AnimatedSection>
            <div className="rounded-[32px] overflow-hidden border border-slate-200 shadow-sm">
              {/* Table Header Row */}
              <div className="grid bg-slate-900 text-white" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
                <div className="p-6 font-black text-sm">
                  {lang === 'it' ? 'Caratteristiche' : 'Características'}
                </div>
                {pricingPlans.map((p) => (
                  <div key={p.key} className={`p-6 text-center font-black text-sm ${
                    p.popular ? 'bg-emerald-600' : ''
                  }`}>
                    {p.name}
                  </div>
                ))}
              </div>

              {/* Table Body */}
              {comparisonRows.map((row, ri) => (
                <div
                  key={ri}
                  className={`grid items-center text-sm ${
                    ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                  style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}
                >
                  <div className="p-4 pl-6 font-semibold text-slate-700 border-r border-slate-100">{row.label}</div>
                  {row.vals.map((val, vi) => (
                    <div key={vi} className={`p-4 text-center border-r border-slate-100 last:border-r-0 font-bold ${
                      vi === 2 ? 'bg-emerald-50' : ''
                    }`}>
                      {val === true ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : val === false ? (
                        <span className="text-slate-200 text-lg">—</span>
                      ) : (
                        <span className="text-slate-700 text-xs">{val}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Table Footer CTA Row */}
              <div className="grid bg-slate-900" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
                <div className="p-4" />
                {pricingPlans.map((p) => (
                  <div key={p.key} className={`p-4 ${
                    p.popular ? 'bg-emerald-600' : ''
                  }`}>
                    <a
                      href={p.key === 'grow' ? '/contatti' : '/register'}
                      className={`block w-full py-3 rounded-xl font-black text-center text-xs transition-all ${
                        p.popular
                          ? 'bg-white text-emerald-700'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                    >
                      {p.cta}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

        </div>
      </section>


      {/* ─── WEB CORPORATIVA (Servicio especial) ───────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="relative rounded-[40px] overflow-hidden bg-slate-950 p-10 md:p-16">

              {/* Decorative background glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-[80px]" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-500/10 blur-[80px]" />
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">

                {/* Left: Text */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase tracking-[3px] px-4 py-2 rounded-full mb-8">
                    ✦ {lang === 'it' ? 'Servizio Esclusivo' : 'Servicio Exclusivo'}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                    {lang === 'it' ? 'Crea la tua' : 'Crea tu'}{' '}
                    <span className="text-emerald-400">
                      {lang === 'it' ? 'Pagina Web Corporativa' : 'Página Web Corporativa'}
                    </span>
                  </h2>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg mb-8">
                    {lang === 'it'
                      ? 'Un sito web professionale, progettato e configurato per te. Nessun template generico — un\'identità digitale unica per la tua azienda.'
                      : 'Un sitio web profesional, diseñado y configurado para ti. Sin plantillas genéricas — una identidad digital única para tu empresa.'}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {[
                      lang === 'it' ? '✓ Design su misura' : '✓ Diseño a medida',
                      lang === 'it' ? '✓ SEO ottimizzato' : '✓ SEO optimizado',
                      lang === 'it' ? '✓ Hosting & dominio' : '✓ Hosting & dominio',
                      lang === 'it' ? '✓ Pannello di controllo' : '✓ Panel de control',
                      lang === 'it' ? '✓ Integrazione negozio' : '✓ Integración con tu tienda',
                    ].map((f, i) => (
                      <span key={i} className="text-sm text-slate-300 font-semibold bg-slate-800 px-4 py-2 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Price card */}
                <div className="flex-shrink-0 w-full lg:w-auto">
                  <div className="bg-slate-900 border border-slate-700 rounded-[32px] p-8 min-w-[280px]">

                    {/* One-time payment */}
                    <div className="mb-6 pb-6 border-b border-slate-700">
                      <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                        {lang === 'it' ? 'Investimento iniziale' : 'Inversión inicial'}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-white tracking-tighter">€980</span>
                      </div>
                      <div className="text-slate-500 text-sm font-semibold mt-1">
                        {lang === 'it' ? 'Progettazione + configurazione' : 'Diseño + configuración'}
                      </div>
                    </div>

                    {/* Annual maintenance */}
                    <div className="mb-8">
                      <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                        + {lang === 'it' ? 'Mantenimento annuale' : 'Mantenimiento anual'}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-emerald-400 tracking-tight">€190</span>
                        <span className="text-slate-500 text-sm font-bold">{lang === 'it' ? '/ anno' : '/ año'}</span>
                      </div>
                      <div className="text-slate-500 text-xs font-semibold mt-1">
                        ≈ {lang === 'it' ? '€15,80 al mese' : '€15,80 al mes'}
                      </div>
                    </div>

                    <a
                      href="/contatti"
                      className="glow-btn block w-full py-5 rounded-2xl bg-amber-400 text-emerald-900 font-black text-center text-base hover:bg-amber-300 transition-all shadow-xl shadow-amber-400/20"
                    >
                      {lang === 'it' ? 'Richiedi ora →' : 'Solicitar ahora →'}
                    </a>

                    <p className="text-center text-slate-600 text-[11px] font-semibold mt-4">
                      {lang === 'it' ? 'Sin compromiso · Risposta in 24h' : 'Sin compromiso · Respuesta en 24h'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────────────────────── */}

      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">{t('faqTitle')}</h2>
          </AnimatedSection>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden hover:border-emerald-300 transition-colors">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-6 text-left flex items-center justify-between gap-6 focus:outline-none"
                  >
                    <span className="font-bold text-slate-800 leading-tight">{faq.q}</span>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${openFaq === i ? 'bg-emerald-600 text-white rotate-45' : 'bg-slate-100 text-slate-400 rotate-0'}`}>
                      <Zap className="w-4 h-4" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-4 text-sm">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ──────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden mesh-gradient">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-8">
              {t('ctaFinalTitle')}
            </h2>
            <p className="text-xl text-emerald-100 font-medium mb-12 max-w-2xl mx-auto opacity-90 leading-relaxed">
              {t('ctaFinalSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="/register" className="glow-btn bg-white text-emerald-900 px-12 py-6 rounded-2xl text-xl font-black shadow-3xl w-full sm:w-auto">
                {t('heroCtaMain')} →
              </a>
              <div className="text-emerald-100/70 font-bold text-lg">
                <span className="text-white text-2xl font-black mr-2">{storeCount}</span> {t('counterLabel')}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 pt-24 pb-12 px-6 text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 text-white font-black text-2xl tracking-tighter mb-6">
                <Image src="/logo.jpg" alt="Logo" width={36} height={36} className="rounded-xl" />
                TIENDAONLINE
              </div>
              <p className="font-medium text-sm leading-relaxed mb-8 opacity-60">
                {t('footerTagline')}
              </p>
              <div className="flex gap-4">
                {/* Social icons placeholders */}
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"><Info className="w-5 h-5"/></div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-24">
              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Plataforma</h4>
                <a href="/login" className="block hover:text-emerald-400 transition-colors font-semibold text-sm">{t('accedi')}</a>
                <a href="/register" className="block hover:text-emerald-400 transition-colors font-semibold text-sm">{t('ctaHeader')}</a>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Legal</h4>
                <a href="/privacy" className="block hover:text-emerald-400 transition-colors font-semibold text-sm">{t('footerPrivacy')}</a>
                <a href="/terms" className="block hover:text-emerald-400 transition-colors font-semibold text-sm">{t('footerTerms')}</a>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Soporte</h4>
                <a href="/contatti" className="block hover:text-emerald-400 transition-colors font-semibold text-sm">{t('footerContact')}</a>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6 text-[11px] font-black uppercase tracking-[3px] opacity-40">
            <div>© 2026 TIENDAONLINE · ITALY</div>
            <div className="flex items-center gap-2">
               <Zap className="w-3 h-3 text-emerald-500" /> {t('footerCredit')}
            </div>
          </div>
        </div>
      </footer>

      {/* Global CSS Overrides for complex cases */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>

    </div>
  )
}
