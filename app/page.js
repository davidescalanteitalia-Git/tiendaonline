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
      { name: 'Pane casereccio',    price: '2.50',  img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/panetteria-pane.jpg'     },
      { name: 'Cornetti freschi',   price: '1.20',  img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/panetteria-cornetti.jpg' },
      { name: 'Torta della nonna',  price: '14.00', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/panetteria-torta.jpg'    },
      { name: 'Focaccia rosmarino', price: '3.50',  img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/panetteria-focaccia.jpg' },
    ],
  },
  {
    icon: '🍊',
    labelKey: 'tabFruttivendolo',
    store: "Frutta e Verdura da Mario",
    products: [
      { name: 'Fragole biologiche', price: '3.90', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/frutta-fragole.jpg'   },
      { name: 'Arance di Sicilia',  price: '2.00', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/frutta-arance.jpg'    },
      { name: 'Insalata mista',     price: '1.50', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/frutta-insalata.jpg'  },
      { name: 'Pomodori datterini', price: '2.80', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/frutta-pomodori.jpg'  },
    ],
  },
  {
    icon: '☕',
    labelKey: 'tabBar',
    store: 'Bar Centrale',
    products: [
      { name: 'Caffè espresso',    price: '1.20', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/bar-espresso.jpg'    },
      { name: 'Cappuccino',        price: '1.50', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/bar-cappuccino.jpg'  },
      { name: 'Tramezzino misto',  price: '2.50', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/bar-tramezzino.jpg'  },
      { name: 'Succo di frutta',   price: '2.00', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/bar-succo.jpg'       },
    ],
  },
  {
    icon: '🏪',
    labelKey: 'tabNegozioLocale',
    store: 'Alimentari da Lucia',
    products: [
      { name: 'Olio extravergine',  price: '8.50', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/alimentari-olio.jpg'       },
      { name: 'Pasta artigianale',  price: '2.20', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/alimentari-pasta.jpg'      },
      { name: 'Marmellata artig.',  price: '4.90', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/alimentari-marmellata.jpg' },
      { name: 'Conserve (pack 3)',  price: '6.00', img: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/alimentari-conserve.jpg'   },
    ],
  },
]

// ── WEB_DETALLE_LANDING ───────────────────────────────────────────────────────
// Reescrito 2026-04-19 (ver REVISION_MARCA.md §4.2): voz cercana y concreta,
// sin clichés ("ispira fiducia", "código optimizado"). Cada beneficio aterrizado
// en un resultado medible para el dueño del negocio.
const WEB_DETALLE_LANDING = [
  {
    cat: { it: '🎨 Design & UX', es: '🎨 Diseño & UX', en: '🎨 Design & UX' },
    items: [
      { l: { it: 'Design su misura', es: 'Diseño a medida', en: 'Custom design' }, d: { it: 'Niente template riciclati. Il tuo sito non sembra quello di altri 10.000 negozi.', es: 'Nada de plantillas recicladas. Tu sitio no se parece al de otros 10.000 negocios.', en: 'No recycled templates. Your site doesn’t look like 10,000 other shops.' } },
      { l: { it: 'Ti fanno scegliere, non scrollare', es: 'Hace que te elijan, no que te ignoren', en: 'Makes visitors choose you, not scroll past' }, d: { it: 'Un aspetto professionale che fa decidere al cliente di comprare da te invece che da un profilo Instagram anonimo.', es: 'Un aspecto profesional que hace que el cliente decida comprarte a ti y no a un perfil de Instagram anónimo.', en: 'A polished look that makes customers pick you over an anonymous Instagram profile.' } },
      { l: { it: 'Si vede bene su cellulare', es: 'Se ve bien en el celular', en: 'Looks right on mobile' }, d: { it: 'L’80% dei tuoi clienti entra dal telefono. Il sito è pensato prima per loro.', es: 'El 80% de tus clientes entra desde el celular. El sitio está pensado primero para ellos.', en: '80% of your customers visit from a phone. The site is built for them first.' } },
    ],
  },
  {
    cat: { it: '📄 Struttura del sito', es: '📄 Estructura del sitio', en: '📄 Site structure' },
    items: [
      { l: { it: '5 sezioni incluse', es: '5 secciones incluidas', en: '5 sections included' }, d: { it: 'Home, Chi siamo, Servizi, Contatti e Blog — tutto quello che serve per presentarti senza pagine vuote.', es: 'Home, Sobre nosotros, Servicios, Contacto y Blog — todo lo necesario para presentarte sin páginas vacías.', en: 'Home, About, Services, Contact and Blog — everything you need, no filler pages.' } },
    ],
  },
  {
    cat: { it: '🔍 SEO & velocità', es: '🔍 SEO & velocidad', en: '🔍 SEO & speed' },
    items: [
      { l: { it: 'Ti trovano su Google', es: 'Te encuentran en Google', en: 'Google can find you' }, d: { it: 'Titoli, descrizioni e sitemap configurati per farti apparire quando qualcuno cerca il tuo negozio nella tua zona.', es: 'Títulos, descripciones y sitemap configurados para que aparezcas cuando alguien busca tu negocio en tu zona.', en: 'Titles, descriptions and sitemap configured so you show up when someone searches for your shop nearby.' } },
      { l: { it: 'Carica in 2 secondi', es: 'Carga en 2 segundos', en: 'Loads in 2 seconds' }, d: { it: 'I clienti non aspettano. Un sito lento è un cliente perso.', es: 'Los clientes no esperan. Un sitio lento es un cliente perdido.', en: 'Customers don’t wait. A slow site is a lost sale.' } },
    ],
  },
  {
    cat: { it: '🔒 Sicurezza', es: '🔒 Seguridad', en: '🔒 Security' },
    items: [
      { l: { it: 'Certificato SSL incluso', es: 'Certificado SSL incluido', en: 'SSL certificate included' }, d: { it: 'Il lucchetto verde accanto al tuo dominio: i clienti vedono che è sicuro e completano l’ordine.', es: 'El candado verde junto a tu dominio: los clientes ven que es seguro y completan el pedido.', en: 'The green padlock next to your domain: customers see it’s safe and finish the order.' } },
      { l: { it: 'Protezione base inclusa', es: 'Protección básica incluida', en: 'Basic protection included' }, d: { it: 'Bot, spam e tentativi di accesso bloccati senza che tu debba occupartene.', es: 'Bots, spam e intentos de acceso bloqueados sin que tengas que ocuparte tú.', en: 'Bots, spam and login attempts blocked so you don’t have to deal with them.' } },
    ],
  },
  {
    cat: { it: '🔗 Integrazioni', es: '🔗 Integraciones', en: '🔗 Integrations' },
    items: [
      { l: { it: 'Social media collegati', es: 'Redes sociales conectadas', en: 'Social media connected' }, d: { it: 'Instagram, Facebook, TikTok — un clic dal tuo sito al tuo profilo.', es: 'Instagram, Facebook, TikTok — un clic desde tu web a tu perfil.', en: 'Instagram, Facebook, TikTok — one click from your site to your profile.' } },
      { l: { it: 'Pulsante WhatsApp pronto', es: 'Botón de WhatsApp listo', en: 'WhatsApp button ready' }, d: { it: 'Il visitatore tocca il bottone e ti scrive direttamente. Dove ti scrivono già oggi.', es: 'El visitante toca el botón y te escribe directo. Donde ya te escriben hoy.', en: 'Visitors tap the button and message you straight away — where they already chat with you.' } },
      { l: { it: 'Collegato al tuo negozio TIENDAONLINE', es: 'Conectado a tu tienda TIENDAONLINE', en: 'Connected to your TIENDAONLINE store' }, d: { it: 'Dal sito corporate al catalogo con i prodotti in un clic. Due canali, una sola gestione.', es: 'De la web corporativa al catálogo con productos en un clic. Dos canales, una sola gestión.', en: 'From the corporate site to your product catalogue in one click. Two channels, one backend.' } },
    ],
  },
  {
    cat: { it: '⚙️ Pannello di amministrazione', es: '⚙️ Panel de administración', en: '⚙️ Admin panel' },
    items: [
      { l: { it: 'Aggiorna tu stesso', es: 'Actualiza tú mismo', en: 'Update it yourself' }, d: { it: 'Cambia testi, foto e prezzi dal tuo cellulare. Senza chiamare un tecnico, senza aspettare una settimana.', es: 'Cambia textos, fotos y precios desde el celular. Sin llamar a un técnico, sin esperar una semana.', en: 'Change text, photos and prices from your phone. No tech calls, no week-long waits.' } },
    ],
  },
  {
    cat: { it: '🛠️ Supporto & manutenzione', es: '🛠️ Soporte & mantenimiento', en: '🛠️ Support & maintenance' },
    items: [
      { l: { it: 'Lo teniamo aggiornato noi', es: 'Lo mantenemos actualizado nosotros', en: 'We keep it up to date' }, d: { it: 'Aggiornamenti di sicurezza e ottimizzazioni inclusi nel piano annuale. Tu vendi, noi ci occupiamo del resto.', es: 'Actualizaciones de seguridad y optimizaciones incluidas en el plan anual. Tú vendes, nosotros nos ocupamos del resto.', en: 'Security updates and optimisations included in the annual plan. You sell, we handle the rest.' } },
      { l: { it: 'Supporto prioritario via WhatsApp', es: 'Soporte prioritario por WhatsApp', en: 'Priority WhatsApp support' }, d: { it: 'Assistenza diretta del team in orario lavorativo (lun–ven 9–18).', es: 'Asistencia directa del equipo en horario laboral (lun–vie 9–18).', en: 'Direct team assistance during working hours (Mon–Fri 9–18).' } },
      { l: { it: 'Backup automatici', es: 'Backups automáticos', en: 'Automatic backups' }, d: { it: 'Se qualcosa va storto, i tuoi contenuti tornano al posto giusto in pochi minuti.', es: 'Si algo sale mal, tus contenidos vuelven a su sitio en minutos.', en: 'If something breaks, your content is back in minutes.' } },
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
  const [expandedPricingPlan, setExpandedPricingPlan] = useState(null)
  const [showWebDetail, setShowWebDetail] = useState(false)

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
        lang === 'it' ? 'Sottodominio personalizzato' : 'Subdominio personalizado',
        '100 MB ' + (lang === 'it' ? 'di spazio' : 'almacenamiento'),
        'GDPR compliance',
      ],
      detalle: [
        { cat: lang === 'it' ? '🛍️ Vendite' : '🛍️ Ventas', items: [
          { l: 'POS ' + (lang === 'it' ? 'tattile' : 'táctil'), d: lang === 'it' ? 'Incassa in negozio dal tuo cellulare o tablet.' : 'Cobra en persona desde tu celular o tablet, rápido y sin complicaciones.' },
          { l: 'Checkout WhatsApp', d: lang === 'it' ? 'I clienti ordinano online e ti scrivono su WhatsApp. Coordini tu il pagamento.' : 'Tus clientes hacen el pedido online y te escriben directo. Tú coordinas el pago.' },
          { l: lang === 'it' ? '0% commissioni TIENDAONLINE' : '0% comisión TIENDAONLINE', d: lang === 'it' ? 'Non prendiamo nulla sulle tue vendite. Se in futuro attivi i pagamenti online, Stripe applica le sue tariffe standard (1,5% + €0,25 per carta europea, aggiornate da Stripe).' : 'No cobramos nada sobre tus ventas. Si más adelante activas pagos online, Stripe aplica sus tarifas estándar (1,5% + €0,25 por tarjeta europea, actualizadas por Stripe).' },
        ]},
        { cat: lang === 'it' ? '📦 Inventario' : '📦 Inventario', items: [
          { l: lang === 'it' ? '50 prodotti' : '50 productos', d: lang === 'it' ? 'Ideale per un piccolo negozio o catalogo base.' : 'Suficiente para una tienda pequeña o catálogo básico.' },
          { l: lang === 'it' ? '1 foto per prodotto' : '1 imagen por producto', d: lang === 'it' ? '100 MB di spazio totale per le tue immagini.' : '100 MB de almacenamiento total para tus fotos.' },
          { l: lang === 'it' ? 'Sottodominio personalizzato' : 'Subdominio personalizado', d: lang === 'it' ? 'Il tuo negozio su tuazienda.tiendaonline.it dal primo giorno.' : 'Tu tienda en tutienda.tiendaonline.it desde el primer día.' },
        ]},
        { cat: lang === 'it' ? '💳 Pagamenti' : '💳 Pagos', items: [
          { l: lang === 'it' ? 'Solo WhatsApp' : 'Solo WhatsApp', d: lang === 'it' ? 'Nel piano gratuito il pagamento viene concordato direttamente con il cliente tramite WhatsApp, contanti o bonifico.' : 'En el plan Gratis el cobro se coordina directamente con el cliente por WhatsApp, efectivo o transferencia manual.' },
        ]},
        { cat: '🔒 GDPR', items: [
          { l: 'GDPR compliance', d: lang === 'it' ? 'La piattaforma è conforme al regolamento europeo sulla protezione dei dati.' : 'La plataforma cumple con la normativa europea de protección de datos.' },
        ]},
        { cat: lang === 'it' ? '💬 Supporto' : '💬 Soporte', items: [
          { l: lang === 'it' ? 'FAQ + email' : 'FAQ + email', d: lang === 'it' ? 'Consulta la nostra guida online e scrivici via email. Risposta entro 48 ore lavorative.' : 'Consulta nuestra guía online y escríbenos por email. Respuesta en 48 horas hábiles.' },
        ]},
      ],
    },
    {
      key: 'starter',
      name: lang === 'it' ? 'Base' : lang === 'en' ? 'Basic' : 'Básico',
      desc: lang === 'it' ? 'Il tuo negozio base per iniziare a vendere' : 'Tu tienda básica para empezar a vender',
      monthly: 15,
      annual: 12,
      popular: false,
      cta: lang === 'it' ? 'Inizia ora' : 'Empezar ahora',
      badge: null,
      highlights: [
        lang === 'it' ? '500 prodotti' : '500 productos',
        lang === 'it' ? 'Sottodominio personalizzato' : 'Subdominio personalizado',
        lang === 'it' ? 'Pagamenti online con Stripe' : 'Pagos online con Stripe',
        lang === 'it' ? 'Esportazione CSV' : 'Exportación CSV',
        '1 GB ' + (lang === 'it' ? 'di spazio' : 'almacenamiento'),
        lang === 'it' ? 'Supporto email + WhatsApp' : 'Soporte email + WhatsApp',
      ],
      detalle: [
        { cat: lang === 'it' ? '🛍️ Vendite' : '🛍️ Ventas', items: [
          { l: lang === 'it' ? 'Pagamenti online con Stripe' : 'Pagos online con Stripe', d: lang === 'it' ? 'I tuoi clienti pagano con carta direttamente nel tuo negozio. Il denaro va direttamente sul tuo conto bancario — TIENDAONLINE non tocca nulla.' : 'Tus clientes pagan con tarjeta directamente en tu tienda. El dinero va directo a tu cuenta bancaria — TIENDAONLINE no interviene.' },
          { l: lang === 'it' ? '0% commissioni TIENDAONLINE' : '0% comisión TIENDAONLINE', d: lang === 'it' ? 'Nessuna percentuale sulle vendite da parte nostra. Le tariffe di Stripe per i pagamenti con carta sono separate e pagate direttamente a Stripe.' : 'Ningún porcentaje sobre tus ventas de nuestra parte. Las tarifas de Stripe para pagos con tarjeta son aparte y se pagan directamente a Stripe.' },
        ]},
        { cat: lang === 'it' ? '📦 Inventario' : '📦 Inventario', items: [
          { l: lang === 'it' ? '500 prodotti' : '500 productos', d: lang === 'it' ? 'Per un negozio medio con catalogo variato.' : 'Para una tienda mediana con catálogo variado.' },
          { l: lang === 'it' ? '2 foto per prodotto' : '2 imágenes por producto', d: lang === 'it' ? '1 GB di spazio totale per le foto.' : '1 GB de almacenamiento total para tus fotos.' },
          { l: lang === 'it' ? 'Esportazione CSV / PDF' : 'Exportación CSV / PDF', d: lang === 'it' ? 'Scarica inventario e ordini quando vuoi.' : 'Descarga tu inventario y pedidos en cualquier momento.' },
        ]},
        { cat: lang === 'it' ? '📊 Reporti' : '📊 Reportes', items: [
          { l: lang === 'it' ? 'Reporti base' : 'Reportes básicos', d: lang === 'it' ? 'Vendite del giorno, settimana e mese.' : 'Ventas del día, semana y mes.' },
        ]},
        { cat: lang === 'it' ? '💬 Supporto' : '💬 Soporte', items: [
          { l: lang === 'it' ? 'Email + WhatsApp' : 'Email + WhatsApp', d: lang === 'it' ? 'Risposta garantita entro 24 ore lavorative. WhatsApp disponibile in orario d\'ufficio (lun–ven 9–18).' : 'Respuesta garantizada en 24 horas hábiles. WhatsApp disponible en horario de oficina (lun–vie 9–18).' },
        ]},
      ],
    },
    {
      key: 'pro',
      name: 'Pro',
      desc: lang === 'it' ? 'La scelta perfetta per i negozi in crescita' : 'La elección perfecta para negocios en crecimiento',
      monthly: 25,
      annual: 20,
      popular: true,
      cta: lang === 'it' ? 'Inizia ora' : 'Empezar ahora',
      badge: lang === 'it' ? '⭐ Più scelto' : '⭐ El más elegido',
      highlights: [
        lang === 'it' ? '5.000 prodotti' : '5.000 productos',
        lang === 'it' ? 'Rapporti finanziari avanzati' : 'Reportes financieros avanzados',
        lang === 'it' ? '🔜 Catalogo Instagram / Facebook' : '🔜 Catálogo Instagram / Facebook',
        lang === 'it' ? 'Codici sconto illimitati' : 'Códigos descuento ilimitados',
        '5 GB ' + (lang === 'it' ? 'di spazio' : 'almacenamiento'),
        lang === 'it' ? 'Supporto prioritario' : 'Soporte prioritario',
      ],
      detalle: [
        { cat: lang === 'it' ? '🛍️ Vendite' : '🛍️ Ventas', items: [
          { l: lang === 'it' ? 'Pagamenti online con Stripe' : 'Pagos online con Stripe', d: lang === 'it' ? 'Come il piano Base. Il tuo account Stripe collegato direttamente, i soldi arrivano sul tuo conto senza che TIENDAONLINE intervenga.' : 'Tu cuenta Stripe conectada directamente. El dinero llega a tu banco sin que TIENDAONLINE intervenga en ningún momento.' },
          { l: lang === 'it' ? 'Codici sconto illimitati' : 'Cupones de descuento ilimitados', d: lang === 'it' ? 'Crea codici sconto in percentuale o valore fisso.' : 'Crea códigos de descuento por porcentaje o valor fijo.' },
          { l: (lang === 'it' ? '🔜 Catalogo Instagram / Facebook' : '🔜 Catálogo Instagram / Facebook'), d: lang === 'it' ? 'Prossimamente: condividi il tuo catalogo direttamente sulla tua pagina Facebook e Instagram in un solo clic.' : 'Próximamente: comparte tu catálogo directo en tu página de Facebook e Instagram en un solo clic.' },
        ]},
        { cat: lang === 'it' ? '📦 Inventario' : '📦 Inventario', items: [
          { l: lang === 'it' ? '5.000 prodotti' : '5.000 productos', d: lang === 'it' ? 'Per cataloghi grandi con più categorie.' : 'Para catálogos grandes con múltiples categorías.' },
          { l: lang === 'it' ? '3 foto per prodotto' : '3 imágenes por producto', d: lang === 'it' ? '5 GB di spazio. Ricorda: le foto ad alta risoluzione occupano più spazio.' : '5 GB de almacenamiento. Recuerda: fotos de mayor resolución ocupan más espacio.' },
        ]},
        { cat: lang === 'it' ? '👥 Clienti' : '👥 Clientes', items: [
          { l: lang === 'it' ? 'Conti in sospeso e credito cliente' : 'Fiados y cuentas corrientes', d: lang === 'it' ? 'Registra le vendite a credito e gestisci i pagamenti parziali.' : 'Registra ventas a crédito y gestiona abonos parciales.' },
          { l: lang === 'it' ? 'Portale clienti' : 'Portal del cliente', d: lang === 'it' ? 'I tuoi clienti vedono la cronologia degli ordini.' : 'Tus clientes pueden ver su historial de pedidos.' },
        ]},
        { cat: lang === 'it' ? '📊 Reporti' : '📊 Reportes', items: [
          { l: lang === 'it' ? 'Reporti finanziari avanzati' : 'Reportes financieros avanzados', d: lang === 'it' ? 'Vendite vs costi, margine di guadagno reale, top prodotti più venduti.' : 'Ventas vs costos, margen de ganancia real por producto, top productos más vendidos.' },
        ]},
        { cat: lang === 'it' ? '💬 Supporto' : '💬 Soporte', items: [
          { l: lang === 'it' ? 'Supporto prioritario' : 'Soporte prioritario', d: lang === 'it' ? 'Risposta in meno di 4 ore lavorative.' : 'Respuesta en menos de 4 horas hábiles.' },
        ]},
      ],
    },
    {
      key: 'grow',
      name: 'Grow',
      desc: lang === 'it' ? 'Il negozio completo per chi vuole crescere' : 'Tu tienda completa para crecer sin límites',
      monthly: 40,
      annual: 32,
      popular: false,
      cta: lang === 'it' ? 'Contattaci' : 'Contactar',
      badge: null,
      highlights: [
        lang === 'it' ? 'Prodotti illimitati' : 'Productos ilimitados',
        lang === 'it' ? '🔜 Recupero carrelli abbandonati' : '🔜 Recuperación carritos abandonados',
        lang === 'it' ? '🔜 Programma punti & Affiliati' : '🔜 Programa de puntos y Afiliados',
        '20 GB ' + (lang === 'it' ? 'di spazio' : 'almacenamiento'),
        lang === 'it' ? 'Assistenza prioritaria in orario lavorativo' : 'Asesoría prioritaria en horario de oficina',
      ],
      detalle: [
        { cat: lang === 'it' ? '🛍️ Vendite' : '🛍️ Ventas', items: [
          { l: lang === 'it' ? 'Stripe diretto — senza intermediari' : 'Stripe propio — sin intermediarios', d: lang === 'it' ? 'Colleghi il tuo account Stripe. I soldi vanno direttamente sul tuo conto. TIENDAONLINE non interviene. Ti guidiamo passo dopo passo per attivarlo.' : 'Conectas tu propia cuenta Stripe. El dinero va directo a tu banco. TIENDAONLINE no interviene. Te guiamos para activarlo la primera vez.' },
          { l: (lang === 'it' ? '🔜 Recupero carrelli abbandonati' : '🔜 Recuperación de carritos abandonados'), d: lang === 'it' ? 'Prossimamente: avviso automatico ai clienti che non hanno completato l\'acquisto.' : 'Próximamente: aviso automático a clientes que no completaron su compra.' },
          { l: (lang === 'it' ? '🔜 Programma punti e affiliati' : '🔜 Programa de puntos y afiliados'), d: lang === 'it' ? 'Prossimamente: fidelizza i clienti con punti riscattabili e premi.' : 'Próximamente: fideliza a tus clientes con puntos canjeables y recompensas.' },
        ]},
        { cat: lang === 'it' ? '📦 Inventario' : '📦 Inventario', items: [
          { l: lang === 'it' ? 'Prodotti illimitati' : 'Productos ilimitados', d: lang === 'it' ? 'Nessun limite. Fai crescere il catalogo quanto vuoi.' : 'Sin techo. Crece tu catálogo todo lo que necesites.' },
          { l: lang === 'it' ? '3 foto per prodotto' : '3 imágenes por producto', d: lang === 'it' ? '20 GB di spazio totale. Ricorda: le foto ad alta risoluzione occupano più spazio.' : '20 GB de almacenamiento. Recuerda: fotos de mayor resolución ocupan más espacio.' },
        ]},
        { cat: lang === 'it' ? '🔧 Operazioni' : '🔧 Operaciones', items: [
          { l: lang === 'it' ? 'Assistenza prioritaria in orario lavorativo' : 'Asesoría prioritaria en horario de oficina', d: lang === 'it' ? 'Risposta garantita in orario lavorativo (lun–ven 9–18) per domande sul tuo negozio e sulla piattaforma.' : 'Respuesta garantizada en horario de oficina (lun–vie 9–18) para dudas sobre tu negocio y la plataforma.' },
          { l: lang === 'it' ? 'Backup giornaliero' : 'Backup diario', d: lang === 'it' ? 'Copia di sicurezza automatica ogni 24 ore.' : 'Copia de seguridad automática de todos tus datos cada 24 horas.' },
        ]},
        { cat: lang === 'it' ? '💬 Supporto' : '💬 Soporte', items: [
          { l: lang === 'it' ? 'Supporto tecnico prioritario' : 'Soporte técnico prioritario', d: lang === 'it' ? 'I problemi tecnici del tuo piano vengono risolti prima di qualsiasi altro. In orario lavorativo.' : 'Los problemas técnicos de tu plan se resuelven antes que cualquier otro. En horario de oficina.' },
        ]},
      ],
    },
  ]

  const comparisonRows = [
    { label: lang === 'it' ? 'Comisione per vendita' : 'Comisión por venta',           vals: ['0%', '0%', '0%', '0%'] },
    { label: lang === 'it' ? 'Numero di prodotti' : 'Número de productos',              vals: ['50', '500', '5.000', lang === 'it' ? 'Illimitati' : 'Ilimitados'] },
    { label: 'POS ' + (lang === 'it' ? 'tattile' : 'táctil'),                           vals: [true, true, true, true] },
    { label: 'Checkout WhatsApp',                                                        vals: [true, true, true, true] },
    { label: lang === 'it' ? 'Spazio disco' : 'Almacenamiento',                         vals: ['100 MB', '1 GB', '5 GB', '20 GB'] },
    { label: lang === 'it' ? 'Subdominio personalizzato' : 'Subdominio personalizado',   vals: [true, true, true, true] },
    { label: lang === 'it' ? 'Pagamenti online con Stripe' : 'Pagos online con Stripe',  vals: [false, true, true, true] },
    { label: lang === 'it' ? 'Esportazione CSV / PDF' : 'Exportación CSV / PDF',        vals: [false, true, true, true] },
    { label: lang === 'it' ? 'Reporti finanziari' : 'Reportes financieros',             vals: [false, lang === 'it' ? 'Base' : 'Básicos', lang === 'it' ? 'Avanzati' : 'Avanzados', 'Premium'] },
    { label: (lang === 'it' ? '🔜 Catalogo Instagram/FB' : '🔜 Catálogo Instagram/FB'), vals: [false, false, '🔜', '🔜'] },
    { label: lang === 'it' ? 'Codici sconto' : 'Códigos descuento',                     vals: [false, false, true, true] },
    { label: (lang === 'it' ? '🔜 Carrelli abbandonati' : '🔜 Carritos abandonados'),   vals: [false, false, false, '🔜'] },
    { label: (lang === 'it' ? '🔜 Programma punti' : '🔜 Programa de puntos'),          vals: [false, false, false, '🔜'] },
    { label: lang === 'it' ? 'Assistenza prioritaria (orario lavorativo)' : 'Asesoría prioritaria (horario de oficina)', vals: [false, false, false, true] },
    { label: 'Backup',                                                                   vals: [lang === 'it' ? 'Settimanale' : 'Semanal', lang === 'it' ? 'Settimanale' : 'Semanal', lang === 'it' ? 'Giornaliero' : 'Diario', lang === 'it' ? 'Giornaliero' : 'Diario'] },
    { label: lang === 'it' ? 'Supporto' : 'Soporte',                                    vals: [lang === 'it' ? 'FAQ + email' : 'FAQ + email', lang === 'it' ? 'Email + WhatsApp' : 'Email + WhatsApp', lang === 'it' ? 'Prioritario' : 'Prioritario', lang === 'it' ? 'Dedicato' : 'Dedicado'] },
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

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-colors ${isScrolled ? 'bg-slate-100/50 border-slate-200' : 'bg-white/10 border-white/20'}`}>
            {['it', 'es', 'en'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  lang === l 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : isScrolled
                      ? 'text-slate-500 hover:text-emerald-700'
                      : 'text-emerald-100 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <a href="/blog" className={`hidden md:block text-xs sm:text-sm font-semibold transition-colors text-center whitespace-nowrap ${isScrolled ? 'text-slate-600 hover:text-emerald-600' : 'text-emerald-100/70 hover:text-white'}`}>
              Blog
            </a>
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
              {['🛍️', '🥖', '☕', '🏪'].map((emoji, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-800 shadow-xl flex items-center justify-center text-lg" style={{ background: ['#065f46','#047857','#059669','#10b981'][i] }}>
                  {emoji}
                </div>
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

      {/* ─── TRUST BAR ──────────────────────────────────────────────────────── */}
      <section className="py-5 px-6 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {[
            { icon: '🔒', label: 'SSL · HTTPS' },
            { icon: '✅', label: 'GDPR Compliant' },
            { icon: '💳', label: lang === 'it' ? 'Pagamenti con Stripe' : lang === 'en' ? 'Payments via Stripe' : 'Pagos con Stripe' },
            { icon: '🏪', label: `${storeCount} ${lang === 'it' ? 'negozi attivi' : lang === 'en' ? 'active stores' : 'tiendas activas'}` },
            { icon: '🇮🇹', label: lang === 'it' ? 'Supporto in italiano' : lang === 'en' ? 'Italian support' : 'Soporte en italiano' },
            { icon: '⚡', label: lang === 'it' ? 'Attivo in 5 minuti' : lang === 'en' ? 'Live in 5 minutes' : 'Activo en 5 minutos' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-500 text-xs font-bold whitespace-nowrap">
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
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

      {/* ─── TESTIMONIOS ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-emerald-50 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {lang === 'it' ? 'Chi usa TIENDAONLINE?' : lang === 'en' ? 'Who uses TIENDAONLINE?' : '¿Quién usa TIENDAONLINE?'}
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              {lang === 'it' ? 'Negozi reali, risultati reali.' : lang === 'en' ? 'Real stores, real results.' : 'Tiendas reales, resultados reales.'}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                avatar: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/testimonio-marco.jpg',
                name: 'Marco R.',
                role: lang === 'it' ? 'Panetteria · Milano' : lang === 'en' ? 'Bakery · Milan' : 'Panadería · Milán',
                quote: lang === 'it'
                  ? '"Prima perdevo ordini su WhatsApp. Adesso il catalogo online fa tutto da solo e i clienti ordinano anche la notte."'
                  : lang === 'en'
                  ? '"I used to lose orders on WhatsApp. Now the online catalog does everything automatically and customers order even at night."'
                  : '"Antes perdía pedidos en WhatsApp. Ahora el catálogo online lo hace todo solo y los clientes piden hasta de noche."',
                stars: 5,
              },
              {
                avatar: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/testimonio-lucia.jpg',
                name: 'Lucia F.',
                role: lang === 'it' ? 'Boutique · Roma' : lang === 'en' ? 'Boutique · Rome' : 'Boutique · Roma',
                quote: lang === 'it'
                  ? '"Il POS sul telefono è comodissimo. Niente cassa tradizionale, niente code. Vendo dal banco con un tocco."'
                  : lang === 'en'
                  ? '"The POS on the phone is super convenient. No traditional cash register, no queues. I sell from the counter with one tap."'
                  : '"El POS en el celular es comodísimo. Sin caja registradora, sin filas. Vendo desde el mostrador con un toque."',
                stars: 5,
              },
              {
                avatar: 'https://bripfrfkwahsxtegmils.supabase.co/storage/v1/object/public/demo/testimonio-carlos.jpg',
                name: 'Carlos M.',
                role: lang === 'it' ? 'Bar · Napoli' : lang === 'en' ? 'Café · Naples' : 'Café · Nápoles',
                quote: lang === 'it'
                  ? '"I miei clienti abituali ordinano via WhatsApp il mattino e ritirano all\'ora di pranzo. Zero chiamate, zero errori."'
                  : lang === 'en'
                  ? '"My regular customers order via WhatsApp in the morning and pick up at lunch. Zero calls, zero mistakes."'
                  : '"Mis clientes habituales piden por WhatsApp en la mañana y recogen al mediodía. Cero llamadas, cero errores."',
                stars: 5,
              },
            ].map((t, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100 h-full flex flex-col">
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.stars)].map((_, s) => (
                      <span key={s} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed flex-1 mb-8 text-sm italic">
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover border-2 border-emerald-100 shadow-sm"
                    />
                    <div>
                      <div className="font-black text-slate-900 text-sm">{t.name}</div>
                      <div className="text-slate-400 text-xs font-semibold">{t.role}</div>
                    </div>
                  </div>
                </div>
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
                            <span className={`text-sm font-bold ${isPro ? 'text-emerald-100' : 'text-slate-400'}`}>{lang === 'it' ? '/mese' : lang === 'en' ? '/mo' : '/mes'}</span>
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
                          €{annualTotal}{lang === 'it' ? '/anno' : lang === 'en' ? '/yr' : '/año'} · {lang === 'it' ? 'Risparmi' : lang === 'en' ? 'Save' : 'Ahorras'} €{savings}
                        </div>
                      )}
                      {billing === 'monthly' && price > 0 && (
                        <div className={`mt-2 text-[11px] font-semibold ${
                          isPro ? 'text-emerald-200' : 'text-slate-400'
                        }`}>
                          {lang === 'it' ? 'Alta gratuita' : lang === 'en' ? 'Free signup' : 'Alta gratis'}
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

                    {/* Botón acordeón */}
                    <button
                      onClick={() => setExpandedPricingPlan(expandedPricingPlan === plan.key ? null : plan.key)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold mb-3 transition-all border ${
                        isPro
                          ? 'border-white/20 text-white hover:bg-white/10'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {expandedPricingPlan === plan.key
                        ? (lang === 'it' ? 'Nascondi dettagli' : 'Ocultar detalle')
                        : (lang === 'it' ? 'Vedi tutto incluso' : 'Ver qué incluye')}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ transform: expandedPricingPlan === plan.key ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}>
                        <path d="M6 8L1 3h10z"/>
                      </svg>
                    </button>

                    {/* Panel expandible */}
                    {expandedPricingPlan === plan.key && plan.detalle && (
                      <div className={`rounded-2xl p-4 mb-4 space-y-4 text-left ${
                        isPro ? 'bg-emerald-700/60' : 'bg-slate-100'
                      }`}>
                        {plan.detalle.map((sec, si) => (
                          <div key={si}>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
                              isPro ? 'text-emerald-200' : 'text-emerald-600'
                            }`}>{sec.cat}</p>
                            <div className="space-y-2.5">
                              {sec.items.map((item, ii) => (
                                <div key={ii} className="flex gap-2.5 items-start">
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5 ${
                                    isPro ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                                  }`}>✓</span>
                                  <div>
                                    <p className={`text-[11px] font-bold leading-tight ${
                                      isPro ? 'text-white' : 'text-slate-800'
                                    }`}>{item.l}</p>
                                    <p className={`text-[10px] leading-snug mt-0.5 ${
                                      isPro ? 'text-emerald-200' : 'text-slate-500'
                                    }`}>{item.d}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

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
            {/* Scroll Hint + Nav Buttons (Mobile only) */}
            <div className="md:hidden flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => {
                  const el = document.getElementById('comparison-scroll')
                  if (el) el.scrollBy({ left: -220, behavior: 'smooth' })
                }}
                className="w-10 h-10 rounded-full bg-slate-200 hover:bg-emerald-100 flex items-center justify-center text-slate-600 font-black text-lg transition-all"
                aria-label="Anterior"
              >←</button>
              <span className="text-xs font-bold text-slate-400">
                {lang === 'it' ? 'Scorri per vedere i piani' : 'Desliza para ver más planes'}
              </span>
              <button
                onClick={() => {
                  const el = document.getElementById('comparison-scroll')
                  if (el) el.scrollBy({ left: 220, behavior: 'smooth' })
                }}
                className="w-10 h-10 rounded-full bg-slate-200 hover:bg-emerald-100 flex items-center justify-center text-slate-600 font-black text-lg transition-all"
                aria-label="Siguiente"
              >→</button>
            </div>

            <div className="rounded-[32px] overflow-hidden border border-slate-200 shadow-sm relative z-0">
              <div id="comparison-scroll" className="overflow-x-auto custom-scrollbar w-full">
                <div className="min-w-[800px]">
                  {/* Table Header Row */}
                  <div className="grid bg-slate-900 text-white" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr' }}>
                    <div className="p-6 font-black text-sm sticky left-0 z-20 bg-slate-900 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.5)]">
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
                  {comparisonRows.map((row, ri) => {
                    const rowBg = ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    return (
                      <div
                        key={ri}
                        className={`grid items-center text-sm ${rowBg}`}
                        style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr' }}
                      >
                        <div className={`p-4 pl-6 font-semibold text-slate-800 border-r border-slate-100 sticky left-0 z-10 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.08)] ${rowBg}`}>
                          {row.label}
                        </div>
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
                    )
                  })}

                  {/* Table Footer CTA Row */}
                  <div className="grid bg-slate-900" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr' }}>
                    <div className="p-4 sticky left-0 z-20 bg-slate-900 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.5)]" />
                    {pricingPlans.map((p) => (
                      <div key={p.key} className={`p-4 ${
                        p.popular ? 'bg-emerald-600' : ''
                      }`}>
                        <a
                          href={p.key === 'grow' ? '/contatti' : '/register'}
                          className={`block w-full py-2 px-2 rounded-xl font-black text-center text-[10px] leading-tight transition-all ${
                            p.popular
                              ? 'bg-white text-emerald-700'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500'
                          }`}
                        >
                          {p.key === 'gratis'
                            ? (lang === 'it' ? <span>Inizia<br/>gratis</span> : <span>Empezar<br/>gratis</span>)
                            : p.key === 'grow'
                              ? (lang === 'it' ? <span>Contattaci</span> : <span>Contactar</span>)
                              : (lang === 'it' ? <span>Inizia<br/>ora</span> : <span>Empezar<br/>ahora</span>)
                          }
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
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

                  <div className="flex flex-wrap gap-4 mb-6">
                    {[
                      lang === 'it' ? '✓ Design su misura' : '✓ Diseño a medida',
                      lang === 'it' ? '✓ SEO ottimizzato' : '✓ SEO optimizado',
                      lang === 'it' ? '✓ Hosting & dominio' : '✓ Hosting & dominio',
                      lang === 'it' ? '✓ Pannello di controllo' : '✓ Panel de control',
                      lang === 'it' ? '✓ Creazione del tuo negozio' : '✓ Creación de tu tienda',
                    ].map((f, i) => (
                      <span key={i} className="text-sm text-slate-300 font-semibold bg-slate-800 px-4 py-2 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Botón acordeón servicio web */}
                  <button
                    onClick={() => setShowWebDetail(!showWebDetail)}
                    className="flex items-center justify-center gap-2 w-full border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-slate-200 text-sm font-bold rounded-2xl py-3 px-5 transition-all bg-transparent"
                  >
                    {showWebDetail
                      ? (lang === 'it' ? 'Nascondi dettagli ▲' : 'Ocultar detalle ▲')
                      : (lang === 'it' ? 'Vedi tutto incluso ▼' : 'Ver qué incluye el servicio ▼')}
                  </button>

                  {/* Panel expandible */}
                  {showWebDetail && (
                    <div className="mt-6 flex flex-col gap-6">
                      {WEB_DETALLE_LANDING.map((sec, si) => (
                        <div key={si}>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3">
                            {sec.cat[lang] || sec.cat.es}
                          </p>
                          {sec.items.map((item, ii) => (
                            <div key={ii} className="flex gap-3 mb-3 items-start">
                              <span className="text-emerald-400 font-black text-xs mt-0.5 flex-shrink-0">✓</span>
                              <div>
                                <p className="m-0 text-sm font-bold text-slate-100 leading-tight">
                                  {item.l[lang] || item.l.es}
                                </p>
                                <p className="m-0 text-xs text-slate-400 leading-relaxed mt-0.5">
                                  {item.d[lang] || item.d.es}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Price card */}
                <div className="flex-shrink-0 w-full lg:w-auto">
                  <div className="bg-slate-900 border border-slate-700 rounded-[32px] p-8 min-w-[280px] text-center">

                    {/* One-time payment */}
                    <div className="mb-6 pb-6 border-b border-slate-700">
                      <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                        {lang === 'it' ? 'Investimento iniziale' : 'Inversión inicial'}
                      </div>
                      <div className="flex items-baseline gap-2 justify-center">
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
                      <div className="flex items-baseline gap-2 justify-center">
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
                      {lang === 'it' ? 'Senza impegno · Risposta in 24h' : lang === 'en' ? 'No commitment · Reply in 24h' : 'Sin compromiso · Respuesta en 24h'}
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
              {t('ctaFinalSubtitle').replace('{n}', storeCount)}
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
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">{lang === 'it' ? 'Piattaforma' : lang === 'en' ? 'Platform' : 'Plataforma'}</h4>
                <a href="/login" className="block hover:text-emerald-400 transition-colors font-semibold text-sm">{t('accedi')}</a>
                <a href="/register" className="block hover:text-emerald-400 transition-colors font-semibold text-sm">{t('ctaHeader')}</a>
                <a href="/blog" className="block hover:text-emerald-400 transition-colors font-semibold text-sm">Blog</a>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Legal</h4>
                <a href="/privacy" className="block hover:text-emerald-400 transition-colors font-semibold text-sm">{t('footerPrivacy')}</a>
                <a href="/terms" className="block hover:text-emerald-400 transition-colors font-semibold text-sm">{t('footerTerms')}</a>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">{lang === 'it' ? 'Supporto' : lang === 'en' ? 'Support' : 'Soporte'}</h4>
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
