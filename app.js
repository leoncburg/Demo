const { useState, useEffect, useRef, useCallback } = React;

// 96 DPI: px = mm × 96 / 25.4
const PRESETS = [
    { id: 'sm', label: '28mm (106px)', size: 106 },
    { id: 'md', label: '32mm (121px)', size: 121 },
    { id: 'lg', label: '36mm (136px)', size: 136 },
    { id: 'xl', label: '40mm (151px)', size: 151 },
];

const CONTACTS = [
    { id: 1, name: 'Opa',  initial: 'O', color: '#FF6B6B' },
    { id: 2, name: 'Oma',  initial: 'O', color: '#C77DFF' },
    { id: 3, name: 'Mama', initial: 'M', color: '#4FC3F7' },
    { id: 4, name: 'Papa', initial: 'P', color: '#FFB347' },
];

const APP_VIEWS     = ['contacts-list', 'music', 'audiobooks'];
const QUICK_REPLIES = ['Ja', 'Nein', 'Gleich', 'Bin unterwegs'];

const AOD_TIMEOUT     = 30000;
const SWIPE_THRESHOLD = 18;
const LONG_PRESS_MS   = 600;

const BACK_MAP = {
    'apps-menu':      'watchface',
    'contacts-list':  'apps-menu',
    'music':          'apps-menu',
    'audiobooks':     'apps-menu',
    'contact-detail': 'contacts-list',
    'call':           'contact-detail',
    'text':           'contact-detail',
    'voice-input':    'text',
};

