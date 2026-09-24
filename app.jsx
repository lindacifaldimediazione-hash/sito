/* global React, ReactDOM, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakSelect, TweakColor, TweakButton */

const { useState, useEffect } = React;

const TWEAK_BASE = /*EDITMODE-BEGIN*/{
  "palette": "custom",
  "heroVariant": "split",
  "font": "Carlito",
  "customBg": "#ffffff",
  "customPrimary": "#2986ff",
  "customAccent": "#515c5d",
  "ctaColor": "#4c86bd",
  "bandOdd": "#ffffff",
  "bandEven": "#ffffff",
  "logoBlue": "#0F3BAE",
  "logoGold": "#C89A3F"
} /*EDITMODE-END*/;

const STORAGE_KEY = 'linda_tweaks_v7';
const TWEAK_DEFAULTS = (() => {
  // Standalone/published build: always use the colours baked into TWEAK_BASE,
  // never values left in a visitor's browser storage.
  if (window.__resources) return TWEAK_BASE;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...TWEAK_BASE, ...stored };
  } catch {return TWEAK_BASE;}
})();

/* Pick black-ish or white-ish text depending on how dark the CTA colour is */
function ctaTextFor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#FBF8F2';
  const n = parseInt(m[1], 16);
  const r = n >> 16 & 255,g = n >> 8 & 255,b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? '#2C2E2B' : '#FBF8F2';
}

/* LogoMark comes from logo.jsx */

/* ===== Icons (small, calm) ===== */
const Icon = {
  arrow: (p) =>
  <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>,

  heart: (p) =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>,

  users: (p) =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>,

  scale: (p) =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M12 3v18M5 8l7-3 7 3M3 14a4 4 0 0 0 8 0L7 5l-4 9zM13 14a4 4 0 0 0 8 0l-4-9-4 9z" />
    </svg>,

  clock: (p) =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>,

  child: (p) =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <circle cx="12" cy="6" r="3" />
      <path d="M9 22v-5l-2-3 5-3 5 3-2 3v5" />
    </svg>,

  home: (p) =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M3 11l9-8 9 8M5 10v10h14V10" />
    </svg>,

  leaf: (p) =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M11 20A7 7 0 0 1 4 13c0-7 9-9 16-9 0 7-2 16-9 16zM4 20l9-9" />
    </svg>,

  mail: (p) =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>,

  phone: (p) =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>,

  pin: (p) =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>,

  check: (p) =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>

};

/* ===== Photo placeholders — Unsplash ===== */
const __R = window.__resources || {};
const PHOTOS = {
  hero: __R.heroImg || "img/linda-studio.webp",
  about: __R.aboutImg || "img/linda-ritratto.webp"
};

const SECTIONS = ['chi-sono', 'servizi', 'mediazione', 'principi', 'quando-rivolgersi', 'testimonianze', 'contatti'];
const NAV_ITEMS = [
{ id: 'chi-sono', label: 'Chi sono' },
{ id: 'mediazione', label: 'Mediazione' },
{ id: 'quando-rivolgersi', label: 'Quando rivolgersi' },
{ id: 'contatti', label: 'Contatti' }];


/* ===== Nav ===== */
function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  // Active menu item tracked with IntersectionObserver — no scroll listener.
  useEffect(() => {
    const seen = new Map();
    const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = '',ratio = 0;
      SECTIONS.forEach((id) => {const r = seen.get(id) || 0;if (r > ratio) {ratio = r;best = id;}});
      if (best) setActive(best);
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    SECTIONS.forEach((id) => {const el = document.getElementById(id);if (el) obs.observe(el);});
    return () => obs.disconnect();
  }, []);

  // Close the mobile menu, jump, then move keyboard focus to the section.
  const goTo = (id) => (e) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 96;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#' + id);
    window.setTimeout(() => el.focus({ preventScroll: true }), reduce ? 0 : 420);
  };

  return (
    <header className="nav">
      <a className="skip-link" href="#contenuto">Salta al contenuto</a>
      <div className="nav-inner">
        <a href="#inizio" className="logo" onClick={goTo('inizio')} aria-label="Dott.ssa Linda Cifaldi — torna all'inizio">
          <LogoMark size={42} />
          <span className="logo-name">Dott.ssa Linda Cifaldi</span>
        </a>
        <nav id="menu-principale" className={`nav-links${open ? ' is-open' : ''}`} aria-label="Menu principale">
          {NAV_ITEMS.map((it) =>
          <a key={it.id} href={`#${it.id}`} onClick={goTo(it.id)} aria-current={active === it.id ? 'true' : undefined}>{it.label}</a>
          )}
        </nav>
        <a href="#contatti" className="nav-cta" onClick={goTo('contatti')}>Primo colloquio</a>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="menu-principale"
          aria-label={open ? 'Chiudi il menu' : 'Apri il menu'}
          onClick={() => setOpen((v) => !v)}>

          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            {open ?
            <path d="M6 6l12 12M18 6L6 18" /> :
            <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>
    </header>);

}

