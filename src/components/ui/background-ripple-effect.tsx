export function BackgroundRippleEffect() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="hero-grid-overlay"/>
            <div className="hero-grid-highlight hero-grid-highlight-left"/>
            <div className="hero-grid-highlight hero-grid-highlight-right"/>
        </div>
    );
}
