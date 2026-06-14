"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { continueWorkflow, selectIdea } from "../../lib/api";
import { CompletedStep, RankedIdea, StepMeta } from "../../types/project";

// ─── Step definitions ─────────────────────────────────────────────────────────
const ALL_STEPS: StepMeta[] = [
  {
    key: "problem_analyst",
    label: "Problem Analyst",
    description: "Challenge analysis",
    output_key: "problem_analysis",
    is_select_step: false,
    symbol: "01",
  },
  {
    key: "opportunity_planner",
    label: "Opportunity Planner",
    description: "Market gaps & opportunities",
    output_key: "opportunity_analysis",
    is_select_step: false,
    symbol: "02",
  },
  {
    key: "idea_generator",
    label: "Idea Generator",
    description: "10 competitive ideas",
    output_key: "ideas",
    is_select_step: false,
    symbol: "03",
  },
  {
    key: "idea_validator",
    label: "Idea Validator",
    description: "Scoring & ranking",
    output_key: "ranked_ideas",
    is_select_step: false,
    symbol: "04",
  },
  {
    key: "select_idea",
    label: "Idea Selection",
    description: "Choose your winner",
    output_key: "selected_idea",
    is_select_step: true,
    symbol: "05",
  },
  {
    key: "solution_architect",
    label: "Solution Architect",
    description: "Technical blueprint",
    output_key: "solution_blueprint",
    is_select_step: false,
    symbol: "06",
  },
  {
    key: "presentation_agent",
    label: "Presentation Agent",
    description: "10-slide pitch deck",
    output_key: "slides",
    is_select_step: false,
    symbol: "07",
  },
  {
    key: "ppt_designer",
    label: "PPT Designer",
    description: "Investor deck theme & layouts",
    output_key: "ppt_design",
    is_select_step: false,
    symbol: "08",
  },
  {
    key: "pitch_agent",
    label: "Pitch Agent",
    description: "Pitch scripts",
    output_key: "pitch_30s",
    is_select_step: false,
    symbol: "08",
  },
  {
    key: "report_generator",
    label: "Report Generator",
    description: "Final report",
    output_key: "final_report",
    is_select_step: false,
    symbol: "09",
  },
];

// ─── Micro-components ─────────────────────────────────────────────────────────

function Label({
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

function BulletList({
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
        gap: "4px",
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
          <span
            style={{ color: "var(--text-3)", flexShrink: 0, marginTop: "1px" }}
          >
            —
          </span>
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
      <div className="score-track">
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
          minWidth: "20px",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function DataPanel({
  label,
  accent = false,
  children,
}: {
  label: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        padding: "18px",
        borderLeft: accent
          ? "2px solid var(--blue)"
          : "1px solid var(--border)",
      }}
    >
      <Label color={accent ? "var(--blue-light)" : "var(--text-3)"}>
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Step output renderers ────────────────────────────────────────────────────

function ProblemAnalysisOutput({ data }: { data: Record<string, unknown> }) {
  const pa = (data.problem_analysis ?? data) as Record<string, unknown>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {typeof pa.problem_statement === "string" && (
        <div
          style={{
            background: "var(--surface-0)",
            padding: "20px 24px",
            borderLeft: "2px solid var(--blue)",
          }}
        >
          <Label color="var(--blue-light)">Problem Statement</Label>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-1)",
              lineHeight: 1.75,
            }}
          >
            {pa.problem_statement}
          </p>
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: "1px",
          background: "var(--border)",
        }}
      >
        {Array.isArray(pa.pain_points) && pa.pain_points.length > 0 && (
          <DataPanel label="Pain Points" accent>
            <BulletList
              items={pa.pain_points as string[]}
              color="var(--text-2)"
            />
          </DataPanel>
        )}
        {Array.isArray(pa.stakeholders) && pa.stakeholders.length > 0 && (
          <DataPanel label="Stakeholders">
            <BulletList items={pa.stakeholders as string[]} />
          </DataPanel>
        )}
        {Array.isArray(pa.success_metrics) && pa.success_metrics.length > 0 && (
          <DataPanel label="Success Metrics" accent>
            <BulletList
              items={pa.success_metrics as string[]}
              color="var(--sky)"
            />
          </DataPanel>
        )}
      </div>
    </div>
  );
}

