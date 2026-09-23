"use client";

import React from "react";

interface SceneOverlayProps {
  scrollProgress: number;
  currentScene: number;
  verificationState: "idle" | "checking" | "verified";
}

function SceneFade({ opacity, children, style = {}, zIndex = 10 }: { opacity: number; children: React.ReactNode; style?: React.CSSProperties; zIndex?: number }) {
  return (
    <div style={{ ...style, position: "absolute", opacity, transform: `translateY(${(1 - opacity) * 20}px)`, transition: "none", pointerEvents: opacity > 0.5 ? "auto" : "none", zIndex }}>
      {children}
    </div>
  );
}

function CTAButton({ href, primary, children }: { href: string; primary?: boolean; children: React.ReactNode }) {
  const base: React.CSSProperties = primary
    ? { background: "#3b82f6", color: "#ffffff", boxShadow: "0 0 20px rgba(59,130,246,0.3)", border: "1px solid #3b82f6" }
    : { background: "rgba(5,5,10,0.4)", backdropFilter: "blur(8px)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" };
  return (
    <a
      href={href}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "15px 28px", fontSize: "11px", letterSpacing: "0.15em", fontWeight: 600, fontFamily: "Inter, system-ui, sans-serif", textDecoration: "none", transition: "all 0.25s", cursor: "pointer", borderRadius: "2px", ...base }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = primary ? "#2563eb" : "rgba(59,130,246,0.12)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = primary ? "#3b82f6" : "rgba(5,5,10,0.4)"; }}
    >
      {children}
      {primary && <span style={{ fontSize: "13px", marginLeft: 6 }}>&#8594;</span>}
    </a>
  );
}

function VerificationStep({ label, doneLabel, state }: { label: string; doneLabel: string; state: "pending" | "active" | "done" }) {
  if (state === "pending") return null;
  const isDone = state === "done";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, animation: "stepIn 0.4s ease both" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: isDone ? "#3b82f6" : "#60a5fa", boxShadow: isDone ? "none" : "0 0 8px rgba(59,130,246,0.9)" }} />
      <span style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.08em", color: isDone ? "#93c5fd" : "#f8fafc", fontWeight: isDone ? 400 : 600 }}>
        {isDone ? doneLabel : label}
      </span>
    </div>
  );
}