/* ===== Hero ===== */
function Hero({ variant }) {
  return (
    <section className="hero" data-variant={variant} id="inizio" tabIndex={-1} aria-label="Presentazione">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-text">
            <LogoMark className="section-mark" size={72} />
            <span className="eyebrow hero-eyebrow">Studio mediazione familiare · Roma · Online</span>
            <h1 className="sr-only">Dott.ssa Linda Cifaldi, pedagogista e mediatrice familiare a Roma</h1>
            <p className="hero-headline">
              <span style={{ color: '#26322F' }}>Riportare il dialogo</span><br />
              dove sembrava <em>impossibile.</em>
            </p>
            <p className="hero-lede">
              Mediazione, relazione e strumenti espressivi per favorire ascolto,
              consapevolezza e cambiamento.
            </p>
            <p className="hero-lede">
              Credo che ogni individuo ed ogni famiglia possieda risorse e possibilità
              di evoluzione: il mio contributo consiste nell'accompagnarle affinché
              possano riconoscerle e trasformarle in nuove opportunità di benessere.
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn btn-primary">
                Prenota un primo colloquio
                <Icon.arrow className="btn-arrow" />
              </a>
            </div>
          </div>
          <div className="hero-image">
            <img className="soft-edge" src={PHOTOS.hero} width="1400" height="1137" decoding="async" alt="La Dott.ssa Linda Cifaldi nel suo studio di mediazione familiare a Roma" />
          </div>
        </div>
      </div>
    </section>);

}

