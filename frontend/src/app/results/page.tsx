"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import {
  ProjectResult,
  Slide,
  Idea,
  RankedIdea,
  SolutionBlueprint,
  SlideDesign,
} from "../../types/project";

// ─── Tab config ───────────────────────────────────────────────────────────────
type Tab =
  | "overview"
  | "ideas"
  | "rankings"
  | "winner"
  | "blueprint"
  | "slides"
  | "pitches"
  | "report"
  | "docs";
const TABS: { id: Tab; label: string; sym: string }[] = [
  { id: "overview", label: "Overview", sym: "◈" },
  { id: "ideas", label: "Ideas", sym: "◆" },
  { id: "rankings", label: "Rankings", sym: "⚖" },
  { id: "winner", label: "Winner", sym: "✦" },
  { id: "blueprint", label: "Blueprint", sym: "◉" },
  { id: "slides", label: "Slides", sym: "▣" },
  { id: "pitches", label: "Pitches", sym: "◎" },
  { id: "report", label: "Report", sym: "▤" },
  { id: "docs", label: "Docs", sym: "⬡" },
];

// ─── Micro components ─────────────────────────────────────────────────────────
function SLabel({
  children,
  color = "var(--text-3)",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <p
      style={{
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color,
        marginBottom: "8px",
      }}
    >
      {children}
    </p>
  );
}

function BList({
  items,
  color = "var(--text-2)",
}: {
  items: string[];
  color?: string;
}) {
  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "5px",
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontSize: "12px",
            color,
            lineHeight: 1.6,
            display: "flex",
            gap: "8px",
          }}
        >
          <span style={{ color: "var(--text-3)", flexShrink: 0 }}>—</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ScoreBar({
  value,
  color = "var(--blue)",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div className="score-track" style={{ flex: 1 }}>
        <div
          className="score-fill"
          style={{ width: `${value * 10}%`, background: color }}
        />
      </div>
      <span
        style={{
          fontSize: "11px",
          color: "var(--text-2)",
          fontFamily: "var(--font-mono)",
          minWidth: "24px",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function GCard({
  children,
  accent = false,
  blue = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
  blue?: boolean;
}) {
  return (
    <div
      style={{
        background: blue ? "rgba(61,124,246,0.06)" : "var(--surface-1)",
        padding: "20px",
        borderLeft: blue
          ? "2px solid var(--blue)"
          : accent
            ? "2px solid var(--lime)"
            : "1px solid var(--border)",
      }}
    >
      {children}
    </div>
  );
}

function SectionHead({
  label,
  title,
  accent,
}: {
  label: string;
  title: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-3)",
          letterSpacing: "0.05em",
          display: "block",
          marginBottom: "8px",
        }}
      >
        {label}
      </span>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(20px,3vw,28px)",
          letterSpacing: "-0.02em",
          color: "var(--text-1)",
        }}
      >
        {title}
      </h3>
      {accent && (
        <div
          style={{
            width: "32px",
            height: "2px",
            background: "var(--blue)",
            marginTop: "12px",
          }}
        />
      )}
    </div>
  );
}