export default function SceneOverlay({ scrollProgress, currentScene, verificationState }: SceneOverlayProps) {
  const vp = Math.max(0, Math.min(1, (scrollProgress - 0.60) / 0.20));
  let step = 0;
  if (vp < 0.15) step = 0;
  else if (vp < 0.30) step = 1;
  else if (vp < 0.50) step = 2;
  else if (vp < 0.68) step = 3;
  else step = 4;

  const getOpacity = (startIn: number, fullIn: number, fullOut: number, endOut: number) => {
    if (scrollProgress < startIn || scrollProgress > endOut) return 0;
    if (scrollProgress < fullIn) return (scrollProgress - startIn) / (fullIn - startIn);
    if (scrollProgress > fullOut) return 1 - (scrollProgress - fullOut) / (endOut - fullOut);
    return 1;
  };

  const o1 = getOpacity(-0.05, 0.0, 0.22, 0.27);
  const o2 = getOpacity(0.27, 0.32, 0.50, 0.55);
  const o3 = getOpacity(0.54, 0.59, 0.76, 0.81);
  const o4 = getOpacity(0.84, 0.89, 1.1, 1.1);
  const PAD = "clamp(24px,4vw,64px)";

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif", pointerEvents: "none" }}>

      {/* SCENE 01 */}
      <SceneFade opacity={o1} zIndex={10} style={{ bottom: 0, left: 0, padding: PAD, paddingBottom: "clamp(48px,6vw,96px)", width: "48%", minWidth: "300px" }}>
        <div style={{ maxWidth: "420px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ height: 1, width: 36, background: "#3b82f6" }} />
            <span style={{ fontSize: 10, letterSpacing: "0.25em", color: "#60a5fa", fontFamily: "monospace", fontWeight: 600 }}>01 // THE CREDENTIAL</span>
          </div>
          <h1 style={{ color: "#f8fafc", fontWeight: 800, fontSize: "clamp(2.4rem,4.8vw,4.2rem)", lineHeight: 0.96, letterSpacing: "-0.03em", marginBottom: 24 }}>
            ACADEMIC<br />
            <span style={{ color: "#3b82f6", textShadow: "0 0 40px rgba(59,130,246,0.4)" }}>CREDENTIALS,</span><br />
            VERIFIABLE.
          </h1>
          <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#60a5fa", fontFamily: "monospace", marginBottom: 20, fontWeight: 500 }}>
            FOR STUDENTS · UNIVERSITIES · EMPLOYERS
          </p>
          <p style={{ color: "#94a3b8", fontSize: "clamp(0.88rem,1.1vw,1.0rem)", lineHeight: 1.75, marginBottom: 40, fontWeight: 400, maxWidth: "380px" }}>
            TokCred anchors academic credential data to the blockchain, creating tamper-proof records verifiable against trusted issuer sources in seconds.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <CTAButton href="#" primary>VERIFY A CREDENTIAL</CTAButton>
            <CTAButton href="#">HOW IT WORKS</CTAButton>
          </div>
        </div>
      </SceneFade>

      {/* SCENE 02 */}
      <SceneFade opacity={o2} zIndex={20} style={{ top: "50%", right: PAD, transform: "translateY(-50%)" }}>
        <div style={{ maxWidth: 340, textAlign: "right" }}>
          <span style={{ display: "block", fontSize: 10, letterSpacing: "0.25em", color: "#60a5fa", marginBottom: 18, fontFamily: "monospace", fontWeight: 600 }}>02 // THE PROOF</span>
          <h2 style={{ color: "#f8fafc", fontWeight: 800, fontSize: "clamp(2.0rem,4.5vw,3.6rem)", lineHeight: 0.96, letterSpacing: "-0.02em", marginBottom: 18 }}>
            THE<br />PROOF
          </h2>
          <div style={{ height: 1, width: 44, background: "#3b82f6", marginLeft: "auto", marginBottom: 22 }} />
          <p style={{ color: "#94a3b8", fontSize: "0.84rem", lineHeight: 1.8, marginBottom: 22 }}>
            Credential data is cryptographically hashed and anchored to a blockchain record, creating verifiable proof that cannot be altered without detection.
          </p>
          <div style={{ padding: "14px 16px", border: "1px solid rgba(59,130,246,0.18)", background: "rgba(5,5,10,0.65)", backdropFilter: "blur(12px)", fontFamily: "monospace", fontSize: "11px", color: "#60a5fa", lineHeight: 1.9, letterSpacing: "0.06em", textAlign: "left", borderRadius: "2px" }}>
            <div style={{ color: "#374151", fontSize: "9px", marginBottom: 3, letterSpacing: "0.2em" }}>CREDENTIAL HASH</div>
            <div style={{ fontWeight: 600, fontSize: "12px" }}>A8F291C3D7E2...</div>
            <div style={{ color: "#374151", fontSize: "9px", marginTop: 10, marginBottom: 3, letterSpacing: "0.2em" }}>BLOCKCHAIN STATUS</div>
            <div style={{ color: "#93c5fd" }}>ANCHORED ✓ BLOCK #184,291</div>
          </div>
        </div>
      </SceneFade>

      {/* SCENE 03 */}
      <SceneFade opacity={o3} zIndex={30} style={{ top: "50%", left: PAD, transform: "translateY(-50%)" }}>
        <div style={{ maxWidth: 320 }}>
          <span style={{ display: "block", fontSize: 10, letterSpacing: "0.25em", color: "#60a5fa", marginBottom: 18, fontFamily: "monospace", fontWeight: 600 }}>03 // THE VERIFICATION</span>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(2.0rem,4.5vw,3.4rem)", lineHeight: 0.96, letterSpacing: "-0.02em", marginBottom: 24, color: step === 4 ? "#60a5fa" : "#f8fafc", transition: "color 0.6s ease" }}>
            {step === 4 ? <>✓<br />VERIFIED</> : <>THE<br />VERIFICATION</>}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
            <VerificationStep label="CREDENTIAL DETECTED" doneLabel="✓ CREDENTIAL DETECTED" state={step >= 1 ? "done" : step === 0 ? "active" : "pending"} />
            <VerificationStep label="CHECKING ISSUER..." doneLabel="✓ ISSUER CONFIRMED" state={step > 1 ? "done" : step === 1 ? "active" : "pending"} />
            <VerificationStep label="EXTRACTING HASH..." doneLabel="✓ HASH: A8F291C3D7E2..." state={step > 2 ? "done" : step === 2 ? "active" : "pending"} />
            <VerificationStep label="MATCHING BLOCKCHAIN..." doneLabel="✓ BLOCKCHAIN MATCHED" state={step > 3 ? "done" : step === 3 ? "active" : "pending"} />
            {step === 4 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, animation: "stepIn 0.5s ease both" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 12px rgba(59,130,246,1.0)", flexShrink: 0 }} />
                <span style={{ fontFamily: "monospace", fontSize: "12px", letterSpacing: "0.12em", color: "#60a5fa", fontWeight: 700 }}>✓ VERIFIED</span>
              </div>
            )}
          </div>
          {step === 4 && (
            <div style={{ padding: "16px", border: "1px solid rgba(59,130,246,0.22)", background: "rgba(5,5,10,0.72)", backdropFilter: "blur(12px)", borderRadius: "2px", animation: "stepIn 0.7s ease both" }}>
              {[
                { label: "ISSUER", value: "EXAMPLE UNIVERSITY", blue: false },
                { label: "CREDENTIAL", value: "B.TECH - ALEX CHEN", blue: false },
                { label: "HASH", value: "A8F291C3D7E2...", blue: false },
                { label: "STATUS", value: "CRYPTOGRAPHICALLY VERIFIED", blue: true },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: "10px", gap: 12 }}>
                  <span style={{ fontFamily: "monospace", color: "#374151", letterSpacing: "0.15em", flexShrink: 0 }}>{item.label}</span>
                  <span style={{ fontFamily: "monospace", color: item.blue ? "#60a5fa" : "#cbd5e1", letterSpacing: "0.04em", textAlign: "right" }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SceneFade>

      {/* SCENE 04 */}
      <SceneFade opacity={o4} zIndex={40} style={{ top: PAD, left: PAD }}>
        <div style={{ maxWidth: "460px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ width: 22, height: 22, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.6)", borderRadius: 2 }} />
            <span style={{ fontSize: 13, letterSpacing: "0.25em", color: "#f8fafc", fontWeight: 600 }}>TOKCRED</span>
          </div>
          <h2 style={{ color: "#f8fafc", fontWeight: 800, fontSize: "clamp(1.9rem,4.5vw,3.6rem)", lineHeight: 0.96, letterSpacing: "-0.03em", marginBottom: 28 }}>
            TRUST<br />
            <span style={{ color: "#3b82f6", textShadow: "0 0 40px rgba(59,130,246,0.3)" }}>WHAT YOU</span><br />
            CAN VERIFY.
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.75, maxWidth: 400, marginBottom: 40, fontWeight: 400 }}>
            One verified credential, verifiable across the institutions and employers who rely on trusted proof.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            <CTAButton href="#" primary>VERIFY A CREDENTIAL</CTAButton>
            <CTAButton href="#">ENTER TOKCRED</CTAButton>
          </div>
        </div>
      </SceneFade>

      {/* SCENE 04 network labels */}
      <SceneFade opacity={o4} zIndex={35} style={{ top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          {[
            { label: "VERIFIED CREDENTIAL", top: "42%", left: "50%", delay: 0, highlight: true },
            { label: "STUDENT", top: "58%", left: "38%", delay: 0.1, highlight: false },
            { label: "UNIVERSITY", top: "35%", left: "60%", delay: 0.2, highlight: false },
            { label: "EMPLOYER", top: "56%", left: "62%", delay: 0.3, highlight: false },
          ].map(({ label, top, left, delay, highlight }) => {
            const nodeOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.72 - delay) / 0.10));
            return (
              <div key={label} style={{ position: "absolute", top, left, transform: "translate(-50%,-50%)", opacity: nodeOpacity, fontFamily: "monospace", fontSize: "10px", color: highlight ? "#60a5fa" : "#94a3b8", letterSpacing: "0.15em", fontWeight: highlight ? 600 : 400, whiteSpace: "nowrap" }}>
                {label}
              </div>
            );
          })}
        </div>
      </SceneFade>

      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
