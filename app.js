const { useState, useEffect, useRef, useCallback } = React;

// 96 DPI: px = mm × 96 / 25.4
const PRESETS = [
    { id: 'sm', label: '28mm (106px)', size: 106 },
    { id: 'md', label: '32mm (121px)', size: 121 },
    { id: 'lg', label: '36mm (136px)', size: 136 },
    { id: 'xl', label: '40mm (151px)', size: 151 },
];

const CONTACTS = [
    { id: 1, name: 'Grandpa', initial: 'G', color: '#2e7d32' },
    { id: 2, name: 'Grandma', initial: 'G', color: '#6a1b9a' },
    { id: 3, name: 'Mom',     initial: 'M', color: '#1565c0' },
    { id: 4, name: 'Dad',     initial: 'D', color: '#bf360c' },
];

const APP_VIEWS = ['contacts-list', 'music', 'audiobooks'];
const QUICK_REPLIES = ['Yes', 'No', 'Soon', 'On my way'];

const AOD_TIMEOUT = 30000;
const SWIPE_THRESHOLD = 18;
const LONG_PRESS_MS = 600;

function useTime() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return now;
}

function WatchfaceScreen() {
    const now = useTime();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return (
        <div className="screen watchface-screen">
            <div className="time-hm">{h}:{m}</div>
        </div>
    );
}

function AodScreen() {
    const now = useTime();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return (
        <div className="screen aod-screen">
            <div className="aod-time">{h}:{m}</div>
        </div>
    );
}