/* ===== About ===== */
function About() {
  return (
    <section className="about" id="chi-sono" data-band="odd" tabIndex={-1} aria-labelledby="chi-sono-titolo">
      <div className="container">
        <div className="about-grid">
          <div className="about-image">
            <img className="soft-edge" src={PHOTOS.about} width="753" height="1024" loading="lazy" decoding="async" alt="Ritratto della Dott.ssa Linda Cifaldi, pedagogista e mediatrice familiare" />
          </div>
          <div className="about-content">
            <LogoMark className="section-mark" size={46} />
            <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>Chi sono</span>
            <h2 id="chi-sono-titolo">Competenza professionale, ascolto e attenzione alle relazioni.</h2>
            <p>
              Sono pedagogista e mediatrice familiare e da oltre vent'anni opero nei
              contesti sanitari e socio-educativi, accompagnando persone, coppie e
              famiglie nei momenti di cambiamento e complessità relazionale:
              separazioni, conflitti generazionali, eredità e riorganizzazioni familiari.
            </p>
            <p>
              Attraverso percorsi di gestione alternativa del conflitto, supporto alla
              genitorialità e Parent Training, integro mediazione familiare, pedagogia e
              strumenti teatrali per favorire consapevolezza, dialogo e costruzione di
              nuovi equilibri.
            </p>
            <p>
              Nel 2011 ho fondato un'associazione dedicata a progetti formativi e di
              prevenzione per il benessere di adulti, bambini e ragazzi. Ho inoltre svolto
              attività di docenza e formazione specialistica, pubblicando contributi in
              ambito sanitario e riabilitativo, con particolare attenzione alla
              teatro-terapia.
            </p>
            <p className="quote">
              Credo nella possibilità di ogni persona e di ogni famiglia di riconoscere
              le proprie risorse, affrontare il cambiamento e costruire nuove
              possibilità di benessere.
            </p>
            <div className="about-creds">
              <div>
                <div className="label">Nome</div>
                <div className="value">Dott.ssa Linda Cifaldi</div>
              </div>
              <div>
                <div className="label">Formazione</div>
                <div className="value">Università di Roma Tre</div>
              </div>
              <div>
                <div className="label">Specializzazione</div>
                <div className="value">Mediazione familiare</div>
              </div>
              <div>
                <div className="label">Albo</div>
                <div className="value">EP N°212</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}

/* ===== I Servizi ===== */
function Services() {
  const items = [
  { I: Icon.users, h: "Mediazione familiare", p: "Uno spazio di confronto e dialogo per accompagnare le famiglie nei momenti di cambiamento e favorire una comunicazione pi\u00f9 efficace." },
  { I: Icon.child, h: "Parent Training", p: "Interventi rivolti ai genitori finalizzati allo sviluppo di strategie educative efficaci, alla gestione delle difficolt\u00e0 quotidiane e al rafforzamento delle competenze genitoriali." },
  { I: Icon.scale, h: "Coordinamento genitoriale", p: "Un percorso orientato a sostenere la collaborazione tra genitori e a promuovere decisioni condivise nell'interesse dei figli." },
  { I: Icon.heart, h: "Supporto alla genitorialit\u00e0", p: "Percorsi di accompagnamento rivolti ai genitori per valorizzare risorse educative e competenze relazionali." }];

  return (
    <section className="services" id="servizi" data-band="even" tabIndex={-1} aria-labelledby="servizi-titolo">
      <div className="container">
        <div className="section-head">
          <div>
            <LogoMark className="section-mark" size={46} />
            <span className="eyebrow">I servizi</span>
            <h2 id="servizi-titolo">Percorsi su misura per persone e famiglie</h2>
          </div>
          <p>
            Quattro ambiti di intervento che integrano mediazione familiare,
            pedagogia e strumenti espressivi.
          </p>
        </div>
        <div className="when-grid grid-2">
          {items.map((it, i) => {
            const I = it.I;
            return (
              <div className="when-card" key={i}>
                <I className="icon" aria-hidden="true" />
                <h3>{it.h}</h3>
                <p>{it.p}</p>
              </div>);

          })}
        </div>
      </div>
    </section>);

}

/* ===== Mediazione ===== */
function Service() {
  const rivolta = [
  "Famiglie, genitori e figli",
  "Coppie in fase di separazione",
  "Genitori che vogliono tutelare il benessere dei figli",
  "Famiglie con difficolt\u00e0 comunicative o relazionali",
  "Ex partner che desiderano trovare accordi sereni"];

  const perche = [
  "Ridurre conflitti e tensioni",
  "Migliorare il dialogo",
  "Proteggere il benessere dei figli",
  "Trovare soluzioni condivise e durature",
  "Evitare lunghi contenziosi legali"];

  return (
    <section className="service" id="mediazione" data-band="odd" tabIndex={-1} aria-labelledby="mediazione-titolo">
      <div className="container">
        <div className="section-head">
          <div>
            <LogoMark className="section-mark" size={46} />
            <span className="eyebrow">Mediazione</span>
            <h2 id="mediazione-titolo">Cos'è la mediazione familiare</h2>
          </div>
          <p>
            È un metodo che aiuta a gestire i conflitti, migliorare il dialogo
            e ridefinire le relazioni.
          </p>
        </div>

        <div className="blobs">
          <div className="blob blob-a">
            <h3>Il percorso</h3>
            <p>Strutturato per ritrovare un canale di comunicazione e costruire accordi sostenibili.</p>
          </div>
          <div className="blob blob-b">
            <h3>L'approccio</h3>
            <p>Non offro giudizi né soluzioni preconfezionate: creo le condizioni perché siate voi, insieme, a trovare un nuovo equilibrio.</p>
          </div>
          <div className="blob blob-c">
            <h3>A chi è rivolta</h3>
            <ul>{rivolta.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
          <div className="blob blob-d">
            <h3>Perché farla</h3>
            <ul>{perche.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>);

}

/* ===== I Principi ===== */
function Principles() {
  const features = [
  { h: "Spazio neutro", p: "Un luogo terzo dove tutti hanno lo stesso diritto di parola." },
  { h: "Riservatezza", p: "Uno spazio protetto in cui potersi confrontare con rispetto." },
  { h: "Volontariet\u00e0", p: "La mediazione \u00e8 un percorso scelto e costruito insieme." },
  { h: "Centralit\u00e0 dei figli", p: "Quando ci sono minori, il loro benessere guida le decisioni." }];

  return (
    <section className="principles" id="principi" data-band="even" tabIndex={-1} aria-labelledby="principi-titolo">
      <div className="container">
        <div className="section-head center">
          <div>
            <LogoMark className="section-mark" size={46} />
            <span className="eyebrow">I principi</span>
            <h2 id="principi-titolo" className="sr-only">I principi della mediazione familiare</h2>
          </div>
          <p>
            Ci sono momenti in cui il dialogo si interrompe e trovare un accordo
            diventa difficile. La mediazione offre uno spazio neutrale per
            ascoltarsi, chiarire i bisogni e affrontare ciò che sta cambiando.
          </p>
        </div>
        <div className="princ-grid">
          {features.map((f, i) =>
          <div className="what-feat" key={i}>
              <h3>{f.h}</h3>
              <p>{f.p}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ===== Quando rivolgersi ===== */
function When() {
  const items = [
  { I: Icon.heart, h: "Separazione e divorzio", p: "Per affrontare le decisioni della separazione con maggiore chiarezza, soprattutto quando \u00e8 difficile trovare un punto d'incontro." },
  { I: Icon.child, h: "Genitorialit\u00e0 condivisa", p: "Per continuare a essere genitori insieme, anche quando la relazione di coppia \u00e8 cambiata." },
  { I: Icon.users, h: "Conflitti tra generazioni", p: "Quando visioni, aspettative e bisogni diversi tra genitori e figli adulti rendono difficile comunicare." },
  { I: Icon.home, h: "Eredit\u00e0 e successioni", p: "Per affrontare le questioni legate a un'eredit\u00e0 senza lasciare che le differenze diventino fratture familiari." },
  { I: Icon.scale, h: "Crisi e difficolt\u00e0 di coppia", p: "Quando il dialogo si \u00e8 interrotto e pu\u00f2 essere utile uno spazio neutrale per provare a ritrovarlo." },
  { I: Icon.leaf, h: "Assistenza dei familiari", p: "Quando bisogna decidere insieme come prendersi cura di un genitore o di una persona cara e le posizioni diventano diverse." }];

  return (
    <section className="when" id="quando-rivolgersi" data-band="odd" tabIndex={-1} aria-labelledby="quando-titolo">
      <div className="container">
        <div className="section-head">
          <div>
            <LogoMark className="section-mark" size={46} />
            <span className="eyebrow">Quando rivolgersi</span>
            <h2 id="quando-titolo">Quando la mediazione può aiutare</h2>
          </div>
        </div>
        <div className="when-grid">
          {items.map((it, i) => {
            const I = it.I;
            return (
              <div className="when-card" key={i}>
                <I className="icon" aria-hidden="true" />
                <h3>{it.h}</h3>
                <p>{it.p}</p>
              </div>);

          })}
        </div>
      </div>
    </section>);

}



/* ===== Testimonials ===== */
function Testimonials() {
  const t = [
  {
    q: "Siamo arrivati con la sensazione che non ci fosse pi\u00f9 nulla da dirsi. Ne siamo usciti con un accordo e con un rispetto reciproco che pensavamo di aver perso.",
    who: "M. e P.",
    ctx: "Separazione consensuale"
  },
  {
    q: "La mediazione non ha cancellato il passato, ma ci ha permesso di smettere di portarlo come un peso.",
    who: "Carlotta R.",
    ctx: "Mediazione genitore-figlio"
  },
  {
    q: "Pensavo che l'eredit\u00e0 di nostra madre ci avrebbe divisi per sempre. Avere una persona terza che teneva il filo del discorso ci ha permesso di decidere insieme, senza rancore.",
    who: "Famiglia T.",
    ctx: "Successione tra fratelli"
  },
  {
    q: "Non riuscivamo a parlare di nostro figlio senza litigare. Dopo qualche incontro abbiamo scritto insieme un calendario che finalmente funziona per tutti e tre.",
    who: "S. e D.",
    ctx: "Coordinamento genitoriale"
  }];

  return (
    <section className="testimonials" id="testimonianze" data-band="even" tabIndex={-1} aria-labelledby="testimonianze-titolo">
      <div className="container">
        <div className="section-head">
          <div>
            <LogoMark className="section-mark" size={46} />
            <span className="eyebrow">Testimonianze</span>
            <h2 id="testimonianze-titolo">Le parole di chi ha fatto un percorso.</h2>
          </div>
          <p>
            I nomi sono modificati per tutela della riservatezza. Ogni
            testimonianza è stata condivisa con consenso esplicito.
          </p>
        </div>
        <div className="testi-grid testi-grid-2">
          {t.map((x, i) =>
          <div className="testi" key={i}>
              <blockquote>{x.q}</blockquote>
              <cite>
                <strong>{x.who}</strong>
                {x.ctx}
              </cite>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ===== Contact ===== */
function Contact() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ nome: "", email: "", tel: "", msg: "", privacy: false, website: "" });

  const update = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((x) => {const n = { ...x };delete n[k];return n;});
  };

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Inserisci il tuo nome e cognome.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim())) e.email = 'Inserisci un indirizzo email valido.';
    if (!form.msg.trim()) e.msg = 'Scrivi un breve messaggio.';
    if (!form.privacy) e.privacy = 'Per inviare la richiesta è necessario il consenso al trattamento dei dati.';
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    if (form.website) return; // honeypot: silently drop bot submissions
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      const first = document.getElementById(Object.keys(found)[0]);
      if (first) first.focus();
      return;
    }
    setSent(true);
  };

  const errorCount = Object.keys(errors).length;

  return (
    <section className="contact" id="contatti" data-band="odd" tabIndex={-1} aria-labelledby="contatti-titolo">
      <div className="container">
        <div className="contact-grid">
          <div className="contact-side">
            <LogoMark className="section-mark" size={46} />
            <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>Scrivimi</span>
            <h2 id="contatti-titolo">Il primo passo è una conversazione.</h2>
            <p>
              Compila il modulo o scrivimi direttamente. Se desideri ricevere
              informazioni o fissare un primo colloquio conoscitivo, sarò lieta
              di accompagnarti nell'individuazione del percorso più adatto.
            </p>
            <div className="contact-detail">
              <Icon.mail className="ico" aria-hidden="true" />
              <div>
                <div className="label">Email</div>
                <div className="value"><a href="mailto:linda.cifaldi@live.it">linda.cifaldi@live.it</a></div>
              </div>
            </div>
            <div className="contact-detail">
              <Icon.phone className="ico" aria-hidden="true" />
              <div>
                <div className="label">Telefono</div>
                <div className="value"><a href="tel:+393294155464">+39 329 4155464</a></div>
              </div>
            </div>
            <div className="contact-detail">
              <Icon.pin className="ico" aria-hidden="true" />
              <div>
                <div className="label">Studio</div>
                <div className="value">Online e in presenza (San Giovanni – Prati)</div>
              </div>
            </div>
          </div>

          {sent ?
          <div className="contact-form" style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
              <div className="form-success" role="status" aria-live="polite">
                <Icon.check style={{ width: 24, height: 24, color: 'var(--primary-deep)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <div>
                  <strong style={{ display: 'block', fontSize: 16, marginBottom: 6 }}>Grazie {form.nome.split(' ')[0] || ''}.</strong>
                  Ho ricevuto la tua richiesta. Ti scrivo personalmente entro
                  24 ore lavorative all'indirizzo {form.email}.
                </div>
              </div>
              <button className="btn btn-ghost" type="button" onClick={() => {setSent(false);setErrors({});setForm({ nome: '', email: '', tel: '', msg: '', privacy: false, website: '' });}} style={{ alignSelf: 'flex-start' }}>
                Invia un altro messaggio
              </button>
            </div> :

          <form className="contact-form" onSubmit={submit} noValidate aria-labelledby="contatti-titolo">
              <p className="form-status sr-only" role="alert" aria-live="assertive">
                {errorCount ? `Il modulo contiene ${errorCount} ${errorCount === 1 ? 'errore' : 'errori'}. Controlla i campi segnalati.` : ''}
              </p>
              <div className="field">
                <label htmlFor="nome">Nome e cognome</label>
                <input id="nome" name="nome" type="text" autoComplete="name" required value={form.nome} onChange={update('nome')} placeholder="Maria Rossi"
              aria-invalid={errors.nome ? 'true' : undefined} aria-describedby={errors.nome ? 'nome-err' : undefined} />
                {errors.nome && <span className="field-error" id="nome-err">{errors.nome}</span>}
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update('email')} placeholder="maria@email.it"
                aria-invalid={errors.email ? 'true' : undefined} aria-describedby={errors.email ? 'email-err' : undefined} />
                  {errors.email && <span className="field-error" id="email-err">{errors.email}</span>}
                </div>
                <div className="field">
                  <label htmlFor="tel">Telefono <span className="opt">(facoltativo)</span></label>
                  <input id="tel" name="tel" type="tel" autoComplete="tel" value={form.tel} onChange={update('tel')} placeholder="+39 ..." />
                </div>
              </div>
              <div className="field">
                <label htmlFor="msg">Messaggio</label>
                <textarea id="msg" name="messaggio" required value={form.msg} onChange={update('msg')} placeholder="Raccontami brevemente di cosa avresti bisogno. Non serve scendere nei dettagli."
              aria-invalid={errors.msg ? 'true' : undefined} aria-describedby={errors.msg ? 'msg-err' : undefined}></textarea>
                {errors.msg && <span className="field-error" id="msg-err">{errors.msg}</span>}
              </div>
              <div className="hp-field" aria-hidden="true">
                <label htmlFor="website">Non compilare questo campo</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
              </div>
              <div className="field">
                <label className="checkbox" htmlFor="privacy">
                  <input id="privacy" name="privacy" type="checkbox" checked={form.privacy} onChange={update('privacy')}
                aria-invalid={errors.privacy ? 'true' : undefined} aria-describedby={errors.privacy ? 'privacy-err' : undefined} />
                  <span>
                    Ho letto l'<a href="#">informativa sulla privacy</a> e
                    acconsento al trattamento dei dati per la sola finalità di
                    rispondere alla mia richiesta.
                  </span>
                </label>
                {errors.privacy && <span className="field-error" id="privacy-err">{errors.privacy}</span>}
              </div>
              <div className="form-actions">
                <span className="note">Risposta entro 24 ore lavorative</span>
                <button className="btn btn-primary" type="submit">
                  Invia richiesta
                  <Icon.arrow className="btn-arrow" aria-hidden="true" />
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </section>);

}

/* ===== Footer ===== */
function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-card">
          <LogoMark size={96} />
          <div className="foot-name"><span style={{ fontSize: '30px', display: 'inline-block', paddingLeft: '0px', paddingRight: '0px' }}>Dott.ssa Linda Cifaldi</span></div>
          <div className="foot-role" style={{ paddingLeft: '26px', paddingRight: '26px' }}>Pedagogista e Mediatrice familiare</div>
          <div className="foot-where" style={{ paddingLeft: '30px', paddingRight: '30px' }}>Ricevo online e in presenza (San Giovanni – Prati)</div>
        </div>
        <div className="foot-rule"></div>
        <div className="foot-contact">
          <h2>Contact</h2>
          <div className="foot-lines">
            <a href="tel:+393294155464">+39 329 4155464</a>
            <a href="mailto:linda.cifaldi@live.it">linda.cifaldi@live.it</a>
          </div>
        </div>
        <p className="foot-vat">
          Dott.ssa Linda Cifaldi — Pedagogista e Mediatrice familiare —
          P.IVA 00000000000 — linda.cifaldi@live.it —
          Professionista ai sensi della legge 4/2013.
        </p>
        <div className="foot-legal">
          <a href="#">Privacy Policy</a>
          <span className="sep" aria-hidden="true">·</span>
          <a href="#">Cookie Policy</a>
          <span className="sep" aria-hidden="true">·</span>
          <span>© {new Date().getFullYear()}</span>
          <span className="sep" aria-hidden="true">·</span>
          <span>Tutti i diritti riservati</span>
        </div>
      </div>
    </footer>);

}

/* Preset palette swatches — used to reset the custom pickers when a preset is chosen */
const PALETTE_PRESETS = {
  azzurro: { bg: '#F6F5EE', alt: '#E7EDEB', primary: '#69898D', accent: '#BED0D1', cta: '#526363' },
  sage: { bg: '#F5F1EA', alt: '#EDE7DB', primary: '#7A8B7F', accent: '#C9B8A8', cta: '#2C2E2B' },
  mist: { bg: '#F4F1EC', alt: '#E8E3DA', primary: '#9CAFB7', accent: '#D4C4B0', cta: '#2A2D2E' },
  clay: { bg: '#FAF7F2', alt: '#F0EBDF', primary: '#6B7A6F', accent: '#B8A99A', cta: '#2A2A28' }
};

/* ===== Tweaks ===== */
function Tweaks({ tweaks, setTweak }) {
  // Choosing a preset also loads its colours into the custom pickers,
  // so "Su misura" starts from the palette you were just looking at.
  const choosePreset = (v) => {
    const p = PALETTE_PRESETS[v];
    setTweak(p ?
    { palette: v, customBg: p.bg, customPrimary: p.primary, customAccent: p.accent, bandOdd: p.bg, bandEven: p.alt, ctaColor: p.cta } :
    { palette: v });
  };
  // Editing any colour switches to the custom palette automatically.
  const setColor = (key) => (v) => setTweak({ [key]: v, palette: 'custom' });
  const resetAll = () => setTweak({ ...TWEAK_BASE });

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Palette">
        <TweakSelect
          label="Preset"
          value={tweaks.palette}
          onChange={choosePreset}
          options={[
          { value: 'azzurro', label: 'Carta da zucchero' },
          { value: 'sage', label: 'Sage' },
          { value: 'mist', label: 'Mist' },
          { value: 'clay', label: 'Clay' },
          { value: 'custom', label: 'Su misura' }]
          } />
        <TweakButton label="Ripristina tutto" onClick={resetAll} />
      </TweakSection>
      <TweakSection title="Colori su misura">
        <TweakColor label="Sfondo" value={tweaks.customBg} onChange={setColor('customBg')} />
        <TweakColor label="Principale" value={tweaks.customPrimary} onChange={setColor('customPrimary')} />
        <TweakColor label="Accento" value={tweaks.customAccent} onChange={setColor('customAccent')} />
        <TweakButton label="Ripristina Sage" secondary onClick={() => choosePreset('sage')} />
      </TweakSection>
      <TweakSection title="Sfondi sezioni">
        <TweakColor label="Sezioni dispari (1·3·5)" value={tweaks.bandOdd} onChange={(v) => setTweak('bandOdd', v)} />
        <TweakColor label="Sezioni pari (2·4·6)" value={tweaks.bandEven} onChange={(v) => setTweak('bandEven', v)} />
      </TweakSection>
      <TweakSection title="Logo">
        <TweakColor label="Blu" value={tweaks.logoBlue} onChange={(v) => setTweak('logoBlue', v)} />
        <TweakColor label="Oro" value={tweaks.logoGold} onChange={(v) => setTweak('logoGold', v)} />
        <TweakButton label="Ripristina logo" secondary onClick={() => setTweak({ logoBlue: TWEAK_BASE.logoBlue, logoGold: TWEAK_BASE.logoGold })} />
      </TweakSection>
      <TweakSection title="Pulsanti (CTA)">
        <TweakColor label="Colore CTA" value={tweaks.ctaColor} onChange={(v) => setTweak('ctaColor', v)} />
        <TweakButton label="Usa principale" secondary onClick={() => setTweak('ctaColor', tweaks.customPrimary)} />
      </TweakSection>
      <TweakSection title="Hero">
        <TweakRadio
          label="Variante"
          value={tweaks.heroVariant}
          onChange={(v) => setTweak('heroVariant', v)}
          options={[
          { value: 'split', label: 'Editorial' },
          { value: 'centered', label: 'Centrata' }]
          } />
        
      </TweakSection>
      <TweakSection title="Tipografia">
        <TweakSelect
          label="Font principale"
          value={tweaks.font}
          onChange={(v) => setTweak('font', v)}
          options={[
          { value: 'Carlito', label: 'Calibri (come il PPT)' },
          { value: 'Inter', label: 'Inter' },
          { value: 'Manrope', label: 'Manrope' },
          { value: 'DM Sans', label: 'DM Sans' },
          { value: 'Poppins', label: 'Poppins' }]
          } />
        
      </TweakSection>
    </TweaksPanel>);

}

/* ===== App ===== */
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const root = document.documentElement;
    const customVars = ['--bg', '--bg-alt', '--card', '--line', '--primary', '--primary-deep', '--accent'];
    if (tweaks.palette === 'custom') {
      // Keep the dark foreground/neutral scale from the Sage base, then
      // override the three chosen colours and derive their related tones.
      root.dataset.palette = 'azzurro';
      const { customBg, customPrimary, customAccent } = tweaks;
      root.style.setProperty('--bg', customBg);
      root.style.setProperty('--bg-alt', `color-mix(in oklab, ${customBg} 90%, #000)`);
      root.style.setProperty('--card', `color-mix(in oklab, ${customBg} 55%, #fff)`);
      root.style.setProperty('--line', `color-mix(in oklab, ${customBg} 82%, #000)`);
      root.style.setProperty('--primary', customPrimary);
      root.style.setProperty('--primary-deep', `color-mix(in oklab, ${customPrimary} 75%, #000)`);
      root.style.setProperty('--accent', customAccent);
    } else {
      root.dataset.palette = tweaks.palette;
      customVars.forEach((v) => root.style.removeProperty(v));
    }
    root.style.setProperty('--font-display', `'${tweaks.font}', system-ui, sans-serif`);
    root.style.setProperty('--font-body', `'${tweaks.font}', system-ui, sans-serif`);
    // CTA colour + derived hover + auto-contrast text
    root.style.setProperty('--cta', tweaks.ctaColor);
    root.style.setProperty('--cta-deep', `color-mix(in oklab, ${tweaks.ctaColor} 82%, #000)`);
    root.style.setProperty('--cta-text', ctaTextFor(tweaks.ctaColor));
    // Alternating section bands — odd (1·3·5) and even (2·4·6)
    root.style.setProperty('--band-odd', tweaks.bandOdd);
    root.style.setProperty('--band-even', tweaks.bandEven);
    // Logo colours + derived highlight / shadow stops
    root.style.setProperty('--logo-blue', tweaks.logoBlue);
    root.style.setProperty('--logo-blue-lite', `color-mix(in srgb, ${tweaks.logoBlue} 58%, #fff)`);
    root.style.setProperty('--logo-blue-deep', `color-mix(in srgb, ${tweaks.logoBlue} 74%, #000)`);
    root.style.setProperty('--logo-gold', tweaks.logoGold);
    root.style.setProperty('--logo-gold-lite', `color-mix(in srgb, ${tweaks.logoGold} 55%, #fff)`);
    root.style.setProperty('--logo-gold-deep', `color-mix(in srgb, ${tweaks.logoGold} 76%, #000)`);
    if (window.setLogoColors) window.setLogoColors(tweaks.logoBlue, tweaks.logoGold);
  }, [tweaks.palette, tweaks.font, tweaks.customBg, tweaks.customPrimary, tweaks.customAccent, tweaks.ctaColor, tweaks.bandOdd, tweaks.bandEven, tweaks.logoBlue, tweaks.logoGold]);

  /* Persist every tweak change to localStorage */
  useEffect(() => {
    try {localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks));} catch {}
  }, [tweaks]);

  return (
    <>
      <Nav />
      <main id="contenuto" tabIndex={-1}>
        <Hero variant={tweaks.heroVariant} />
        <About />
        <Services />
        <Service />
        <Principles />
        <When />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <Tweaks tweaks={tweaks} setTweak={setTweak} />
    </>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);