const { useState, useEffect, useRef, useCallback } = React;

// 96 DPI: 1 inch = 96px → 1.6 in = 153.6 ≈ 154px (40mm kids watch)
const PRESETS = [
    { id: 'sm', label: 'Small (36mm)', size: 136 },
    { id: 'md', label: 'Medium (40mm / 1.6")', size: 154 },
    { id: 'lg', label: 'Large (44mm)', size: 168 },
    { id: 'xl', label: 'XL (49mm)', size: 186 },
];

const AOD_TIMEOUT = 30000;
const SWIPE_THRESHOLD = 18;
const LONG_PRESS_MS = 600;

const PAGES = ['watchface', 'contacts', 'music', 'audiobooks'];

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

function AppScreen({ color, initial, label }) {
    return (
        <div className="screen app-screen">
            <div className="app-initial" style={{ background: color }}>{initial}</div>
            <div className="app-label">{label}</div>
        </div>
    );
}

function SettingsOverlay() {
    return (
        <div className="overlay-screen">
            <div className="overlay-title">Settings</div>
            <div className="list-item">Brightness</div>
            <div className="list-item">Do Not Disturb</div>
            <div className="list-item">Battery Saver</div>
        </div>
    );
}

function NotificationsOverlay() {
    return (
        <div className="overlay-screen">
            <div className="overlay-title">Notifications</div>
            <div className="list-item muted">All clear</div>
        </div>
    );
}

function LongPressOverlay() {
    return (
        <div className="overlay-screen longpress-screen">
            <div className="longpress-text">Customise Watch Face</div>
        </div>
    );
}

function PageDots({ total, current }) {
    return (
        <div className="page-dots">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`page-dot${i === current ? ' active' : ''}`} />
            ))}
        </div>
    );
}

function Watch({ size }) {
    const [page, setPage] = useState(0);
    const [overlay, setOverlay] = useState(null);
    const [aod, setAod] = useState(false);

    const gestureRef = useRef(null);
    const longPressRef = useRef(null);
    const aodRef = useRef(null);

    const wake = useCallback(() => {
        setAod(false);
        clearTimeout(aodRef.current);
        aodRef.current = setTimeout(() => setAod(true), AOD_TIMEOUT);
    }, []);

    useEffect(() => {
        aodRef.current = setTimeout(() => setAod(true), AOD_TIMEOUT);
        return () => clearTimeout(aodRef.current);
    }, []);

    const onPointerDown = useCallback((e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        gestureRef.current = { x: e.clientX, y: e.clientY, moved: false };
        longPressRef.current = setTimeout(() => {
            if (gestureRef.current && !gestureRef.current.moved) {
                wake();
                setOverlay('longpress');
            }
        }, LONG_PRESS_MS);
    }, [wake]);

    const onPointerMove = useCallback((e) => {
        if (!gestureRef.current) return;
        const dx = e.clientX - gestureRef.current.x;
        const dy = e.clientY - gestureRef.current.y;
        if (Math.hypot(dx, dy) > 8) {
            gestureRef.current.moved = true;
            clearTimeout(longPressRef.current);
        }
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
            if (overlay !== null) setOverlay(null);
            return;
        }

        if (overlay !== null) { setOverlay(null); return; }

        if (absDy > absDx && absDy > SWIPE_THRESHOLD && page === 0) {
            setOverlay(dy < 0 ? 'notifications' : 'settings');
            return;
        }

        if (absDx > absDy && absDx > SWIPE_THRESHOLD) {
            setPage(p => dx < 0
                ? Math.min(p + 1, PAGES.length - 1)
                : Math.max(p - 1, 0)
            );
        }
    }, [aod, overlay, page, wake]);

    const watchStyle = { width: size, height: size, '--ws': size + 'px' };

    let mainContent;
    if (aod) {
        mainContent = <AodScreen />;
    } else {
        const p = PAGES[page];
        if (p === 'watchface')   mainContent = <WatchfaceScreen />;
        if (p === 'contacts')    mainContent = <AppScreen color="#1e4d8c" initial="C" label="Contacts" />;
        if (p === 'music')       mainContent = <AppScreen color="#6b1e8c" initial="M" label="Music" />;
        if (p === 'audiobooks')  mainContent = <AppScreen color="#1e7a5c" initial="A" label="Audiobooks" />;
    }

    return (
        <div
            className="watch-body"
            style={watchStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        >
            {mainContent}
            {!aod && overlay === 'settings'      && <SettingsOverlay />}
            {!aod && overlay === 'notifications' && <NotificationsOverlay />}
            {!aod && overlay === 'longpress'     && <LongPressOverlay />}
            {!aod && overlay === null            && <PageDots total={PAGES.length} current={page} />}
        </div>
    );
}

function App() {
    const [presetId, setPresetId] = useState('md');
    const preset = PRESETS.find(p => p.id === presetId) || PRESETS[1];

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
                Tap to wake &nbsp;·&nbsp; Swipe up = notifications &nbsp;·&nbsp; Swipe down = settings<br />
                Swipe left/right = apps &nbsp;·&nbsp; Long press = customise &nbsp;·&nbsp; 30s idle = always-on
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
