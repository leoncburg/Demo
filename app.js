const { useState, useEffect } = React;

const PRESETS = [
    { id: 'xs', label: 'Small 200×200', w: 200, h: 200, scale: 0.75 },
    { id: 'sm', label: 'Medium 280×280', w: 280, h: 280, scale: 0.9 },
    { id: 'md', label: 'Large 360×360', w: 360, h: 360, scale: 1.0 },
    { id: 'lg', label: 'XL 440×440', w: 440, h: 440, scale: 1.15 },
];

function Dropdown({ value, onChange }) {
    return (
        <div className="controls">
            <label>
                Screen size:
                <select value={value} onChange={(e) => onChange(e.target.value)}>
                    {PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                </select>
            </label>
        </div>
    );
}

function WatchHome({ scale }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return (
        <div className="watch-face">
            <div className="time">
                <div className="clock-main">{hours}:{minutes}</div>
                <div className="clock-sec">{seconds}</div>
            </div>
            <div className="example-row">
                <button className="primary">Start</button>
                <button className="secondary">Menu</button>
            </div>
        </div>
    );
}

function App() {
    const [presetId, setPresetId] = useState('md');

    const preset = PRESETS.find((p) => p.id === presetId) || PRESETS[2];

    const containerStyle = {
        width: preset.w + 'px',
        height: preset.h + 'px',
        transform: 'translateZ(0)',
        // set CSS variable for scale
        ['--scale']: preset.scale,
    };

    return (
        <div className="app-root">
            <Dropdown value={presetId} onChange={setPresetId} />

            <div className="viewport-wrap">
                <div className="watch-viewport" style={containerStyle}>
                    <WatchHome scale={preset.scale} />
                </div>
            </div>

            <div className="notes">Open this page in Safari iPhone emulator for prototyping.</div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