function AppsMenuScreen({ onSelect }) {
    const apps = [
        { id: 'contacts-list', label: 'Contacts', initial: 'C', color: '#1565c0' },
        { id: 'music',         label: 'Music',    initial: 'M', color: '#6a1b9a' },
        { id: 'audiobooks',    label: 'Audiobooks', initial: 'A', color: '#2e7d32' },
    ];
    return (
        <div className="screen apps-menu-screen">
            {apps.map(app => (
                <div
                    key={app.id}
                    className="app-row"
                    data-interactive="true"
                    onClick={() => onSelect(app.id)}
                >
                    <div className="app-avatar" style={{ background: app.color }}>{app.initial}</div>
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
                    <div
                        key={c.id}
                        className="contact-row"
                        data-interactive="true"
                        onClick={() => onSelect(c)}
                    >
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
                <button className="action-btn call-btn" data-interactive="true" onClick={onCall}>Call</button>
                <button className="action-btn text-btn" data-interactive="true" onClick={onText}>Text</button>
            </div>
        </div>
    );
}

function CallScreen({ contact, onEnd }) {
    return (
        <div className="screen call-screen">
            <div className="call-avatar" style={{ background: contact.color }}>{contact.initial}</div>
            <div className="call-name">{contact.name}</div>
            <div className="call-status">Calling<span className="call-dots" /></div>
            <button className="end-call-btn" data-interactive="true" onClick={onEnd}>End</button>
        </div>
    );
}

function TextScreen({ contact, messages, onReply }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
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
            <div className="quick-replies">
                {QUICK_REPLIES.map(r => (
                    <button
                        key={r}
                        className="reply-chip"
                        data-interactive="true"
                        onClick={() => onReply(r)}
                    >
                        {r}
                    </button>
                ))}
            </div>
        </div>
    );
}

function MusicScreen() {
    return (
        <div className="screen placeholder-screen">
            <div className="placeholder-label">Music</div>
        </div>
    );
}

function AudiobooksScreen() {
    return (
        <div className="screen placeholder-screen">
            <div className="placeholder-label">Audiobooks</div>
        </div>
    );
}

function SettingsOverlay() {
    return (
        <div className="overlay-screen">
            <div className="overlay-title">Settings</div>
            <div className="overlay-item">Brightness</div>
            <div className="overlay-item">Do Not Disturb</div>
            <div className="overlay-item">Battery Saver</div>
        </div>
    );
}

function NotificationsOverlay() {
    return (
        <div className="overlay-screen">
            <div className="overlay-title">Notifications</div>
            <div className="overlay-item muted">All clear</div>
        </div>
    );
}

function LongPressOverlay() {
    return (
        <div className="overlay-screen">
            <div className="overlay-text">Customise Watch Face</div>
        </div>
    );
}

function PageDots({ current }) {
    return (
        <div className="page-dots">
            {APP_VIEWS.map((_, i) => (
                <div key={i} className={`page-dot${i === current ? ' active' : ''}`} />
            ))}
        </div>
    );
}

function Watch({ size }) {
    const [view, setView]                   = useState('watchface');
    const [appPage, setAppPage]             = useState(0);
    const [hasSwipedApps, setHasSwipedApps] = useState(false);
    const [overlay, setOverlay]             = useState(null);
    const [aod, setAod]                     = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [chatMessages, setChatMessages]   = useState([]);

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

    const openContact = useCallback((contact) => {
        setSelectedContact(contact);
        setView('contact-detail');
    }, []);

    const openText = useCallback(() => {
        setChatMessages(prev =>
            prev.length ? prev : [{ from: 'them', text: 'Hey! Where are you?' }]
        );
        setView('text');
    }, []);

    const sendReply = useCallback((text) => {
        setChatMessages(prev => [...prev, { from: 'me', text }]);
    }, []);

    const goToApp = useCallback((appView) => {
        setView(appView);
        setAppPage(APP_VIEWS.indexOf(appView));
    }, []);

    const onPointerDown = useCallback((e) => {
        gestureRef.current = { x: e.clientX, y: e.clientY, moved: false };
        // Long press only on watchface background
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

        const dx = e.clientX - g.x;
        const dy = e.clientY - g.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (!g.moved) {
            // Tap on interactive child — let onClick handle it
            if (e.target.closest('[data-interactive]')) return;
            // Background tap
            if (overlay !== null) { setOverlay(null); return; }
            if (view === 'watchface') { setView('apps-menu'); return; }
            return;
        }

        // Swipes
        if (overlay !== null) { setOverlay(null); return; }

        // Vertical swipe — watchface only
        if (view === 'watchface' && absDy > absDx && absDy > SWIPE_THRESHOLD) {
            setOverlay(dy < 0 ? 'notifications' : 'settings');
            return;
        }

        // Horizontal swipe
        if (absDx > absDy && absDx > SWIPE_THRESHOLD) {
            const left  = dx < 0;
            const right = dx > 0;

            if (view === 'apps-menu') {
                if (right) { setView('watchface'); return; }
                if (left)  { setView('contacts-list'); setAppPage(0); setHasSwipedApps(true); return; }
            }

            if (view === 'contact-detail' || view === 'call' || view === 'text') {
                if (right) { setView('contacts-list'); return; }
                return;
            }

            const appIdx = APP_VIEWS.indexOf(view);
            if (appIdx !== -1) {
                if (left && appIdx < APP_VIEWS.length - 1) {
                    setView(APP_VIEWS[appIdx + 1]);
                    setAppPage(appIdx + 1);
                    setHasSwipedApps(true);
                } else if (right) {
                    if (appIdx > 0) {
                        setView(APP_VIEWS[appIdx - 1]);
                        setAppPage(appIdx - 1);
                        setHasSwipedApps(true);
                    } else {
                        setView('apps-menu');
                    }
                }
            }
        }
    }, [aod, overlay, view, wake]);

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
            case 'text':           content = <TextScreen contact={selectedContact} messages={chatMessages} onReply={sendReply} />; break;
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
            {!aod && overlay === 'settings'      && <SettingsOverlay />}
            {!aod && overlay === 'notifications' && <NotificationsOverlay />}
            {!aod && overlay === 'longpress'     && <LongPressOverlay />}
            {!aod && showDots                    && <PageDots current={appPage} />}
        </div>
    );
}

function App() {
    const [presetId, setPresetId] = useState('xl');
    const preset = PRESETS.find(p => p.id === presetId) || PRESETS[3];

    return (
        <div className="app-root">
            <div className="controls">
                <label>
                    Size
                    <select value={presetId} onChange={e => setPresetId(e.target.value)}>
                        {PRESETS.map(p => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="viewport-wrap">
                <Watch size={preset.size} />
            </div>
            <div className="hints">
                Tap watchface = apps &nbsp;·&nbsp; Swipe ↑ = notifications &nbsp;·&nbsp; Swipe ↓ = settings<br />
                Swipe left/right = navigate &nbsp;·&nbsp; Long press = customise &nbsp;·&nbsp; 30s = always-on
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
