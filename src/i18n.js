import { createContext, useContext, useState, useEffect } from "react"

// ===== CURRENCY CONVERSION RATES (approximate, based on EUR) =====
const RATES = {
  de: { symbol: "€", rate: 1, code: "EUR" },
  en: { symbol: "$", rate: 1.08, code: "USD" },
  ro: { symbol: "lei", rate: 4.97, code: "RON" },
  ru: { symbol: "₽", rate: 99.5, code: "RUB" },
}

// ===== ITEM NAME TRANSLATIONS =====
const itemNames = {
  de: {
    KÜCHE: "KÜCHE", TEPPICH: "TEPPICH", LAMPE: "LAMPE", STÜHLE: "STÜHLE",
    TISCH: "TISCH", VASE: "VASE", COUCH: "COUCH", WANDLAMPE: "WANDLAMPE",
    BETT: "BETT", SCHREIBTISCH: "SCHREIBTISCH", STUHL: "STUHL", MATTE: "MATTE",
    FENSTER: "FENSTER", REGAL: "REGAL", BODEN: "BODEN",
    ESSTISCH: "ESSTISCH", BELEUCHTUNG: "BELEUCHTUNG", BILD: "BILD", BLUMEN: "BLUMEN", SCHRANK: "SCHRANK",
    SOFA: "SOFA", SESSEL: "SESSEL", KISSEN: "KISSEN", COUCHTISCH: "COUCHTISCH",
    BÜCHERREGAL: "BÜCHERREGAL", STEHLAMPE: "STEHLAMPE", VORHANG: "VORHANG", HEIZUNG: "HEIZUNG",
    TOILETTE: "TOILETTE", SCHRANK: "SCHRANK", BADTEPPICH: "BADTEPPICH", FLASCHEN: "FLASCHEN",
    BILD: "BILD", PFLANZE: "PFLANZE", SPIEGEL: "SPIEGEL",
  },
  en: {
    KÜCHE: "KITCHEN", TEPPICH: "CARPET", LAMPE: "LAMP", STÜHLE: "CHAIRS",
    TISCH: "TABLE", VASE: "VASE", COUCH: "COUCH", WANDLAMPE: "WALL LAMP",
    BETT: "BED", SCHREIBTISCH: "DESK", STUHL: "CHAIR", MATTE: "MAT",
    FENSTER: "WINDOW", REGAL: "SHELF", BODEN: "FLOOR",
    ESSTISCH: "DINING TABLE", BELEUCHTUNG: "LIGHTING", BILD: "PAINTING", BLUMEN: "FLOWERS", SCHRANK: "CABINET",
    SOFA: "SOFA", SESSEL: "ARMCHAIR", KISSEN: "PILLOWS", COUCHTISCH: "COFFEE TABLE",
    BÜCHERREGAL: "BOOKSHELF", STEHLAMPE: "FLOOR LAMP", VORHANG: "CURTAIN", HEIZUNG: "RADIATOR",
    TOILETTE: "TOILET", SCHRANK: "CABINET", BADTEPPICH: "BATH RUG", FLASCHEN: "BOTTLES",
    BILD: "PAINTING", PFLANZE: "PLANT", SPIEGEL: "MIRROR",
  },
  ro: {
    KÜCHE: "BUCĂTĂRIE", TEPPICH: "COVOR", LAMPE: "LAMPĂ", STÜHLE: "SCAUNE",
    TISCH: "MASĂ", VASE: "VAZĂ", COUCH: "CANAPEA", WANDLAMPE: "APLICĂ",
    BETT: "PAT", SCHREIBTISCH: "BIROU", STUHL: "SCAUN", MATTE: "COVORAȘ",
    FENSTER: "FEREASTRĂ", REGAL: "RAFT", BODEN: "PODEA",
    ESSTISCH: "MASĂ DE DINING", BELEUCHTUNG: "ILUMINAT", BILD: "TABLOU", BLUMEN: "FLORI", SCHRANK: "DULAP",
    SOFA: "CANAPEA", SESSEL: "FOTOLIU", KISSEN: "PERNE", COUCHTISCH: "MĂSUȚĂ DE CAFEA",
    BÜCHERREGAL: "BIBLIOTECĂ", STEHLAMPE: "LAMPADAR", VORHANG: "PERDEA", HEIZUNG: "CALORIFER",
    TOILETTE: "TOALETĂ", SCHRANK: "DULAP", BADTEPPICH: "COVORAȘ DE BAIE", FLASCHEN: "STICLE",
    BILD: "TABLOU", PFLANZE: "PLANTĂ", SPIEGEL: "OGLINDĂ",
  },
  ru: {
    KÜCHE: "КУХНЯ", TEPPICH: "КОВЁР", LAMPE: "ЛАМПА", STÜHLE: "СТУЛЬЯ",
    TISCH: "СТОЛ", VASE: "ВАЗА", COUCH: "ДИВАН", WANDLAMPE: "БРА",
    BETT: "КРОВАТЬ", SCHREIBTISCH: "ПИСЬМЕННЫЙ СТОЛ", STUHL: "СТУЛ", MATTE: "КОВРИК",
    FENSTER: "ОКНО", REGAL: "ПОЛКА", BODEN: "ПОЛ",
    ESSTISCH: "ОБЕДЕННЫЙ СТОЛ", BELEUCHTUNG: "ОСВЕЩЕНИЕ", BILD: "КАРТИНА", BLUMEN: "ЦВЕТЫ", SCHRANK: "ШКАФ",
    SOFA: "ДИВАН", SESSEL: "КРЕСЛО", KISSEN: "ПОДУШКИ", COUCHTISCH: "ЖУРНАЛЬНЫЙ СТОЛИК",
    BÜCHERREGAL: "КНИЖНАЯ ПОЛКА", STEHLAMPE: "ТОРШЕР", VORHANG: "ШТОРА", HEIZUNG: "РАДИАТОР",
    TOILETTE: "ТУАЛЕТ", SCHRANK: "ШКАФ", BADTEPPICH: "КОВРИК ДЛЯ ВАННОЙ", FLASCHEN: "ФЛАКОНЫ",
    BILD: "КАРТИНА", PFLANZE: "РАСТЕНИЕ", SPIEGEL: "ЗЕРКАЛО",
  },
}