function OpportunityOutput({ data }: { data: Record<string, unknown> }) {
  const oa = (data.opportunity_analysis ?? data) as Record<string, unknown>;

  const sections = [
    { label: "Market Gaps", items: oa.market_gaps, color: "var(--lime)", accent: true },
    { label: "Underserved Users", items: oa.underserved_users },
    { label: "High Impact Opportunities", items: oa.high_impact_opportunities, color: "var(--sky)", accent: true },
    { label: "Technical Opportunities", items: oa.technical_opportunities },
    { label: "Innovation Opportunities", items: oa.innovation_opportunities },
    { label: "AI Opportunities", items: oa.ai_opportunities, color: "var(--blue-light)", accent: true },
    { label: "Unique Hackathon Angles", items: oa.unique_hackathon_angles },
    { label: "Monetization Opportunities", items: oa.monetization_opportunities }
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1px",
        background: "var(--border)",
      }}
    >
      {sections.map(
        (sec, i) =>
          Array.isArray(sec.items) &&
          sec.items.length > 0 && (
            <DataPanel key={i} label={sec.label} accent={sec.accent}>
              <BulletList items={sec.items as string[]} color={sec.color} />
            </DataPanel>
          )
      )}
    </div>
  );
}

function IdeasOutput({ data }: { data: Record<string, unknown> }) {
  const ideas = (Array.isArray(data.ideas) ? data.ideas : []) as Record<
    string,
    unknown
  >[];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
        gap: "1px",
        background: "var(--border)",
      }}
    >
      {ideas.map((idea, i) => (
        <div
          key={i}
          style={{
            background: i === 0 ? "rgba(61,124,246,0.06)" : "var(--surface-1)",
            padding: "18px 20px",
            borderLeft:
              i === 0 ? "2px solid var(--blue)" : "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: i === 0 ? "var(--blue-light)" : "var(--text-3)",
                letterSpacing: "0.05em",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontSize: "9px",
                padding: "2px 8px",
                border: "1px solid var(--border-mid)",
                color: "var(--text-3)",
                borderRadius: "2px",
              }}
            >
              {typeof idea.feasibility_score === "number"
                ? `${idea.feasibility_score}/10`
                : ""}
            </span>
          </div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-1)",
              marginBottom: "6px",
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            {idea.title as string}
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-2)",
              lineHeight: 1.6,
            }}
          >
            {((idea.description as string) || "").slice(0, 120)}…
          </p>
        </div>
      ))}
    </div>
  );
}