// ─── Expandable idea row ──────────────────────────────────────────────────────
function IdeaRow({ idea, rank }: { idea: Idea; rank: number }) {
  const [open, setOpen] = useState(false);
  const isTop = rank === 1;
  return (
    <div
      style={{
        background: isTop ? "rgba(61,124,246,0.06)" : "var(--surface-1)",
        borderLeft: isTop ? "2px solid var(--blue)" : "1px solid var(--border)",
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: isTop ? "var(--blue-light)" : "var(--text-3)",
            minWidth: "20px",
          }}
        >
          {String(rank).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-1)",
              marginBottom: "3px",
              letterSpacing: "-0.01em",
            }}
          >
            {idea.title}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-3)" }}>
            {idea.category || idea.tech_stack?.join(", ")}
          </p>
        </div>
        {isTop && (
          <span className="badge badge-blue" style={{ fontSize: "9px" }}>
            Top Pick
          </span>
        )}
        <span
          style={{
            color: "var(--text-3)",
            fontSize: "10px",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        >
          ▼
        </span>
      </div>
      {open && (
        <div
          style={{
            padding: "0 20px 20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-2)",
              lineHeight: 1.75,
              paddingTop: "16px",
              marginBottom: "16px",
            }}
          >
            {idea.description}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "1px",
              background: "var(--border)",
              marginBottom: "16px",
            }}
          >
            {[
              {
                l: "Feasibility",
                v: idea.feasibility_score,
                c: "var(--blue-light)",
              },
              { l: "Innovation", v: idea.innovation_score, c: "var(--sky)" },
              { l: "Fit", v: idea.hackathon_fit_score, c: "var(--lime)" },
            ].map(({ l, v, c }) => (
              <div
                key={l}
                style={{
                  background: "var(--surface-1)",
                  padding: "14px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "22px",
                    color: c,
                    marginBottom: "3px",
                  }}
                >
                  {v}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "var(--text-3)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Expandable ranked idea row ───────────────────────────────────────────────
function RankedRow({ idea, rank }: { idea: RankedIdea; rank: number }) {
  const [open, setOpen] = useState(false);
  const isTop = rank === 1;
  return (
    <div
      style={{
        background: isTop ? "rgba(61,124,246,0.06)" : "var(--surface-1)",
        borderLeft: isTop ? "2px solid var(--blue)" : "1px solid var(--border)",
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "14px 20px",
          display: "flex",
          gap: "14px",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: isTop ? "var(--blue-light)" : "var(--text-3)",
            minWidth: "20px",
          }}
        >
          {String(rank).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-1)",
              marginBottom: "3px",
              letterSpacing: "-0.01em",
            }}
          >
            {idea.title}
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              ["F", idea.feasibility_score, "var(--blue-light)"],
              ["I", idea.innovation_score, "var(--sky)"],
              ["Fit", idea.hackathon_fit_score, "var(--lime)"],
              ["M", idea.market_potential_score, "var(--text-2)"],
              ["W", idea.technical_wow_factor, "var(--text-2)"],
            ].map(([l, v, c]) => (
              <span
                key={l as string}
                style={{
                  fontSize: "10px",
                  color: c as string,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {l}:{v}
              </span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "20px",
              color: isTop ? "var(--blue-light)" : "var(--text-2)",
              letterSpacing: "-0.02em",
            }}
          >
            {idea.final_score}
          </div>
          <div style={{ fontSize: "9px", color: "var(--text-3)" }}>/10</div>
        </div>
        <span
          style={{
            color: "var(--text-3)",
            fontSize: "10px",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        >
          ▼
        </span>
      </div>
      {open && (
        <div
          style={{
            padding: "0 20px 20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-2)",
              lineHeight: 1.75,
              paddingTop: "14px",
              marginBottom: "14px",
            }}
          >
            {idea.description}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1px",
              background: "var(--border)",
            }}
          >
            {idea.strengths?.length > 0 && (
              <GCard accent>
                <SLabel color="var(--lime)">Strengths</SLabel>
                <BList items={idea.strengths} color="var(--text-2)" />
              </GCard>
            )}
            {idea.weaknesses?.length > 0 && (
              <GCard>
                <SLabel>Weaknesses</SLabel>
                <BList items={idea.weaknesses} />
              </GCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Slide panel ──────────────────────────────────────────────────────────────
function SlidePanel({ slide, design }: { slide: Slide; design?: SlideDesign }) {
  const [open, setOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  return (
    <div
      style={{
        background: "var(--surface-1)",
        borderLeft: "1px solid var(--border)",
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "14px 20px",
          display: "flex",
          gap: "14px",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: "var(--text-3)",
            minWidth: "20px",
          }}
        >
          {String(slide.slide_number).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-1)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {slide.title}
            </p>
            {design && (
              <span 
                className="badge" 
                style={{ 
                  fontSize: "9px", 
                  padding: "1px 6px", 
                  background: "var(--surface-3)", 
                  color: "var(--text-2)",
                  border: "1px solid var(--border)",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase"
                }}
              >
                {design.layout}
              </span>
            )}
          </div>
          <p style={{ fontSize: "10px", color: "var(--text-3)", margin: 0 }}>
            {slide.slide_type ?? slide.objective}
          </p>
        </div>
        <span
          style={{
            color: "var(--text-3)",
            fontSize: "10px",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        >
          ▼
        </span>
      </div>
      {open && (
        <div
          style={{
            padding: "0 20px 20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div style={{ paddingTop: "14px", marginBottom: "14px" }}>
            <SLabel>Content Points</SLabel>
            {slide.content.map((c, i) => (
              <p
                key={i}
                style={{
                  fontSize: "12px",
                  color: "var(--text-2)",
                  lineHeight: 1.65,
                  padding: "3px 0 3px 12px",
                  borderLeft: "1px solid var(--border-mid)",
                }}
              >
                {c}
              </p>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: design ? "repeat(auto-fit, minmax(250px, 1fr))" : "1fr 1fr",
              gap: "1px",
              background: "var(--border)",
            }}
          >
            <GCard blue>
              <SLabel color="var(--blue-light)">Speaker Notes</SLabel>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-2)",
                  lineHeight: 1.6,
                  margin: 0
                }}
              >
                {slide.speaker_notes || slide.presentation_script}
              </p>
            </GCard>
            <GCard>
              <SLabel>Visual Suggestion</SLabel>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-2)",
                  lineHeight: 1.6,
                  margin: 0
                }}
              >
                {slide.visual_suggestion}
              </p>
            </GCard>
            {design && (
              <div
                style={{
                  background: "rgba(194,255,77,0.04)",
                  padding: "20px",
                  borderLeft: "2px solid var(--lime)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px"
                }}
              >
                <div>
                  <SLabel color="var(--lime)">Layout & Art Direction</SLabel>
                  <div style={{ fontSize: "11px", color: "var(--text-2)", lineHeight: 1.6 }}>
                    <p style={{ margin: "0 0 6px 0" }}>
                      <strong style={{ color: "var(--text-1)" }}>Layout Style:</strong> {design.layout}
                    </p>
                    <p style={{ margin: "0 0 6px 0" }}>
                      <strong style={{ color: "var(--text-1)" }}>Visual Focus:</strong> {design.visual_focus}
                    </p>
                    <p style={{ margin: "0" }}>
                      <strong style={{ color: "var(--text-1)" }}>Needs AI Image:</strong> {design.needs_image ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {design.needs_image && design.image_prompt && (
                  <div style={{ marginTop: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "9px", color: "var(--text-3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        AI Image Prompt
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(design.image_prompt);
                          setCopiedPrompt(true);
                          setTimeout(() => setCopiedPrompt(false), 2000);
                        }}
                        style={{
                          fontSize: "9px",
                          color: copiedPrompt ? "var(--lime)" : "var(--text-3)",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          padding: "2px 6px",
                          cursor: "pointer",
                          borderRadius: "2px",
                          transition: "all 0.15s"
                        }}
                      >
                        {copiedPrompt ? "✓ Copied" : "Copy Prompt"}
                      </button>
                    </div>
                    <p style={{ 
                      fontSize: "10px", 
                      fontFamily: "var(--font-mono)", 
                      color: "var(--text-3)", 
                      background: "var(--surface-2)",
                      padding: "8px",
                      border: "1px solid var(--border)",
                      borderRadius: "2px",
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word"
                    }}>
                      {design.image_prompt}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pitch block ──────────────────────────────────────────────────────────────
function PitchBlock({
  label,
  duration,
  text,
  accentTop = false,
}: {
  label: string;
  duration: string;
  text: string;
  accentTop?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      style={{
        background: accentTop ? "rgba(194,255,77,0.04)" : "var(--surface-1)",
        borderLeft: accentTop
          ? "2px solid var(--lime)"
          : "1px solid var(--border)",
        marginBottom: "1px",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: accentTop ? "var(--lime)" : "var(--text-1)",
              marginBottom: "2px",
            }}
          >
            {label}
          </p>
          <p style={{ fontSize: "10px", color: "var(--text-3)" }}>{duration}</p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          style={{
            fontSize: "11px",
            color: copied ? "var(--lime)" : "var(--text-3)",
            background: "none",
            border: "1px solid var(--border-mid)",
            padding: "4px 10px",
            cursor: "pointer",
            borderRadius: "2px",
            transition: "all 0.15s",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <p
        style={{
          padding: "16px 20px",
          fontSize: "13px",
          color: "var(--text-2)",
          lineHeight: 1.8,
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </p>
    </div>
  );
}

// ─── Blueprint view ───────────────────────────────────────────────────────────
function BlueprintView({ bp }: { bp: SolutionBlueprint }) {
  const pv = bp.product_vision;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {pv && (
        <div
          style={{
            background: "rgba(61,124,246,0.06)",
            borderLeft: "2px solid var(--blue)",
            padding: "24px 28px",
          }}
        >
          <SLabel color="var(--blue-light)">Product Vision</SLabel>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "22px",
              color: "var(--text-1)",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            {pv.name}
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-2)",
              lineHeight: 1.75,
              maxWidth: "600px",
              marginBottom: "16px",
            }}
          >
            {pv.elevator_pitch}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1px",
              background: "var(--border)",
            }}
          >
            {pv.problem_solved && (
              <GCard>
                <SLabel>Problem Solved</SLabel>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-2)",
                    lineHeight: 1.6,
                  }}
                >
                  {pv.problem_solved}
                </p>
              </GCard>
            )}
            {(pv.why_this_wins as string) && (
              <GCard blue>
                <SLabel color="var(--blue-light)">Why This Wins</SLabel>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-2)",
                    lineHeight: 1.6,
                  }}
                >
                  {pv.why_this_wins as string}
                </p>
              </GCard>
            )}
          </div>
        </div>
      )}
      {bp.architecture_overview && (
        <div
          style={{
            background: "var(--surface-1)",
            padding: "20px 28px",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <SLabel>Architecture Overview</SLabel>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-2)",
              lineHeight: 1.7,
            }}
          >
            {bp.architecture_overview}
          </p>
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "1px",
          background: "var(--border)",
        }}
      >
        {bp.target_users?.length > 0 && (
          <GCard>
            <SLabel>Target Users</SLabel>
            <BList items={bp.target_users} />
          </GCard>
        )}
        {bp.core_features?.length > 0 && (
          <GCard blue>
            <SLabel color="var(--blue-light)">Core Features</SLabel>
            <BList items={bp.core_features} color="var(--sky)" />
          </GCard>
        )}
        {bp.mvp_scope?.length > 0 && (
          <GCard>
            <SLabel>MVP Scope</SLabel>
            <BList items={bp.mvp_scope} />
          </GCard>
        )}
        {bp.ai_components?.length > 0 && (
          <GCard accent>
            <SLabel color="var(--lime)">AI Components</SLabel>
            <BList items={bp.ai_components} color="var(--text-2)" />
          </GCard>
        )}
        {bp.frontend_components?.length > 0 && (
          <GCard>
            <SLabel>Frontend</SLabel>
            <BList items={bp.frontend_components} />
          </GCard>
        )}
        {bp.integrations?.length > 0 && (
          <GCard>
            <SLabel>Integrations</SLabel>
            <BList items={bp.integrations} />
          </GCard>
        )}
      </div>
      {bp.implementation_steps?.length > 0 && (
        <div
          style={{
            background: "var(--surface-1)",
            padding: "20px 28px",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <SLabel>Implementation Roadmap</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {bp.implementation_steps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--text-3)",
                    minWidth: "20px",
                    paddingTop: "3px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-2)",
                    lineHeight: 1.6,
                  }}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {bp.database_schema?.length > 0 && (
        <div
          style={{
            background: "var(--surface-1)",
            padding: "20px 28px",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <SLabel>Database Schema</SLabel>
          <BList items={bp.database_schema} />
        </div>
      )}
    </div>
  );
}

// ─── Markdown viewer ──────────────────────────────────────────────────────────
function MarkdownViewer({
  text,
  filename,
}: {
  text: string;
  filename: string;
}) {
  const [copied, setCopied] = useState(false);
  function handleDownload() {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  if (!text)
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--text-3)",
          fontSize: "13px",
        }}
      >
        Not generated yet — run the full workflow to produce this document.
      </div>
    );
  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="btn btn-ghost"
          style={{ padding: "7px 14px", fontSize: "12px" }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <button
          onClick={handleDownload}
          className="btn btn-primary"
          style={{ padding: "7px 14px", fontSize: "12px" }}
        >
          ↓ Download {filename}
        </button>
      </div>
      {/* Terminal viewer */}
      <div className="term-window">
        <div className="term-bar">
          <div className="term-dot term-dot-r" />
          <div className="term-dot term-dot-y" />
          <div className="term-dot term-dot-g" />
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-3)",
            }}
          >
            exhacker · {filename} — {text.split("\n").length} lines
          </span>
        </div>
        <div style={{ padding: "20px", maxHeight: "600px", overflowY: "auto" }}>
          <pre
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              lineHeight: 1.9,
              color: "var(--text-2)",
              whiteSpace: "pre-wrap",
              margin: 0,
            }}
          >
            {text}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ─── Docs tab ────────────────────────────────────────────────────────────────
function DocsTab({ result }: { result: ProjectResult }) {
  const [downloadingPptx, setDownloadingPptx] = useState(false);

  // Extract architecture text from solution_blueprint (no separate agent output exists)
  const archText = result.solution_blueprint?.architecture_overview;

  async function handleDownloadPptx() {
    const sessionId = sessionStorage.getItem("exhacker_results_session") || sessionStorage.getItem("exhacker_session_id");
    if (!sessionId) {
      alert("Session ID not found. Try running a new project first.");
      return;
    }
    setDownloadingPptx(true);
    try {
      const res = await fetch(`http://localhost:8000/workflow/download-pptx/${sessionId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to generate PPTX.");
      }
      
      let filename = "Pitch_Deck.pptx";
      const disposition = res.headers.get("content-disposition");
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred while generating the pitch deck.");
    } finally {
      setDownloadingPptx(false);
    }
  }

  const docs = [
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="13" y2="16" />
        </svg>
      ),
      label: "PRD",
      desc: "Full Product Requirements Doc covering features, API, schema, and roadmap.",
      textVal: result.prd_document,
      file: "prd.md",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L8.5 8.5 2 9.27l5 4.87-1.18 6.88L12 17.77l6.18 3.25L17 14.14l5-4.87-6.5-.77L12 2z" />
        </svg>
      ),
      label: "Vision Doc",
      desc: "Product vision, market opportunity, guiding principles, and 30-sec pitch.",
      textVal: result.vision_document,
      file: "vision.md",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="5" rx="1" />
          <rect x="2" y="10" width="20" height="5" rx="1" />
          <rect x="2" y="17" width="20" height="4" rx="1" />
          <circle cx="6" cy="5.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="6" cy="12.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="6" cy="19" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
      label: "Architecture",
      desc: "Technical architecture, stack decisions, integration notes.",
      textVal: archText,
      file: "architecture.md",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      ),
      label: "Final Report",
      desc: "Complete strategy document combining all agent outputs.",
      textVal: result.final_report,
      file: "final_report.md",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 17h14v2H5zm7-12L5.33 13.5h3.33V15h6.67v-1.5h3.33z" />
          <path d="M2 17h20v2H2zm2 2v1h16v-1z" />
        </svg>
      ),
      label: "Investor Pitch Deck",
      desc: "Professional 13-slide PowerPoint pitch presentation design (.pptx).",
      isPptx: true,
      textVal: "generate",
      file: "Pitch_Deck.pptx",
    },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "1px",
          background: "var(--border)",
          marginBottom: "16px",
        }}
      >
        {docs.map((d) => {
          const text = d.textVal;
          return (
            <div
              key={d.label}
              style={{
                background: "var(--surface-1)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ color: d.isPptx ? "var(--lime)" : "var(--blue-light)", opacity: 0.9 }}>
                {d.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "15px",
                    color: "var(--text-1)",
                    marginBottom: "4px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {d.label}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-2)",
                    lineHeight: 1.6,
                  }}
                >
                  {d.desc}
                </p>
              </div>
              {d.isPptx ? (
                <button
                  onClick={handleDownloadPptx}
                  disabled={downloadingPptx}
                  className="btn btn-lime"
                  style={{
                    padding: "8px 16px",
                    fontSize: "12px",
                    alignSelf: "flex-start",
                  }}
                >
                  {downloadingPptx ? "Generating Deck..." : "↓ Download PPTX"}
                </button>
              ) : text ? (
                <button
                  onClick={() => {
                    const b = new Blob([text], { type: "text/markdown" });
                    const u = URL.createObjectURL(b);
                    const a = document.createElement("a");
                    a.href = u;
                    a.download = d.file;
                    a.click();
                    URL.revokeObjectURL(u);
                  }}
                  className="btn btn-primary"
                  style={{
                    padding: "8px 16px",
                    fontSize: "12px",
                    alignSelf: "flex-start",
                  }}
                >
                  ↓ Download
                </button>
              ) : (
                <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                  Not generated yet
                </span>
              )}
            </div>
          );
        })}
      </div>
      {result.prd_document && (
        <div style={{ marginBottom: "32px" }}>
          <MarkdownViewer text={result.prd_document} filename="prd.md" />
        </div>
      )}
      {result.vision_document && (
        <div style={{ marginBottom: "32px" }}>
          <MarkdownViewer text={result.vision_document} filename="vision.md" />
        </div>
      )}
      {archText && (
        <div style={{ marginBottom: "32px" }}>
          <MarkdownViewer text={archText} filename="architecture.md" />
        </div>
      )}
      {result.final_report && (
        <MarkdownViewer text={result.final_report} filename="final_report.md" />
      )}
    </div>
  );
}

// ─── Main results page ────────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<ProjectResult | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    try {
      const raw =
        sessionStorage.getItem("exhacker_results_steps") ||
        sessionStorage.getItem("exhacker_workflow_steps");
      if (!raw) {
        router.push("/generate");
        return;
      }
      const steps = JSON.parse(raw) as {
        step: string;
        label: string;
        output: unknown;
      }[];
      const merged: Record<string, unknown> = {};
      for (const s of steps) {
        Object.assign(merged, s.output as Record<string, unknown>);
      }
      setResult(merged as unknown as ProjectResult);
    } catch {
      router.push("/generate");
    }
  }, [router]);

  if (!result)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--black)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spinner" />
      </div>
    );

  const bp = result.solution_blueprint as SolutionBlueprint | undefined;
  const pv = bp?.product_vision;
  const sel: Idea | RankedIdea | undefined =
    result.ranked_ideas?.[0] || result.ideas?.[0];
  const isIdea = (item: Idea | RankedIdea | undefined): item is Idea =>
    !!item && "problem_solved" in item;
  const isRankedIdea = (
    item: Idea | RankedIdea | undefined,
  ): item is RankedIdea => !!item && "final_score" in item;

  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: "100vh",
          background: "transparent",
          paddingTop: "60px",
        }}
      >
        {/* ══ Result header ════════════════════════════════════════════════ */}
        <section
          style={{
            background: "rgba(14,14,14,0.85)",
            backdropFilter: "blur(4px)",
            borderBottom: "1px solid var(--border)",
            padding: "36px 0",
          }}
        >
          <div className="container">
            <div
              style={{
                display: "flex",
                gap: "24px",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <span className="badge badge-blue">
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "var(--blue)",
                      }}
                    />
                    Strategy Ready
                  </span>
                  {result.hackathon_name && (
                    <span className="badge">{result.hackathon_name}</span>
                  )}
                </div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "clamp(20px,4vw,36px)",
                    letterSpacing: "-0.03em",
                    color: "var(--text-1)",
                    marginBottom: "8px",
                  }}
                >
                  {pv?.name || sel?.title || "Your Strategy"}
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-2)",
                    maxWidth: "560px",
                    lineHeight: 1.6,
                  }}
                >
                  {(pv?.elevator_pitch as string) ||
                    sel?.description?.slice(0, 120) ||
                    ""}
                </p>
              </div>
              {/* Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "1px",
                  background: "var(--border)",
                  alignSelf: "flex-start",
                  minWidth: "280px",
                }}
              >
                {[
                  { n: result.ideas?.length || 0, l: "Ideas" },
                  { n: result.slides?.length || 0, l: "Slides" },
                  { n: 3, l: "Pitches" },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      background: "var(--surface-1)",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: "24px",
                        color: "var(--blue-light)",
                        letterSpacing: "-0.02em",
                        marginBottom: "3px",
                      }}
                    >
                      {s.n}
                    </div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "var(--text-3)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ Tab strip ════════════════════════════════════════════════════ */}
        <div
          style={{
            background: "rgba(14,14,14,0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: "60px",
            zIndex: 10,
            overflowX: "auto",
          }}
        >
          <div className="container" style={{ display: "flex" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`tab-btn ${tab === t.id ? "active" : ""}`}
              >
                <span style={{ marginRight: "6px" }}>{t.sym}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ Tab content ══════════════════════════════════════════════════ */}
        <div className="container" style={{ padding: "48px 40px" }}>
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="anim-fade-up">
              {/* Winner spotlight */}
              {sel && (
                <section style={{ marginBottom: "56px" }}>
                  <SectionHead
                    label="[ WINNER ]"
                    title={
                      <>
                        <span style={{ color: "var(--blue)" }}>
                          {sel.title?.split(" ").slice(0, -1).join(" ")}
                        </span>{" "}
                        {sel.title?.split(" ").at(-1)}
                      </>
                    }
                    accent
                  />
                  <div
                    style={{
                      background: "rgba(61,124,246,0.05)",
                      borderLeft: "2px solid var(--blue)",
                      padding: "28px 32px",
                      position: "relative",
                      overflow: "hidden",
                      marginBottom: "1px",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "1px",
                        background:
                          "linear-gradient(90deg,transparent,var(--blue),transparent)",
                        opacity: 0.4,
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: "24px",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "280px" }}>
                        <p
                          style={{
                            fontSize: "15px",
                            color: "var(--text-2)",
                            lineHeight: 1.75,
                            maxWidth: "600px",
                            marginBottom: "20px",
                          }}
                        >
                          {sel.description}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            flexWrap: "wrap",
                          }}
                        >
                          {[
                            {
                              l: "Feasibility",
                              v: (sel as RankedIdea).feasibility_score,
                              c: "var(--blue-light)",
                            },
                            {
                              l: "Innovation",
                              v: (sel as RankedIdea).innovation_score,
                              c: "var(--sky)",
                            },
                            {
                              l: "Hackathon Fit",
                              v: (sel as RankedIdea).hackathon_fit_score,
                              c: "var(--lime)",
                            },
                          ].map(({ l, v, c }) => (
                            <div key={l} style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  fontFamily: "var(--font-display)",
                                  fontWeight: 800,
                                  fontSize: "28px",
                                  color: c,
                                  letterSpacing: "-0.02em",
                                }}
                              >
                                {v}
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "var(--text-3)",
                                  }}
                                >
                                  /10
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: "9px",
                                  color: "var(--text-3)",
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase",
                                }}
                              >
                                {l}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {typeof (sel as RankedIdea).final_score === "number" && (
                        <div
                          style={{
                            textAlign: "center",
                            background: "var(--surface-1)",
                            padding: "20px 28px",
                            borderLeft: "1px solid var(--border)",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 800,
                              fontSize: "52px",
                              color: "var(--blue-light)",
                              letterSpacing: "-0.04em",
                              lineHeight: 1,
                            }}
                          >
                            {(sel as RankedIdea).final_score}
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: "var(--text-3)",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                            }}
                          >
                            Overall Score
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Problem analysis preview */}
              {result.problem_analysis?.problem_statement && (
                <section style={{ marginBottom: "48px" }}>
                  <SectionHead label="[ ANALYSIS ]" title="Problem Breakdown" />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr",
                      gap: "1px",
                      background: "var(--border)",
                    }}
                  >
                    <GCard>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--text-2)",
                          lineHeight: 1.75,
                        }}
                      >
                        {result.problem_analysis.problem_statement}
                      </p>
                    </GCard>
                    {Array.isArray(result.problem_analysis.pain_points) &&
                      result.problem_analysis.pain_points.length > 0 && (
                        <GCard>
                          <SLabel color="var(--text-3)">Pain Points</SLabel>
                          <BList
                            items={result.problem_analysis.pain_points}
                            color="var(--text-2)"
                          />
                        </GCard>
                      )}
                    {Array.isArray(result.problem_analysis.success_metrics) &&
                      result.problem_analysis.success_metrics.length > 0 && (
                        <GCard blue>
                          <SLabel color="var(--blue-light)">
                            Success Metrics
                          </SLabel>
                          <BList
                            items={result.problem_analysis.success_metrics}
                            color="var(--sky)"
                          />
                        </GCard>
                      )}
                  </div>
                </section>
              )}

              {/* Quick nav */}
              <section>
                <SectionHead label="[ EXPLORE ]" title="All Outputs" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                    gap: "1px",
                    background: "var(--border)",
                  }}
                >
                  {TABS.filter((t) => t.id !== "overview").map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      style={{
                        background: "var(--surface-1)",
                        border: "none",
                        padding: "20px 16px",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--surface-2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "var(--surface-1)")
                      }
                    >
                      <span
                        style={{ fontSize: "18px", color: "var(--text-3)" }}
                      >
                        {t.sym}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--text-2)",
                          letterSpacing: "0.02em",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* IDEAS */}
          {tab === "ideas" && (
            <div className="anim-fade-up">
              <SectionHead
                label={`[ ${result.ideas?.length || 0} IDEAS GENERATED ]`}
                title={
                  <>
                    All Concepts —{" "}
                    <span style={{ color: "var(--blue-light)" }}>Ranked</span>
                  </>
                }
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px",
                  background: "var(--border)",
                }}
              >
                {result.ideas?.map((idea, i) => (
                  <IdeaRow key={idea.title + i} idea={idea} rank={i + 1} />
                ))}
              </div>
            </div>
          )}

          {/* RANKINGS */}
          {tab === "rankings" && (
            <div className="anim-fade-up">
              <SectionHead
                label="[ RANKINGS ]"
                title={
                  <>
                    Scored Across{" "}
                    <span style={{ color: "var(--sky)" }}>5 Dimensions</span>
                  </>
                }
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px",
                  background: "var(--border)",
                }}
              >
                {result.ranked_ideas?.map((idea, i) => (
                  <RankedRow key={idea.title + i} idea={idea} rank={i + 1} />
                ))}
              </div>
            </div>
          )}

          {/* WINNER */}
          {tab === "winner" && sel && (
            <div className="anim-fade-up">
              <SectionHead
                label="[ WINNER ]"
                title={
                  <>
                    {sel.title?.split(" ").slice(0, -1).join(" ")}{" "}
                    <span style={{ color: "var(--blue)" }}>
                      {sel.title?.split(" ").at(-1)}
                    </span>
                  </>
                }
              />
              <div
                style={{ display: "flex", flexDirection: "column", gap: "1px" }}
              >
                <div
                  style={{
                    background: "rgba(61,124,246,0.05)",
                    borderLeft: "2px solid var(--blue)",
                    padding: "24px 28px",
                    marginBottom: "1px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "15px",
                      color: "var(--text-2)",
                      lineHeight: 1.8,
                    }}
                  >
                    {sel.description}
                  </p>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "1px",
                    background: "var(--border)",
                    marginBottom: "1px",
                  }}
                >
                  {[
                    {
                      l: "Feasibility",
                      v: (sel as RankedIdea).feasibility_score,
                      c: "var(--blue-light)",
                    },
                    {
                      l: "Innovation",
                      v: (sel as RankedIdea).innovation_score,
                      c: "var(--sky)",
                    },
                    {
                      l: "Hackathon Fit",
                      v: (sel as RankedIdea).hackathon_fit_score,
                      c: "var(--lime)",
                    },
                  ].map(({ l, v, c }) => (
                    <div
                      key={l}
                      style={{
                        background: "var(--surface-1)",
                        padding: "24px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: "36px",
                          color: c,
                          marginBottom: "4px",
                        }}
                      >
                        {v}
                        <span
                          style={{ fontSize: "14px", color: "var(--text-3)" }}
                        >
                          /10
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "var(--text-3)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {l}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: "1px",
                    background: "var(--border)",
                  }}
                >
                  {isIdea(sel) && sel.problem_solved && (
                    <GCard>
                      <SLabel>Problem Solved</SLabel>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-2)",
                          lineHeight: 1.65,
                        }}
                      >
                        {sel.problem_solved}
                      </p>
                    </GCard>
                  )}
                  {isIdea(sel) && sel.why_it_wins && (
                    <GCard blue>
                      <SLabel color="var(--blue-light)">Why It Wins</SLabel>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-2)",
                          lineHeight: 1.65,
                        }}
                      >
                        {sel.why_it_wins}
                      </p>
                    </GCard>
                  )}
                  {isIdea(sel) && sel.innovation_factor && (
                    <GCard>
                      <SLabel>Innovation Factor</SLabel>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-2)",
                          lineHeight: 1.65,
                        }}
                      >
                        {sel.innovation_factor}
                      </p>
                    </GCard>
                  )}
                  {isRankedIdea(sel) && sel.strengths?.length > 0 && (
                    <GCard accent>
                      <SLabel color="var(--lime)">Strengths</SLabel>
                      <BList items={sel.strengths} color="var(--text-2)" />
                    </GCard>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BLUEPRINT */}
          {tab === "blueprint" && (
            <div className="anim-fade-up">
              <SectionHead
                label="[ SOLUTION ARCHITECT ]"
                title={
                  <>
                    Technical{" "}
                    <span style={{ color: "var(--blue-light)" }}>
                      Blueprint
                    </span>
                  </>
                }
              />
              {bp ? (
                <BlueprintView bp={bp} />
              ) : (
                <p style={{ color: "var(--text-3)", fontSize: "13px" }}>
                  Blueprint not generated yet.
                </p>
              )}
            </div>
          )}

          {/* SLIDES */}
          {tab === "slides" && (
            <div className="anim-fade-up">
              <SectionHead
                label={`[ ${result.slides?.length || 0} SLIDES ]`}
                title={
                  <>
                    Pitch Deck —{" "}
                    <span style={{ color: "var(--sky)" }}>Click to Expand</span>
                  </>
                }
              />

              {result.ppt_design?.deck_theme && (
                <div
                  style={{
                    background: "rgba(61,124,246,0.06)",
                    padding: "24px",
                    borderLeft: "2px solid var(--blue)",
                    marginBottom: "24px",
                  }}
                >
                  <SLabel color="var(--blue-light)">Deck Theme & Art Direction</SLabel>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "var(--text-1)",
                      marginBottom: "12px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Style: {result.ppt_design.deck_theme.style}
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "16px",
                      fontSize: "12px",
                      color: "var(--text-2)",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--text-3)" }}>Primary:</span>{" "}
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        {result.ppt_design.deck_theme.primary_color}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-3)" }}>Secondary:</span>{" "}
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        {result.ppt_design.deck_theme.secondary_color}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-3)" }}>Background:</span>{" "}
                      <span style={{ fontWeight: 600 }}>
                        {result.ppt_design.deck_theme.background_style}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-3)" }}>Font Family:</span>{" "}
                      <span style={{ fontWeight: 600 }}>
                        {result.ppt_design.deck_theme.font_family}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px",
                  background: "var(--border)",
                }}
              >
                {result.slides?.map((slide) => {
                  const design = result.ppt_design?.slide_designs?.find(
                    (d) => d.slide_number === slide.slide_number
                  );
                  return (
                    <SlidePanel 
                      key={slide.slide_number} 
                      slide={slide} 
                      design={design} 
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* PITCHES */}
          {tab === "pitches" && (
            <div className="anim-fade-up">
              <SectionHead
                label="[ PITCH SCRIPTS ]"
                title={
                  <>
                    Three Formats to{" "}
                    <span style={{ color: "var(--lime)" }}>Win</span>
                  </>
                }
              />
              {result.pitch_30s && (
                <PitchBlock
                  label="30-Second Elevator Pitch"
                  duration="~30 seconds · Perfect for introductions"
                  text={result.pitch_30s}
                  accentTop
                />
              )}
              {result.pitch_2min && (
                <PitchBlock
                  label="2-Minute Hackathon Pitch"
                  duration="~2 minutes · Demo day standard"
                  text={result.pitch_2min}
                />
              )}
              {result.pitch_5min && (
                <PitchBlock
                  label="5-Minute Investor Pitch"
                  duration="~5 minutes · Full story & market"
                  text={result.pitch_5min}
                />
              )}
            </div>
          )}

          {/* REPORT */}
          {tab === "report" && (
            <div className="anim-fade-up">
              <SectionHead
                label="[ FINAL REPORT ]"
                title={
                  <>
                    Complete{" "}
                    <span style={{ color: "var(--blue-light)" }}>
                      Strategy Document
                    </span>
                  </>
                }
              />
              <MarkdownViewer
                text={result.final_report || ""}
                filename="final_report.md"
              />
            </div>
          )}

          {/* DOCS */}
          {tab === "docs" && (
            <div className="anim-fade-up">
              <SectionHead
                label="[ DOWNLOADABLE DOCS ]"
                title={
                  <>
                    Battle-Ready{" "}
                    <span style={{ color: "var(--lime)" }}>Documents</span>
                  </>
                }
              />
              <DocsTab result={result} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