// ===== UI TRANSLATIONS =====
const translations = {
  de: {
    welcome: "Willkommen bei",
    tagline: "Entdecken Sie unsere handverlesene Kollektion hochwertiger Möbel und Einrichtungsgegenstände — modern, zeitlos und für jedes Zuhause.",
    rooms: "Unsere Räume",
    chooseRoom: "Wählen Sie Ihren Raum",
    discover: "Entdecken",
    kitchen: "Küche",
    kitchenDesc: "Moderne Küchenmöbel — Tische, Stühle, Lampen und mehr",
    living: "Wohnzimmer",
    livingDesc: "Stilvolle Sofas, Wandlampen und gemütliche Einrichtung",
    room: "Zimmer",
    roomDesc: "Ein gemütliches Zimmer — Bett, Schreibtisch, Regale und mehr",
    stat1: "Visualisierung",
    stat2: "Interaktiv",
    stat3: "Beste Preise",
    rights: "Alle Rechte vorbehalten",
    quality: "Qualität für Ihr Zuhause",
    more: "Mehr",
    back: "Zurück",
    list: "Liste",
    priceList: "Preisliste",
    close: "Schließen",
    switchCurrency: "Preise in € anzeigen",
    switchLocal: "Preise in € anzeigen",
    rotateHint: "Drehe für ein besseres Erlebnis",
    defaultTitle: "KÜCHE",
    defaultTitleLiving: "WOHNZIMMER",
    defaultTitleRoom: "ZIMMER",
    defaultTitleDining: "ESSZIMMER",
    defaultTitleCozy: "WOHNZIMMER",
    defaultTitleLoft: "BADEZIMMER",
    room1: "Zimmer",
    dining: "Dining Room Kitchen",
    diningDesc: "Esstisch, Stühle, Beleuchtung und stilvolle Dekoration",
    cozyLiving: "Gemütliches Wohnzimmer",
    cozyLivingDesc: "Sofa, Sessel, Couchtisch und gemütliche Dekoration",
    loftBedroom: "Modernes Badezimmer",
    loftBedroomDesc: "Toilette, Waschbecken, Spiegel und stilvolle Badausstattung",
    comingSoon: "Kommt bald — 3D-Erlebnis wird bald verfügbar sein.",
    aboutTitle: "Was wir tun",
    aboutDesc: "Wir gestalten Räume mit dynamischen 3D-Produkten, die Sie interaktiv erkunden können — Shopping wird zum Erlebnis.",
    feature1Title: "3D Raumgestaltung",
    feature1Desc: "Erkunden Sie Räume in vollständigem 3D — drehen, zoomen und interagieren Sie mit jedem Möbelstück.",
    feature2Title: "Dynamische Produkte",
    feature2Desc: "Jedes Produkt wird in Echtzeit gerendert. Tippen Sie darauf, um Preise und Details sofort zu sehen.",
    feature3Title: "Einfaches Shopping",
    feature3Desc: "Wählen Sie Ihre Lieblingsstücke direkt in der 3D-Szene und erhalten Sie den Gesamtpreis.",
    navHome: "Start",
    navAbout: "Über uns",
    navRooms: "Räume",
    cart: "Warenkorb",
    addToCart: "In den Warenkorb",
    removeFromCart: "Entfernen",
    cartEmpty: "Ihr Warenkorb ist leer",
    total: "Gesamt",
    clearCart: "Leeren",
    gallery: "Galerie",
    navGallery: "Galerie",
    impressum: "Impressum",
    datenschutz: "Datenschutz",
    impressumTitle: "Impressum",
    impressumText: "Dies ist ein privates, nicht-kommerzielles Projekt. Dieses Projekt darf frei verwendet und weiterverarbeitet werden — nur mit meiner ausdrücklichen Zustimmung oder einem Verweis auf den Autor.",
    datenschutzTitle: "Datenschutz",
    datenschutzText: "Diese Anwendung speichert keine personenbezogenen Daten auf Servern. Spracheinstellungen und Warenkorb werden lokal im Browser (localStorage) gespeichert. Es werden keine Cookies zu Tracking-Zwecken verwendet.",
    projectNote: "Privates Projekt — nicht zur kommerziellen Nutzung bestimmt.",
    darkMode: "Dunkel",
    lightMode: "Hell",
    theme: "Design",
  },
  en: {
    welcome: "Welcome to",
    tagline: "Discover our hand-picked collection of premium furniture and home accessories — modern, timeless and for every home.",
    rooms: "Our Rooms",
    chooseRoom: "Choose Your Room",
    discover: "Discover",
    kitchen: "Kitchen",
    kitchenDesc: "Modern kitchen furniture — tables, chairs, lamps and more",
    living: "Living Room",
    livingDesc: "Stylish sofas, wall lamps and cozy furnishings",
    room: "Room",
    roomDesc: "A cozy room — bed, desk, shelves and more",
    stat1: "Visualization",
    stat2: "Interactive",
    stat3: "Best Prices",
    rights: "All rights reserved",
    quality: "Quality for your home",
    more: "More",
    back: "Back",
    list: "List",
    priceList: "Price List",
    close: "Close",
    switchCurrency: "Show prices in $",
    switchLocal: "Show prices in $",
    rotateHint: "Rotate for better experience",
    defaultTitleDining: "DINING ROOM",
    defaultTitleCozy: "LIVING ROOM",
    defaultTitleLoft: "BATHROOM",
    room1: "Room",
    dining: "Dining Room Kitchen",
    diningDesc: "Dining table, chairs, lighting and stylish decoration",
    cozyLiving: "Cozy Living Room",
    cozyLivingDesc: "Sofa, armchair, coffee table and cozy decoration",
    loftBedroom: "Modern Bathroom",
    loftBedroomDesc: "Toilet, cabinet, mirror and stylish bathroom furnishings",
    comingSoon: "Coming soon — 3D experience will be available soon.",
    room1: "Room",
    dining: "Dining Room Kitchen",
    diningDesc: "Dining table, chairs, lighting and stylish decoration",
    aboutTitle: "What we do",
    aboutDesc: "We design spaces with dynamic 3D products you can explore interactively — turning shopping into an experience.",
    feature1Title: "3D Room Design",
    feature1Desc: "Explore rooms in full 3D — rotate, zoom and interact with every piece of furniture.",
    feature2Title: "Dynamic Products",
    feature2Desc: "Every product is rendered in real-time. Tap to see prices and details instantly.",
    feature3Title: "Easy Shopping",
    feature3Desc: "Pick your favorite pieces directly in the 3D scene and get the total price.",
    navHome: "Home",
    navAbout: "About",
    navRooms: "Rooms",
    cart: "Cart",
    addToCart: "Add to Cart",
    removeFromCart: "Remove",
    cartEmpty: "Your cart is empty",
    total: "Total",
    clearCart: "Clear",
    gallery: "Gallery",
    navGallery: "Gallery",
    impressum: "Imprint",
    datenschutz: "Privacy",
    impressumTitle: "Imprint",
    impressumText: "This is a private, non-commercial project. This project may be freely used and adapted — only with my explicit consent or a reference to the author.",
    datenschutzTitle: "Privacy Policy",
    datenschutzText: "This application does not store personal data on servers. Language settings and shopping cart are stored locally in the browser (localStorage). No cookies are used for tracking purposes.",
    projectNote: "Private project — not intended for commercial use.",
    darkMode: "Dark",
    lightMode: "Light",
    theme: "Theme",
  },
  ro: {
    welcome: "Bine ați venit la",
    tagline: "Descoperiți colecția noastră de mobilier și accesorii de înaltă calitate — modern, atemporal și pentru fiecare casă.",
    rooms: "Camerele noastre",
    chooseRoom: "Alegeți camera",
    discover: "Descoperă",
    kitchen: "Bucătărie",
    kitchenDesc: "Mobilier modern de bucătărie — mese, scaune, lămpi și multe altele",
    living: "Living",
    livingDesc: "Canapele elegante, aplice și amenajări confortabile",
    room: "Cameră",
    roomDesc: "O cameră confortabilă — pat, birou, rafturi și multe altele",
    stat1: "Vizualizare",
    stat2: "Interactiv",
    stat3: "Cele mai bune prețuri",
    rights: "Toate drepturile rezervate",
    quality: "Calitate pentru casa ta",
    more: "Mai mult",
    back: "Înapoi",
    list: "Listă",
    priceList: "Lista de prețuri",
    close: "Închide",
    switchCurrency: "Schimbă prețurile în lei",
    switchLocal: "Schimbă prețurile în lei",
    rotateHint: "Rotește pentru o experiență mai bună",
    defaultTitleDining: "SUFRAGERIE",
    defaultTitleCozy: "LIVING CONFORTABIL",
    defaultTitleLoft: "BAIE MODERNĂ",
    room1: "Cameră",
    dining: "Dining Room Kitchen",
    diningDesc: "Masă de dining, scaune, iluminat și decorațiuni elegante",
    cozyLiving: "Living Confortabil",
    cozyLivingDesc: "Canapea, fotoliu, măsuță de cafea și decorațiuni confortabile",
    loftBedroom: "Baie Modernă",
    loftBedroomDesc: "Toaletă, dulap, oglindă și mobilier elegant de baie",
    comingSoon: "În curând — experiența 3D va fi disponibilă în curând.",
    room1: "Cameră",
    dining: "Dining Room Kitchen",
    diningDesc: "Masă de dining, scaune, iluminat și decorațiuni elegante",
    aboutTitle: "Ce facem noi",
    aboutDesc: "Creăm spații cu produse 3D dinamice pe care le poți explora interactiv — shopping-ul devine o experiență.",
    feature1Title: "Design 3D al camerelor",
    feature1Desc: "Explorați camerele în 3D complet — rotiți, apropiați și interacționați cu fiecare piesă de mobilier.",
    feature2Title: "Produse dinamice",
    feature2Desc: "Fiecare produs este redat în timp real. Atingeți pentru a vedea prețurile și detaliile instant.",
    feature3Title: "Shopping simplu",
    feature3Desc: "Alegeți piesele preferate direct în scena 3D și obțineți prețul total.",
    navHome: "Acasă",
    navAbout: "Despre",
    navRooms: "Camere",
    cart: "Coș",
    addToCart: "Adaugă în coș",
    removeFromCart: "Elimină",
    cartEmpty: "Coșul tău este gol",
    total: "Total",
    clearCart: "Golește",
    gallery: "Galerie",
    navGallery: "Galerie",
    impressum: "Impressum",
    datenschutz: "Confidențialitate",
    impressumTitle: "Impressum",
    impressumText: "Acesta este un proiect privat, necomercial. Acest proiect poate fi utilizat și prelucrat liber — doar cu acordul meu explicit sau cu menționarea autorului.",
    datenschutzTitle: "Confidențialitate",
    datenschutzText: "Această aplicație nu stochează date personale pe servere. Setările de limbă și coșul de cumpărături sunt salvate local în browser (localStorage). Nu se folosesc cookie-uri pentru urmărire.",
    projectNote: "Proiect privat — nu este destinat utilizării comerciale.",
    darkMode: "Întunecat",
    lightMode: "Luminos",
    theme: "Temă",
  },
  ru: {
    welcome: "Добро пожаловать в",
    tagline: "Откройте для себя нашу коллекцию высококачественной мебели и аксессуаров для дома — современных, вневременных и для каждого дома.",
    rooms: "Наши комнаты",
    chooseRoom: "Выберите комнату",
    discover: "Открыть",
    kitchen: "Кухня",
    kitchenDesc: "Современная кухонная мебель — столы, стулья, лампы и многое другое",
    living: "Гостиная",
    livingDesc: "Стильные диваны, настенные светильники и уютная обстановка",
    room: "Комната",
    roomDesc: "Уютная комната — кровать, письменный стол, полки и многое другое",
    stat1: "Визуализация",
    stat2: "Интерактив",
    stat3: "Лучшие цены",
    rights: "Все права защищены",
    quality: "Качество для вашего дома",
    more: "Ещё",
    back: "Назад",
    list: "Список",
    priceList: "Прайс-лист",
    close: "Закрыть",
    switchCurrency: "Показать цены в ₽",
    switchLocal: "Показать цены в ₽",
    rotateHint: "Поверните для лучшего опыта",
    defaultTitleDining: "СТОЛОВАЯ",
    defaultTitleCozy: "ГОСТИНАЯ",
    defaultTitleLoft: "ВАННАЯ КОМНАТА",
    room1: "Комната",
    dining: "Dining Room Kitchen",
    diningDesc: "Обеденный стол, стулья, освещение и стильный декор",
    cozyLiving: "Уютная гостиная",
    cozyLivingDesc: "Диван, кресло, журнальный столик и уютный декор",
    loftBedroom: "Современная ванная",
    loftBedroomDesc: "Туалет, шкаф, зеркало и стильная сантехника",
    comingSoon: "Скоро — 3D-интерфейс будет доступен в ближайшее время.",
    room1: "Комната",
    dining: "Dining Room Kitchen",
    diningDesc: "Обеденный стол, стулья, освещение и стильный декор",
    aboutTitle: "Что мы делаем",
    aboutDesc: "Мы создаём пространства с динамическими 3D-продуктами, которые вы можете исследовать интерактивно — шопинг становится впечатлением.",
    feature1Title: "3D дизайн комнат",
    feature1Desc: "Исследуйте комнаты в полном 3D — вращайте, приближайте и взаимодействуйте с каждым предметом мебели.",
    feature2Title: "Динамические продукты",
    feature2Desc: "Каждый продукт отображается в реальном времени. Нажмите, чтобы увидеть цены и детали мгновенно.",
    feature3Title: "Простой шопинг",
    feature3Desc: "Выбирайте любимые предметы прямо в 3D-сцене и получайте итоговую цену.",
    navHome: "Главная",
    navAbout: "О нас",
    navRooms: "Комнаты",
    cart: "Корзина",
    addToCart: "В корзину",
    removeFromCart: "Удалить",
    cartEmpty: "Ваша корзина пуста",
    total: "Итого",
    clearCart: "Очистить",
    gallery: "Галерея",
    navGallery: "Галерея",
    impressum: "Импрессум",
    datenschutz: "Конфиденциальность",
    impressumTitle: "Импрессум",
    impressumText: "Это частный, некоммерческий проект. Этот проект может свободно использоваться и перерабатываться — только с моего явного согласия или ссылкой на автора.",
    datenschutzTitle: "Конфиденциальность",
    datenschutzText: "Это приложение не хранит персональные данные на серверах. Языковые настройки и корзина сохраняются локально в браузере (localStorage). Файлы cookie для отслеживания не используются.",
    projectNote: "Частный проект — не предназначен для коммерческого использования.",
    darkMode: "Тёмная",
    lightMode: "Светлая",
    theme: "Тема",
  },
}

const langLabels = { de: "Deutsch", en: "English", ro: "Română", ru: "Русский" }
const langFlags = { de: "DE", en: "EN", ro: "RO", ru: "RU" }

// ===== CONTEXT =====
const LangContext = createContext()
const ThemeContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("haushalt-lang") || "de")
  const [theme, setTheme] = useState(() => localStorage.getItem("haushalt-theme") || "light")
  useEffect(() => { localStorage.setItem("haushalt-lang", lang) }, [lang])
  useEffect(() => { localStorage.setItem("haushalt-theme", theme) }, [theme])
  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light")
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </LangContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be inside LangProvider")
  return ctx
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be inside LangProvider")
  return ctx
}

export function useTranslations() {
  const { lang } = useLang()
  return translations[lang]
}

export function useItemName(internalName) {
  const { lang } = useLang()
  if (!internalName) return null
  return itemNames[lang]?.[internalName] || internalName
}

export function useCurrency() {
  const { lang } = useLang()
  return RATES[lang] || RATES.de
}

/** Convert EUR price to current language currency */
export function useConvertPrice(eurPrice) {
  const { rate } = useCurrency()
  return Math.round(eurPrice * rate)
}

export { translations, itemNames, RATES, langLabels, langFlags }