// ── Icons ─────────────────────────────────────────────────────────────────
function Icon({ name, color = '#000', size = '100%' }) {
    const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' };
    if (name === 'person') return (
        <svg {...p}>
            <circle cx="12" cy="8" r="4" fill={color} />
            <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" fill={color} />
        </svg>
    );
    if (name === 'music') return (
        <svg {...p}>
            <circle cx="8"  cy="18" r="3" fill={color} />
            <circle cx="18" cy="16" r="3" fill={color} />
            <path d="M11 18V6l9-2v10" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
    if (name === 'headphones') return (
        <svg {...p}>
            <path d="M3 13a9 9 0 0118 0" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <rect x="1"  y="13" width="4" height="6" rx="2" fill={color} />
            <rect x="19" y="13" width="4" height="6" rx="2" fill={color} />
        </svg>
    );
    if (name === 'phone') return (
        <svg {...p}>
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C9.61 21 3 14.39 3 6c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.23 1.01z" fill={color} />
        </svg>
    );
    if (name === 'message') return (
        <svg {...p}>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill={color} />
        </svg>
    );
    if (name === 'mic') return (
        <svg {...p}>
            <rect x="9" y="2" width="6" height="11" rx="3" fill={color} />
            <path d="M5 11a7 7 0 0014 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="8"  y1="22" x2="16" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
    if (name === 'x') return (
        <svg {...p}>
            <line x1="18" y1="6"  x2="6"  y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="6"  y1="6"  x2="18" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
    return null;
}

// ── Time hook ─────────────────────────────────────────────────────────────
function useTime() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return now;
}

// ── Screens ───────────────────────────────────────────────────────────────
function WatchfaceScreen() {
    const now = useTime();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return (
        <div className="screen">
            <div className="time-hm">{h}:{m}</div>
        </div>
    );
}

function AodScreen() {
    const now = useTime();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return (
        <div className="screen">
            <div className="aod-time">{h}:{m}</div>
        </div>
    );
}

function AppsMenuScreen({ onSelect }) {
    const apps = [
        { id: 'contacts-list', label: 'Kontakte', icon: 'person',     bg: '#4ECDC4' },
        { id: 'music',         label: 'Musik',    icon: 'music',      bg: '#FF6B35' },
        { id: 'audiobooks',    label: 'Bücher',   icon: 'headphones', bg: '#FFE66D' },
    ];
    return (
        <div className="screen apps-menu-screen">
            {apps.map(app => (
                <div key={app.id} className="app-row" data-interactive="true" onClick={() => onSelect(app.id)}>
                    <div className="app-icon-sq" style={{ background: app.bg }}>
                        <Icon name={app.icon} color="#1a1a1a" />
                    </div>
                    <span className="app-row-label">{app.label}</span>
                </div>
            ))}
        </div>
    );
}

function ContactsListScreen({ onSelect }) {
    return (
        <div className="screen contacts-list-screen">
            <div className="list-scroll">
                {CONTACTS.map(c => (
                    <div key={c.id} className="contact-row" data-interactive="true" onClick={() => onSelect(c)}>
                        <div className="contact-avatar" style={{ background: c.color }}>{c.initial}</div>
                        <span className="contact-name">{c.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ContactDetailScreen({ contact, onCall, onText }) {
    return (
        <div className="screen contact-detail-screen">
            <div className="detail-avatar" style={{ background: contact.color }}>{contact.initial}</div>
            <div className="detail-name">{contact.name}</div>
            <div className="detail-actions">
                <button className="detail-btn call-btn" data-interactive="true" onClick={onCall}>
                    <span className="btn-icon"><Icon name="phone" color="#fff" /></span>
                    Anrufen
                </button>
                <button className="detail-btn text-btn" data-interactive="true" onClick={onText}>
                    <span className="btn-icon"><Icon name="message" color="#fff" /></span>
                    Nachricht
                </button>
            </div>
        </div>
    );
}

function CallScreen({ contact, onEnd }) {
    return (
        <div className="screen call-screen">
            <div className="call-avatar" style={{ background: contact.color }}>{contact.initial}</div>
            <div className="call-name">{contact.name}</div>
            <div className="call-status">Verbindet<span className="call-dots" /></div>
            <div className="call-circle end-circle" data-interactive="true" onClick={onEnd}>
                <Icon name="x" color="#fff" />
            </div>
        </div>
    );
}

function VoiceInputScreen({ onSend, onCancel }) {
    const [display,   setDisplay]   = useState('');
    const [listening, setListening] = useState(false);
    const [error,     setError]     = useState('');
    const [attempt,   setAttempt]   = useState(0);

    // stoppedRef: true when we deliberately stop so onend doesn't restart
    const stoppedRef = useRef(false);
    // finalRef: accumulates confirmed text across recognition sessions
    const finalRef   = useRef('');
    const recRef     = useRef(null);

    useEffect(() => {
        stoppedRef.current = false;
        finalRef.current   = '';
        setDisplay('');
        setError('');
        setListening(false);

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            setError('Chrome oder Safari erforderlich');
            return;
        }

        // Create a fresh instance on every start/restart.
        // Reusing a stopped SpeechRecognition instance is the cause of
        // the "everything breaks after one transcription" bug.
        function startNew() {
            if (stoppedRef.current) return;

            const rec = new SR();
            rec.continuous     = true;
            rec.interimResults = true;
            rec.lang           = 'de-DE';

            rec.onstart = () => setListening(true);

            rec.onresult = (e) => {
                // e.resultIndex is the first new result; iterate only new ones
                // to avoid duplicating already-final text
                let newFinal = '';
                let interim  = '';
                for (let i = e.resultIndex; i < e.results.length; i++) {
                    if (e.results[i].isFinal) newFinal += e.results[i][0].transcript;
                    else                      interim  += e.results[i][0].transcript;
                }
                if (newFinal) finalRef.current += newFinal;
                setDisplay(finalRef.current + interim);
            };

            rec.onend = () => {
                setListening(false);
                // Browser stopped (often after silence even with continuous:true).
                // Restart with a new instance rather than re-calling start()
                // on the stopped one, which fails in some browser versions.
                if (!stoppedRef.current) startNew();
            };

            rec.onerror = (ev) => {
                setListening(false);
                if (ev.error === 'no-speech') return; // silence → onend restarts
                stoppedRef.current = true;
                if (ev.error === 'not-allowed')
                    setError('Mikrofon gesperrt — Zugriff erlauben');
                else if (ev.error === 'service-not-allowed')
                    setError('Localhost oder HTTPS erforderlich');
                else if (ev.error !== 'aborted')
                    setError(`Fehler: ${ev.error}`);
            };

            recRef.current = rec;
            try { rec.start(); } catch (_) { /* caught by onerror */ }
        }

        startNew();
        return () => { stoppedRef.current = true; recRef.current?.abort(); };
    }, [attempt]);

    const doSend = () => {
        stoppedRef.current = true;
        recRef.current?.abort();
        const text = display.trim();
        if (text) onSend(text);
        else onCancel();
    };
    const doCancel = () => { stoppedRef.current = true; recRef.current?.abort(); onCancel(); };
    const retry    = () => setAttempt(a => a + 1);

    return (
        <div className="screen voice-screen">
            <div className={`mic-ring${listening ? ' listening' : ''}`}>
                <Icon name="mic" color={listening ? '#FF6B35' : error ? '#f44336' : 'rgba(255,255,255,0.4)'} />
            </div>

            {error ? (
                <>
                    <p className="voice-error">{error}</p>
                    <div className="voice-actions">
                        <button className="v-btn v-cancel" data-interactive="true" onClick={doCancel}>Zurück</button>
                        <button className="v-btn v-send"   data-interactive="true" onClick={retry}>Erneut</button>
                    </div>
                </>
            ) : (
                <>
                    {!display && <p className="voice-status">{listening ? 'Lauscht…' : 'Startet…'}</p>}
                    {display  && <p className="voice-transcript">{display}</p>}
                    <div className="voice-actions">
                        <button className="v-btn v-cancel" data-interactive="true" onClick={doCancel}>Abbruch</button>
                        {display && (
                            <button className="v-btn v-send" data-interactive="true" onClick={doSend}>Senden</button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function TextScreen({ contact, messages, onReply, onMic }) {
    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    return (
        <div className="screen text-screen">
            <div className="chat-header">{contact.name}</div>
            <div className="chat-bubbles" ref={scrollRef}>
                {messages.map((msg, i) => (
                    <div key={i} className={`bubble ${msg.from === 'me' ? 'bubble-out' : 'bubble-in'}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="text-actions">
                <div className="mic-chip" data-interactive="true" onClick={onMic}>
                    <Icon name="mic" color="#4ECDC4" />
                </div>
                <div className="quick-replies">
                    {QUICK_REPLIES.map(r => (
                        <button key={r} className="reply-chip" data-interactive="true" onClick={() => onReply(r)}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MusicScreen() {
    return (
        <div className="screen placeholder-screen">
            <div className="ph-icon" style={{ background: '#FF6B35' }}>
                <Icon name="music" color="#1a1a1a" />
            </div>
            <div className="ph-label">Musik</div>
        </div>
    );
}

function AudiobooksScreen() {
    return (
        <div className="screen placeholder-screen">
            <div className="ph-icon" style={{ background: '#FFE66D' }}>
                <Icon name="headphones" color="#1a1a1a" />
            </div>
            <div className="ph-label">Bücher</div>
        </div>
    );
}

// ── Overlay ───────────────────────────────────────────────────────────────
function LongPressOverlay() {
    return (
        <div className="overlay-screen">
            <div className="overlay-text">Zifferblatt anpassen</div>
        </div>
    );
}

// ── Page dots ─────────────────────────────────────────────────────────────
function PageDots({ current }) {
    return (
        <div className="page-dots">
            {APP_VIEWS.map((_, i) => (
                <div key={i} className={`page-dot${i === current ? ' active' : ''}`} />
            ))}
        </div>
    );
}

// ── Watch ─────────────────────────────────────────────────────────────────
function Watch({ size }) {
    const [view, setView]                       = useState('watchface');
    const [appPage, setAppPage]                 = useState(0);
    const [hasSwipedApps, setHasSwipedApps]     = useState(false);
    const [overlay, setOverlay]                 = useState(null);
    const [aod, setAod]                         = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [chatMessages, setChatMessages]       = useState([]);

    const gestureRef   = useRef(null);
    const longPressRef = useRef(null);
    const aodRef       = useRef(null);

    const wake = useCallback(() => {
        setAod(false);
        clearTimeout(aodRef.current);
        aodRef.current = setTimeout(() => setAod(true), AOD_TIMEOUT);
    }, []);

    useEffect(() => {
        aodRef.current = setTimeout(() => setAod(true), AOD_TIMEOUT);
        return () => clearTimeout(aodRef.current);
    }, []);

    const goBack = useCallback(() => {
        const dest = BACK_MAP[view];
        if (dest) setView(dest);
    }, [view]);

    const openContact = useCallback((contact) => {
        setSelectedContact(contact);
        setView('contact-detail');
    }, []);

    const openText = useCallback(() => {
        setChatMessages([{ from: 'them', text: 'Hey! Wo bist du?' }]);
        setView('text');
    }, []);

    const sendReply = useCallback((text) => {
        setChatMessages(prev => [...prev, { from: 'me', text }]);
    }, []);

    const sendVoice = useCallback((text) => {
        setChatMessages(prev => {
            const base = prev.length ? prev : [{ from: 'them', text: 'Hey! Wo bist du?' }];
            return [...base, { from: 'me', text }];
        });
        setView('text');
    }, []);

    const goToApp = useCallback((appView) => {
        setView(appView);
        setAppPage(APP_VIEWS.indexOf(appView));
    }, []);

    const onPointerDown = useCallback((e) => {
        gestureRef.current = { x: e.clientX, y: e.clientY, moved: false };
        if (view === 'watchface' && !e.target.closest('[data-interactive]')) {
            longPressRef.current = setTimeout(() => {
                if (gestureRef.current && !gestureRef.current.moved) {
                    wake();
                    setOverlay('longpress');
                }
            }, LONG_PRESS_MS);
        }
    }, [view, wake]);

    const onPointerMove = useCallback((e) => {
        if (!gestureRef.current) return;
        const dx = e.clientX - gestureRef.current.x;
        const dy = e.clientY - gestureRef.current.y;
        if (Math.hypot(dx, dy) > 8) {
            gestureRef.current.moved = true;
            clearTimeout(longPressRef.current);
        }
    }, []);

    const onPointerCancel = useCallback(() => {
        clearTimeout(longPressRef.current);
        gestureRef.current = null;
    }, []);

    const onPointerUp = useCallback((e) => {
        clearTimeout(longPressRef.current);
        const g = gestureRef.current;
        gestureRef.current = null;
        if (!g) return;

        if (aod) { wake(); return; }
        wake();

        const dx    = e.clientX - g.x;
        const dy    = e.clientY - g.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (!g.moved) {
            if (e.target.closest('[data-interactive]')) return;
            if (overlay !== null) { setOverlay(null); return; }
            return;
        }

        if (overlay !== null) { setOverlay(null); return; }

        if (absDy > absDx && absDy > SWIPE_THRESHOLD) {
            if (dy < 0 && view === 'watchface') { setView('apps-menu'); return; }
            if (dy > 0) { goBack(); return; }
        }

        if (absDx > absDy && absDx > SWIPE_THRESHOLD) {
            const left   = dx < 0;
            const right  = dx > 0;
            const appIdx = APP_VIEWS.indexOf(view);

            if (appIdx !== -1) {
                if (left && appIdx < APP_VIEWS.length - 1) {
                    setView(APP_VIEWS[appIdx + 1]);
                    setAppPage(appIdx + 1);
                    setHasSwipedApps(true);
                } else if (right) {
                    setView('apps-menu');
                }
                return;
            }

            if (right && BACK_MAP[view]) { goBack(); }
        }
    }, [aod, overlay, view, wake, goBack]);

    const watchStyle = { width: size, height: size, '--ws': size + 'px' };
    const showDots   = hasSwipedApps && APP_VIEWS.includes(view);

    let content;
    if (aod) {
        content = <AodScreen />;
    } else {
        switch (view) {
            case 'watchface':      content = <WatchfaceScreen />; break;
            case 'apps-menu':      content = <AppsMenuScreen onSelect={goToApp} />; break;
            case 'contacts-list':  content = <ContactsListScreen onSelect={openContact} />; break;
            case 'contact-detail': content = <ContactDetailScreen contact={selectedContact} onCall={() => setView('call')} onText={openText} />; break;
            case 'call':           content = <CallScreen contact={selectedContact} onEnd={() => setView('contact-detail')} />; break;
            case 'voice-input':    content = <VoiceInputScreen onSend={sendVoice} onCancel={() => setView('text')} />; break;
            case 'text':           content = <TextScreen contact={selectedContact} messages={chatMessages} onReply={sendReply} onMic={() => setView('voice-input')} />; break;
            case 'music':          content = <MusicScreen />; break;
            case 'audiobooks':     content = <AudiobooksScreen />; break;
            default:               content = <WatchfaceScreen />;
        }
    }

    return (
        <div
            className="watch-body"
            style={watchStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
        >
            {content}
            {!aod && overlay === 'longpress' && <LongPressOverlay />}
            {!aod && showDots               && <PageDots current={appPage} />}
        </div>
    );
}

// ── App shell ─────────────────────────────────────────────────────────────
function App() {
    const [presetId, setPresetId] = useState('xl');
    const [watchKey, setWatchKey] = useState(0);
    const preset = PRESETS.find(p => p.id === presetId) || PRESETS[3];

    return (
        <div className="app-root">
            <div className="controls">
                <label>
                    Größe
                    <select value={presetId} onChange={e => setPresetId(e.target.value)}>
                        {PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                </label>
                <button className="reset-btn" onClick={() => setWatchKey(k => k + 1)}>Zurücksetzen</button>
            </div>
            <div className="viewport-wrap">
                <Watch key={watchKey} size={preset.size} />
            </div>
            <div className="hints">
                Wischen ↑ = Apps &nbsp;·&nbsp; Wischen ↓ / → = Zurück &nbsp;·&nbsp; Wischen ← = nächste App<br />
                Nachrichten: Mikrofon antippen zum Sprechen &nbsp;·&nbsp; Lang drücken = Zifferblatt
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