function RankedIdeasOutput({ data }: { data: Record<string, unknown> }) {
  const ideas = (
    Array.isArray(data.ranked_ideas) ? data.ranked_ideas : []
  ) as RankedIdea[];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        background: "var(--border)",
      }}
    >
      {ideas.map((idea, i) => (
        <div
          key={i}
          style={{
            background: i === 0 ? "rgba(61,124,246,0.06)" : "var(--surface-1)",
            padding: "14px 20px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
            borderLeft:
              i === 0 ? "2px solid var(--blue)" : "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: i === 0 ? "var(--blue-light)" : "var(--text-3)",
              minWidth: "20px",
            }}
          >
            {String(i + 1).padStart(2, "0")}
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
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                ["Feat", idea.feasibility_score],
                ["Innov", idea.innovation_score],
                ["Fit", idea.hackathon_fit_score],
              ].map(([l, v]) => (
                <span
                  key={l as string}
                  style={{
                    fontSize: "10px",
                    color: "var(--text-3)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {l}: {v}
                </span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right", minWidth: "40px" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "20px",
                color: i === 0 ? "var(--blue-light)" : "var(--text-2)",
                letterSpacing: "-0.02em",
              }}
            >
              {idea.final_score ?? "—"}
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-3)" }}>/10</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BlueprintOutput({ data }: { data: Record<string, unknown> }) {
  const bp = (data.solution_blueprint ?? data) as Record<string, unknown>;
  const pv = bp.product_vision as Record<string, unknown> | undefined;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {pv && (
        <div
          style={{
            background: "rgba(61,124,246,0.06)",
            padding: "24px 28px",
            borderLeft: "2px solid var(--blue)",
          }}
        >
          <Label color="var(--blue-light)">Product Vision</Label>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "var(--text-1)",
              marginBottom: "8px",
              letterSpacing: "-0.01em",
            }}
          >
            {pv.product_name as string}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-2)",
              lineHeight: 1.75,
              maxWidth: "600px",
            }}
          >
            {pv.elevator_pitch as string}
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
        {Array.isArray(bp.core_features) && bp.core_features.length > 0 && (
          <DataPanel label="Core Features" accent>
            <BulletList
              items={bp.core_features as string[]}
              color="var(--sky)"
            />
          </DataPanel>
        )}
        {Array.isArray(bp.mvp_scope) && bp.mvp_scope.length > 0 && (
          <DataPanel label="MVP Scope">
            <BulletList items={bp.mvp_scope as string[]} />
          </DataPanel>
        )}
        {Array.isArray(bp.ai_components) && bp.ai_components.length > 0 && (
          <DataPanel label="AI Components" accent>
            <BulletList
              items={bp.ai_components as string[]}
              color="var(--lime)"
            />
          </DataPanel>
        )}
        {Array.isArray(bp.frontend_components) &&
          bp.frontend_components.length > 0 && (
            <DataPanel label="Frontend">
              <BulletList items={bp.frontend_components as string[]} />
            </DataPanel>
          )}
        {Array.isArray(bp.target_users) && bp.target_users.length > 0 && (
          <DataPanel label="Target Users">
            <BulletList items={bp.target_users as string[]} />
          </DataPanel>
        )}
        {Array.isArray(bp.integrations) && bp.integrations.length > 0 && (
          <DataPanel label="Integrations">
            <BulletList items={bp.integrations as string[]} />
          </DataPanel>
        )}
      </div>
      {typeof bp.architecture_overview === "string" && (
        <div
          style={{
            background: "var(--surface-1)",
            padding: "20px 28px",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <Label>Architecture Overview</Label>
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
    </div>
  );
}

function SlidesOutput({ data }: { data: Record<string, unknown> }) {
  const slides = (Array.isArray(data.slides) ? data.slides : []) as Record<
    string,
    unknown
  >[];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        background: "var(--border)",
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          style={{
            background: "var(--surface-1)",
            padding: "14px 20px",
            display: "flex",
            gap: "14px",
            alignItems: "center",
            borderLeft: "1px solid var(--border)",
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
            {String(slide.slide_number as number).padStart(2, "0")}
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
              {slide.title as string}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-3)" }}>
              {slide.slide_type as string}
            </p>
          </div>
          <span className="badge" style={{ fontSize: "9px" }}>
            slide
          </span>
        </div>
      ))}
    </div>
  );
}

function PitchOutput({ data }: { data: Record<string, unknown> }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        background: "var(--border)",
      }}
    >
      {[
        {
          key: "pitch_30s",
          label: "30-Second Elevator Pitch",
          dur: "~30 sec",
          accent: true,
        },
        {
          key: "pitch_2min",
          label: "2-Minute Hackathon Pitch",
          dur: "~2 min",
          accent: false,
        },
        {
          key: "pitch_5min",
          label: "5-Minute Investor Pitch",
          dur: "~5 min",
          accent: false,
        },
      ].map(({ key, label, dur, accent }) =>
        data[key] ? (
          <div
            key={key}
            style={{
              background: accent ? "rgba(194,255,77,0.04)" : "var(--surface-1)",
              borderLeft: accent
                ? "2px solid var(--lime)"
                : "1px solid var(--border)",
              padding: "18px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <Label color={accent ? "var(--lime)" : "var(--text-3)"}>
                {label}
              </Label>
              <span className="badge" style={{ fontSize: "9px" }}>
                {dur}
              </span>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-2)",
                lineHeight: 1.8,
                fontFamily: "var(--font-mono)",
              }}
            >
              {(data[key] as string).slice(0, 300)}…
            </p>
          </div>
        ) : null,
      )}
    </div>
  );
}

