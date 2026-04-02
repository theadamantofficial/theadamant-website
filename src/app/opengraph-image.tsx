import {ImageResponse} from "next/og";

export const alt = "The Adamant | Digital Product Design and Development";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    position: "relative",
                    overflow: "hidden",
                    padding: "48px",
                    background: "linear-gradient(135deg, #f6f0e5 0%, #eadfce 46%, #fffaf2 100%)",
                    color: "#1d1d1a",
                    fontFamily: "sans-serif",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: "18px",
                        borderRadius: "34px",
                        border: "1px solid rgba(29, 29, 26, 0.08)",
                        background: "rgba(255, 250, 242, 0.55)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "-90px",
                        right: "-70px",
                        width: "360px",
                        height: "360px",
                        borderRadius: "999px",
                        background: "rgba(13, 92, 99, 0.14)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-110px",
                        left: "-40px",
                        width: "300px",
                        height: "300px",
                        borderRadius: "999px",
                        background: "rgba(214, 106, 69, 0.16)",
                    }}
                />
                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "36px",
                    }}
                >
                    <div
                        style={{
                            width: "58%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                alignSelf: "flex-start",
                                padding: "12px 18px",
                                borderRadius: "999px",
                                border: "1px solid rgba(29, 29, 26, 0.08)",
                                background: "rgba(255, 255, 255, 0.74)",
                                fontSize: 18,
                                fontWeight: 700,
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                            }}
                        >
                            The Adamant
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "18px",
                                marginTop: "28px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 74,
                                    fontWeight: 800,
                                    lineHeight: 1.02,
                                    letterSpacing: "-0.05em",
                                }}
                            >
                                Design-forward websites, products, and mobile experiences.
                            </div>
                            <div
                                style={{
                                    maxWidth: "580px",
                                    fontSize: 26,
                                    lineHeight: 1.35,
                                    color: "rgba(29, 29, 26, 0.78)",
                                }}
                            >
                                Fast-loading builds, sharp interfaces, and SEO-ready structure from day one.
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: "14px",
                                marginTop: "34px",
                            }}
                        >
                            {["Web design", "SEO-ready builds", "Mobile apps"].map((label) => (
                                <div
                                    key={label}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "12px 18px",
                                        borderRadius: "999px",
                                        background: "rgba(255, 255, 255, 0.78)",
                                        border: "1px solid rgba(29, 29, 26, 0.08)",
                                        fontSize: 20,
                                        fontWeight: 600,
                                    }}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div
                        style={{
                            width: "36%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            padding: "26px",
                            borderRadius: "32px",
                            border: "1px solid rgba(29, 29, 26, 0.08)",
                            background: "rgba(255, 255, 255, 0.8)",
                            boxShadow: "0 30px 80px rgba(15, 23, 42, 0.12)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                            }}
                        >
                            <div style={{width: "12px", height: "12px", borderRadius: "999px", background: "#d66a45"}}/>
                            <div style={{width: "12px", height: "12px", borderRadius: "999px", background: "#eadfce"}}/>
                            <div style={{width: "12px", height: "12px", borderRadius: "999px", background: "#0d5c63"}}/>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "16px",
                                marginTop: "18px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                    padding: "20px",
                                    borderRadius: "24px",
                                    background: "#0d5c63",
                                    color: "#f8f3eb",
                                }}
                            >
                                <div style={{fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.72}}>
                                    Strategy
                                </div>
                                <div style={{fontSize: 34, fontWeight: 700, lineHeight: 1.15}}>
                                    Clear messaging and conversion-focused flows
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "14px",
                                }}
                            >
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        padding: "18px",
                                        borderRadius: "22px",
                                        background: "#fffaf2",
                                        border: "1px solid rgba(29, 29, 26, 0.08)",
                                    }}
                                >
                                    <div style={{fontSize: 16, color: "rgba(29, 29, 26, 0.62)", textTransform: "uppercase", letterSpacing: "0.12em"}}>
                                        Performance
                                    </div>
                                    <div style={{fontSize: 28, fontWeight: 700}}>
                                        Fast
                                    </div>
                                </div>
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        padding: "18px",
                                        borderRadius: "22px",
                                        background: "#fffaf2",
                                        border: "1px solid rgba(29, 29, 26, 0.08)",
                                    }}
                                >
                                    <div style={{fontSize: 16, color: "rgba(29, 29, 26, 0.62)", textTransform: "uppercase", letterSpacing: "0.12em"}}>
                                        SEO
                                    </div>
                                    <div style={{fontSize: 28, fontWeight: 700}}>
                                        Ready
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: "18px",
                                paddingTop: "18px",
                                borderTop: "1px solid rgba(29, 29, 26, 0.08)",
                                fontSize: 20,
                                color: "rgba(29, 29, 26, 0.72)",
                            }}
                        >
                            <div>theadamant.com</div>
                            <div style={{fontWeight: 700, color: "#1d1d1a"}}>Built to look sharp and load fast</div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        size,
    );
}
