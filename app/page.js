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
      label: t('planGratisLabel'),
      price: '€0',
      period: lang === 'it' ? 'per sempre' : 'para siempre',
      features: [t('planFree1'), t('planFree2'), t('planFree3'), t('planFree4'), t('planFree5'), t('planFree6')],
      cta: t('ctaHeader'),
      popular: false,
      gdpr: true
    },
    {
      key: 'pro',
      label: t('planAvanzatoLabel'),
      price: '€0.50',
      period: lang === 'it' ? '/ giorno' : '/ día',
      features: [t('planAdv1'), t('planAdv2'), t('planAdv3'), t('planAdv4'), t('planAdv5'), t('planAdv6')],
      cta: t('planAvanzatoCta'),
      popular: true,
      gdpr: false
    }
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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-header py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 no-underline group">
            <div className="relative overflow-hidden rounded-xl">
              <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="rounded-xl transition-transform group-hover:scale-110" priority />
            </div>
            <span className={`font-black text-xl tracking-tighter ${isScrolled ? 'text-emerald-600' : 'text-white'}`}>
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

          <div className="flex items-center gap-6">
            <a href="/login" className={`text-sm font-semibold transition-colors ${isScrolled ? 'text-slate-600 hover:text-emerald-600' : 'text-emerald-50 hover:text-white'}`}>
              {t('accedi')}
            </a>
            <a href="/register" className="glow-btn bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-emerald-500/20 flex items-center gap-2">
              {t('ctaHeader')} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden mesh-gradient">
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
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('pricingTitle')}</h2>
            <p className="text-lg text-slate-600 font-medium">{t('pricingSubtitle')}</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {pricingPlans.map((plan, i) => (
              <AnimatedSection key={i} delay={i * 0.1} className={`relative p-10 rounded-[48px] flex flex-col transition-all h-full ${plan.popular ? 'bg-emerald-600 text-white shadow-3xl' : 'bg-slate-50 border border-slate-100 text-slate-900'}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-amber-400 text-emerald-900 text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                    Recomendado
                  </div>
                )}
                
                <div className="mb-10">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${plan.popular ? 'bg-white/10 border border-white/20' : 'bg-emerald-100 text-emerald-700'}`}>
                    {plan.label}
                  </span>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                    <span className={`text-sm font-bold ${plan.popular ? 'text-emerald-100' : 'text-slate-500'}`}>{plan.period}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-12">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-3 text-sm font-bold">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-emerald-500'}`} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {plan.gdpr && (
                  <div className="mb-8 p-4 rounded-2xl bg-white/5 text-[11px] font-bold leading-relaxed border border-white/10">
                    <div className="flex gap-2 items-center mb-2 text-emerald-200 uppercase tracking-widest">
                       <ShieldCheck className="w-4 h-4" /> GDPR Compliance
                    </div>
                    {lang === 'it' 
                      ? 'Crittografia dati, diritto all\'oblio, nessuna vendita di dati.' 
                      : 'Cifrado de datos, derecho al olvido, sin venta de datos.'}
                  </div>
                )}

                <a href="/register" className={`glow-btn w-full py-5 rounded-2xl font-black text-center text-lg transition-all ${plan.popular ? 'bg-white text-emerald-700 shadow-white/20' : 'bg-emerald-600 text-white shadow-emerald-600/20'}`}>
                  {plan.cta} →
                </a>
              </AnimatedSection>
            ))}
          </div>
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