function ReportOutput({ data }: { data: Record<string, unknown> }) {
  const text = data.final_report as string | undefined;
  if (!text)
    return (
      <div
        style={{
          padding: "40px 24px",
          textAlign: "center",
          color: "var(--text-3)",
          fontSize: "13px",
        }}
      >
        No report generated yet.
      </div>
    );
  return (
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
          final_report.md — {text.split("\n").length} lines
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          style={{
            marginLeft: "12px",
            fontSize: "10px",
            color: "var(--blue-light)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          copy
        </button>
      </div>
      <div style={{ padding: "20px", maxHeight: "480px", overflowY: "auto" }}>
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
  );
}

function GenericOutput({ data }: { data: Record<string, unknown> }) {
  return (
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
          output.json
        </span>
      </div>
      <div style={{ padding: "20px", maxHeight: "400px", overflowY: "auto" }}>
        <pre
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-2)",
            whiteSpace: "pre-wrap",
            lineHeight: 1.8,
            margin: 0,
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ─── Idea selection UI ────────────────────────────────────────────────────────
function IdeaSelector({
  ideas,
  onSelect,
}: {
  ideas: RankedIdea[];
  onSelect: (t: string) => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* CTA banner */}
      <div
        style={{
          background: "rgba(194,255,77,0.06)",
          border: "1px solid rgba(194,255,77,0.2)",
          borderRadius: "4px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "16px" }}>✦</span>
        <div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--lime)",
              marginBottom: "2px",
            }}
          >
            Your Turn — Choose the Winning Idea
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-2)" }}>
            Select the concept the Solution Architect will develop into a full
            blueprint.
          </p>
        </div>
      </div>
      {/* Ideas grid */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1px",
          background: "var(--border)",
        }}
      >
        {ideas.map((idea) => {
          const sel = chosen === idea.title;
          return (
            <div
              key={idea.title}
              onClick={() => setChosen(idea.title)}
              style={{
                background: sel ? "rgba(61,124,246,0.10)" : "var(--surface-1)",
                padding: "16px 20px",
                cursor: "pointer",
                borderLeft: sel
                  ? "2px solid var(--blue)"
                  : "1px solid var(--border)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!sel)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                if (!sel)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "var(--surface-1)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                {/* Radio indicator */}
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: `1.5px solid ${sel ? "var(--blue)" : "var(--border-strong)"}`,
                    flexShrink: 0,
                    marginTop: "3px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: sel ? "var(--blue)" : "transparent",
                  }}
                >
                  {sel && (
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#fff",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--text-1)",
                      marginBottom: "5px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {idea.title}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-2)",
                      lineHeight: 1.6,
                      marginBottom: "10px",
                    }}
                  >
                    {idea.description?.slice(0, 160)}…
                  </p>
                  <div
                    style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
                  >
                    {[
                      [
                        "Feasibility",
                        idea.feasibility_score,
                        "var(--blue-light)",
                      ],
                      ["Innovation", idea.innovation_score, "var(--sky)"],
                      ["Fit", idea.hackathon_fit_score, "var(--lime)"],
                    ].map(([l, v, c]) => (
                      <div
                        key={l as string}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--text-3)",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {l}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: "14px",
                            color: c as string,
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "24px",
                      color: sel ? "var(--blue-light)" : "var(--text-3)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {idea.final_score ?? "—"}
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "var(--text-3)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    SCORE
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Confirm */}
      <button
        className="btn btn-primary"
        disabled={!chosen}
        onClick={() => chosen && onSelect(chosen)}
        style={{ alignSelf: "flex-start", padding: "13px 28px" }}
      >
        Confirm — Build Blueprint for "{chosen?.slice(0, 30)}
        {chosen && chosen.length > 30 ? "…" : ""}"<span>→</span>
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WorkflowPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [steps, setSteps] = useState<CompletedStep[]>([]);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isSelectStep, setIsSelectStep] = useState(false);
  const [done, setDone] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeInfo, setChallengeInfo] = useState<{
    challenge_statement: string;
    hackathon_name: string;
  } | null>(null);
  const [activeStepKey, setActiveStepKey] = useState<string | null>(null);

  // Load from sessionStorage
  useEffect(() => {
    try {
      const sid = sessionStorage.getItem("exhacker_session_id");
      const raw = sessionStorage.getItem("exhacker_workflow_steps");
      const meta = sessionStorage.getItem("exhacker_workflow_meta");
      const cInfo = sessionStorage.getItem("exhacker_challenge_info");
      if (!sid || !raw || !meta) {
        router.push("/generate");
        return;
      }
      const parsedSteps = JSON.parse(raw) as CompletedStep[];
      const parsedMeta = JSON.parse(meta) as {
        currentStep: string | null;
        nextIsSelectStep: boolean;
        done: boolean;
      };
      setSessionId(sid);
      setSteps(parsedSteps);
      setCurrentStep(parsedMeta.currentStep);
      setIsSelectStep(parsedMeta.nextIsSelectStep);
      setDone(parsedMeta.done);
      if (cInfo) setChallengeInfo(JSON.parse(cInfo));
      if (parsedSteps.length > 0)
        setActiveStepKey(parsedSteps[parsedSteps.length - 1].step);
    } catch {
      router.push("/generate");
    }
  }, [router]);

  const persist = useCallback(
    (
      newSteps: CompletedStep[],
      meta: {
        currentStep: string | null;
        nextIsSelectStep: boolean;
        done: boolean;
      },
    ) => {
      sessionStorage.setItem(
        "exhacker_workflow_steps",
        JSON.stringify(newSteps),
      );
      sessionStorage.setItem("exhacker_workflow_meta", JSON.stringify(meta));
    },
    [],
  );

  async function runNextStep() {
    if (!sessionId || !currentStep || isRunning) return;
    setIsRunning(true);
    setError(null);
    try {
      const res = await continueWorkflow(sessionId);
      const newStep: CompletedStep = {
        step: res.completed_step,
        label: res.completed_step_label,
        output: res.output,
      };
      const newSteps = [...steps, newStep];
      const meta = {
        currentStep: res.next_step,
        nextIsSelectStep: res.next_is_select_step,
        done: res.done,
      };
      setSteps(newSteps);
      setCurrentStep(res.next_step);
      setIsSelectStep(res.next_is_select_step);
      setDone(res.done);
      setActiveStepKey(res.completed_step);
      persist(newSteps, meta);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Step failed.");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSelectIdea(title: string) {
    if (!sessionId || isRunning) return;
    setIsRunning(true);
    setError(null);
    try {
      // Find the index of the chosen idea in the ranked list
      const rankedForSelect = steps.find((s) => s.step === "idea_validator")
        ?.output as Record<string, unknown> | undefined;
      const rankedIdeas = (
        Array.isArray(rankedForSelect?.ranked_ideas)
          ? rankedForSelect!.ranked_ideas
          : []
      ) as RankedIdea[];
      const ideaIndex = rankedIdeas.findIndex((i) => i.title === title);
      if (ideaIndex === -1)
        throw new Error("Could not find selected idea in ranked list.");
      const res = await selectIdea(sessionId, ideaIndex);
      const newStep: CompletedStep = {
        step: res.completed_step,
        label: res.completed_step_label,
        output: res.output,
      };
      const newSteps = [...steps, newStep];
      const meta = {
        currentStep: res.next_step,
        nextIsSelectStep: res.next_is_select_step,
        done: res.done,
      };
      setSteps(newSteps);
      setCurrentStep(res.next_step);
      setIsSelectStep(res.next_is_select_step);
      setDone(res.done);
      setActiveStepKey(res.completed_step);
      persist(newSteps, meta);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Selection failed.");
    } finally {
      setIsRunning(false);
    }
  }
  function PPTDesignOutput({ data }: { data: Record<string, unknown> }) {
    const ppt = (data.ppt_design ?? data) as Record<string, unknown>;

    const theme = ppt.deck_theme as Record<string, unknown>;
    const slides = (ppt.slide_designs ?? []) as Record<string, unknown>[];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        <div
          style={{
            background: "rgba(61,124,246,0.06)",
            padding: "24px",
            borderLeft: "2px solid var(--blue)",
          }}
        >
          <Label color="var(--blue-light)">Deck Theme</Label>

          <p
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text-1)",
              marginBottom: "8px",
            }}
          >
            {String(theme?.style ?? "")}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "12px",
            }}
          >
            <div>Primary: {String(theme?.primary_color ?? "")}</div>
            <div>Secondary: {String(theme?.secondary_color ?? "")}</div>
            <div>Background: {String(theme?.background_style ?? "")}</div>
            <div>Font: {String(theme?.font_family ?? "")}</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: "1px",
            background: "var(--border)",
          }}
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--surface-1)",
                padding: "18px",
              }}
            >
              <Label>Slide {String(slide.slide_number)}</Label>

              <p
                style={{
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                {String(slide.layout)}
              </p>

              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-2)",
                  marginBottom: "10px",
                }}
              >
                {String(slide.visual_focus)}
              </p>

              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-3)",
                  lineHeight: 1.6,
                }}
              >
                {String(slide.image_prompt)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render output for a step
  function renderOutput(step: CompletedStep) {
    const d = step.output as Record<string, unknown>;
    switch (step.step) {
      case "problem_analyst":
        return <ProblemAnalysisOutput data={d} />;
      case "opportunity_planner":
        return <OpportunityOutput data={d} />;
      case "idea_generator":
        return <IdeasOutput data={d} />;
      case "idea_validator":
        return <RankedIdeasOutput data={d} />;
      case "solution_architect":
        return <BlueprintOutput data={d} />;
      case "presentation_agent":
        return <SlidesOutput data={d} />;
      case "ppt_designer":
        return <PPTDesignOutput data={d} />;
      case "pitch_agent":
        return <PitchOutput data={d} />;
      case "report_generator":
        return <ReportOutput data={d} />;
      default:
        return <GenericOutput data={d} />;
    }
  }

  const completedKeys = steps.map((s) => s.step);
  const activeStepData = steps.find((s) => s.step === activeStepKey);

  // Idea selection step
  const selectStepDone = steps.find((s) => s.step === "select_idea");
  const rankedForSelect = steps.find((s) => s.step === "idea_validator")
    ?.output as Record<string, unknown> | undefined;
  const ideasForSelect = (
    Array.isArray(rankedForSelect?.ranked_ideas)
      ? rankedForSelect!.ranked_ideas
      : []
  ) as RankedIdea[];

  if (!sessionId)
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
        {/* ══ Page header ══════════════════════════════════════════════════ */}
        <div
          style={{
            background: "rgba(14,14,14,0.85)",
            backdropFilter: "blur(4px)",
            borderBottom: "1px solid var(--border)",
            padding: "24px 0",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span className="sec-num" style={{ marginBottom: "6px" }}>
                [ WORKFLOW ]
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "20px",
                  letterSpacing: "-0.02em",
                  color: "var(--text-1)",
                  marginBottom: "4px",
                }}
              >
                {challengeInfo?.hackathon_name
                  ? `${challengeInfo.hackathon_name}`
                  : "Strategy Pipeline"}
              </h1>
              {challengeInfo?.challenge_statement && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-3)",
                    maxWidth: "560px",
                    lineHeight: 1.5,
                  }}
                >
                  {challengeInfo.challenge_statement.slice(0, 120)}
                  {challengeInfo.challenge_statement.length > 120 ? "…" : ""}
                </p>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span className="badge">
                {completedKeys.length} / {ALL_STEPS.length} complete
              </span>
              {done && (
                <button
                  onClick={() => {
                    sessionStorage.setItem(
                      "exhacker_results_steps",
                      sessionStorage.getItem("exhacker_workflow_steps") || "[]",
                    );
                    sessionStorage.setItem(
                      "exhacker_results_session",
                      sessionId || "",
                    );
                    router.push("/results");
                  }}
                  className="btn btn-lime"
                  style={{ padding: "8px 18px", fontSize: "12px" }}
                >
                  View Full Results →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ══ Main layout ══════════════════════════════════════════════════ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            minHeight: "calc(100vh - 60px - 73px)",
          }}
        >
          {/* Left sidebar — step tracker */}
          <div
            style={{
              background: "rgba(14,14,14,0.85)",
              backdropFilter: "blur(2px)",
              borderRight: "1px solid var(--border)",
              padding: "16px 0",
              position: "sticky",
              top: "133px",
              alignSelf: "start",
              maxHeight: "calc(100vh - 133px)",
              overflowY: "auto",
            }}
          >
            {ALL_STEPS.map((s) => {
              const isDone = completedKeys.includes(s.key);
              const isActive =
                s.key ===
                (activeStepKey ?? completedKeys[completedKeys.length - 1]);
              const isPend = !isDone && s.key !== currentStep;
              return (
                <div
                  key={s.key}
                  className={`step-item ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
                  onClick={() => isDone && setActiveStepKey(s.key)}
                  style={{ cursor: isDone ? "pointer" : "default" }}
                >
                  <div className="step-dot" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      className="step-label"
                      style={{
                        marginBottom: "2px",
                        color: isActive
                          ? "var(--text-1)"
                          : isDone
                            ? "var(--text-2)"
                            : "var(--text-3)",
                      }}
                    >
                      {s.label}
                    </p>
                    {s.is_select_step && !isDone && currentStep === s.key && (
                      <span
                        style={{
                          fontSize: "9px",
                          color: "var(--lime)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        YOUR TURN
                      </span>
                    )}
                    {isDone && !isActive && (
                      <span style={{ fontSize: "9px", color: "var(--text-3)" }}>
                        done
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "var(--lime)",
                        flexShrink: 0,
                        animation: isDone ? "none" : "pulse 1.5s infinite",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right — content area */}
          <div style={{ padding: "32px 0" }}>
            <div
              style={{ maxWidth: "900px", margin: "0 auto", padding: "0 40px" }}
            >
              {/* Error */}
              {error && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "14px 18px",
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "4px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#fca5a5", fontSize: "13px" }}>
                    ⚠ {error}
                  </span>
                  <button
                    onClick={() => setError(null)}
                    style={{
                      marginLeft: "auto",
                      fontSize: "11px",
                      color: "var(--text-3)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    dismiss
                  </button>
                </div>
              )}

              {/* Active step output */}
              {activeStepData && (
                <div style={{ marginBottom: "32px" }} className="anim-fade-up">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "var(--blue-light)",
                      }}
                    >
                      {
                        ALL_STEPS.find((s) => s.key === activeStepData.step)
                          ?.symbol
                      }
                    </span>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "18px",
                        letterSpacing: "-0.02em",
                        color: "var(--text-1)",
                      }}
                    >
                      {activeStepData.label}
                    </h2>
                    <span
                      className="badge badge-blue"
                      style={{ fontSize: "9px" }}
                    >
                      complete
                    </span>
                    {completedKeys.indexOf(activeStepData.step) <
                      completedKeys.length - 1 && (
                      <button
                        onClick={() =>
                          setActiveStepKey(
                            completedKeys[completedKeys.length - 1],
                          )
                        }
                        style={{
                          marginLeft: "auto",
                          fontSize: "11px",
                          color: "var(--text-3)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        ← Latest step
                      </button>
                    )}
                  </div>
                  {renderOutput(activeStepData)}
                </div>
              )}

              {/* Idea selection */}
              {isSelectStep && !selectStepDone && ideasForSelect.length > 0 && (
                <div style={{ marginBottom: "32px" }} className="anim-fade-up">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "var(--lime)",
                      }}
                    >
                      05
                    </span>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "18px",
                        letterSpacing: "-0.02em",
                        color: "var(--text-1)",
                      }}
                    >
                      Idea Selection
                    </h2>
                    <span
                      className="badge badge-lime"
                      style={{ fontSize: "9px" }}
                    >
                      Your Turn
                    </span>
                  </div>
                  <IdeaSelector
                    ideas={ideasForSelect}
                    onSelect={handleSelectIdea}
                  />
                </div>
              )}

              {/* Running state */}
              {isRunning && (
                <div style={{ padding: "40px 24px", textAlign: "center" }}>
                  <div className="spinner" style={{ margin: "0 auto 16px" }} />
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-3)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {ALL_STEPS.find((s) => s.key === currentStep)?.label ??
                      "Running"}{" "}
                    · running…
                  </p>
                </div>
              )}

              {/* Next step CTA */}
              {!isRunning && !done && !isSelectStep && currentStep && (
                <div
                  style={{
                    padding: "24px",
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-3)",
                          marginBottom: "4px",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        Next Step
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "16px",
                          color: "var(--text-1)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {ALL_STEPS.find((s) => s.key === currentStep)?.label}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-2)",
                          marginTop: "4px",
                        }}
                      >
                        {
                          ALL_STEPS.find((s) => s.key === currentStep)
                            ?.description
                        }
                      </p>
                    </div>
                    <button
                      onClick={runNextStep}
                      className="btn btn-primary"
                      style={{ padding: "13px 28px" }}
                    >
                      Run Agent →
                    </button>
                  </div>
                </div>
              )}

              {/* Done state */}
              {done && (
                <div
                  style={{
                    padding: "28px 24px",
                    background: "rgba(61,124,246,0.06)",
                    border: "1px solid var(--blue-mid)",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "18px",
                        color: "var(--text-1)",
                        marginBottom: "4px",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      All Agents Complete 🎯
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
                      Your complete hackathon strategy is ready. View all
                      outputs and download documents.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sessionStorage.setItem(
                        "exhacker_results_steps",
                        sessionStorage.getItem("exhacker_workflow_steps") ||
                          "[]",
                      );
                      sessionStorage.setItem(
                        "exhacker_results_session",
                        sessionId,
                      );
                      router.push("/results");
                    }}
                    className="btn btn-lime"
                    style={{ padding: "13px 28px" }}
                  >
                    View Full Results →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
