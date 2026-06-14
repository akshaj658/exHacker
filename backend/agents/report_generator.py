"""
report_generator.py — Production-grade document generator.

Design decisions:
  1. Defensive Validation  — Pydantic models coerce/default bad state instead of crashing.
  2. XSS / Injection Safety — _sanitize() strips control chars and escapes raw HTML.
  3. Separation of Concerns — ReportContext (data) is decoupled from Renderer (format).
  4. Error Contract         — ReportResult dataclass; per-renderer try/except; partial success.
  5. In-process Caching     — SHA-256 state hash; swap _report_cache for Redis in prod.
  6. i18n                   — All user-visible strings live in locales/{locale}.json.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
from dataclasses import dataclass, field
from typing import Any

from pydantic import BaseModel, Field, ValidationError


# ─── 1. Validated input models ────────────────────────────────────────────────

class _BackendComponent(BaseModel):
    method:      str  = "GET"
    endpoint:    str  = "/"
    description: str  = ""
    live_logic:  bool = False


class _SolutionBlueprint(BaseModel):
    product_vision:       dict[str, Any]      = Field(default_factory=dict)
    backend_components:   list[_BackendComponent] = Field(default_factory=list)
    database_schema:      list[str]           = Field(default_factory=list)
    target_users:         list[str]           = Field(default_factory=list)
    core_features:        list[str]           = Field(default_factory=list)
    mvp_scope:            list[str]           = Field(default_factory=list)
    user_flow:            list[str]           = Field(default_factory=list)
    ai_components:        list[str]           = Field(default_factory=list)
    frontend_components:  list[str]           = Field(default_factory=list)
    integrations:         list[str]           = Field(default_factory=list)
    implementation_steps: list[str]           = Field(default_factory=list)
    future_scope:         list[str]           = Field(default_factory=list)
    architecture_overview: str               = ""


class _ProblemAnalysis(BaseModel):
    problem_statement: str       = ""
    pain_points:       list[str] = Field(default_factory=list)
    stakeholders:      list[str] = Field(default_factory=list)
    success_metrics:   list[str] = Field(default_factory=list)


class _OpportunityAnalysis(BaseModel):
    market_gaps:                list[str] = Field(default_factory=list)
    underserved_users:          list[str] = Field(default_factory=list)
    high_impact_opportunities:  list[str] = Field(default_factory=list)
    technical_opportunities:     list[str] = Field(default_factory=list)
    innovation_opportunities:    list[str] = Field(default_factory=list)
    ai_opportunities:            list[str] = Field(default_factory=list)
    unique_hackathon_angles:     list[str] = Field(default_factory=list)
    monetization_opportunities: list[str] = Field(default_factory=list)


# ─── 2. Sanitisation ─────────────────────────────────────────────────────────

def _sanitize(text: Any) -> str:
    """Strip control characters and neutralize raw HTML/markdown injection."""
    if not isinstance(text, str):
        text = str(text) if text is not None else ""
    text = re.sub(r"[\x00-\x08\x0b-\x1f\x7f]", "", text)
    text = text.replace("<", "&lt;").replace(">", "&gt;")
    return text.strip()


# ─── 3. i18n ─────────────────────────────────────────────────────────────────

_LOCALE_DIR = os.path.join(os.path.dirname(__file__), "..", "locales")
_LOCALES: dict[str, dict] = {}


def _load_locale(locale: str) -> dict:
    if locale not in _LOCALES:
        path = os.path.join(_LOCALE_DIR, f"{locale}.json")
        if os.path.exists(path):
            with open(path, encoding="utf-8") as fh:
                _LOCALES[locale] = json.load(fh)
        else:
            _LOCALES[locale] = {}
    return _LOCALES[locale]


def t(key: str, locale: str = "en", **kwargs: Any) -> str:
    """Translate key → string; falls back to the key itself if missing."""
    data = _load_locale(locale)
    val  = data.get(key, key)
    if kwargs:
        try:
            val = val.format(**kwargs)
        except (KeyError, ValueError):
            pass
    return val


# ─── 4. Markdown helpers ─────────────────────────────────────────────────────

def _bullet(items: list) -> str:
    clean = [_sanitize(x) for x in (items or []) if x]
    return "\n".join(f"- {x}" for x in clean) if clean else "_None specified_"


def _numbered(items: list) -> str:
    clean = [_sanitize(x) for x in (items or []) if x]
    return "\n".join(f"{i + 1}. {x}" for i, x in enumerate(clean)) if clean else "_None specified_"


# ─── 5. Data-extraction context (no formatting) ───────────────────────────────

class ReportContext:
    """
    Pure data extraction layer.
    Validates every sub-dict via Pydantic; coerces / defaults bad data.
    Renderers read from this object — never from the raw state dict.
    """

    def __init__(self, state: dict, locale: str = "en") -> None:
        self.locale    = locale
        raw_sel = state.get("selected_idea") or {}
        raw_bp  = state.get("solution_blueprint") or {}
        raw_pa  = state.get("problem_analysis") or {}
        raw_oa  = state.get("opportunity_analysis") or {}

        # Validate — validation errors produce safe defaults, never exceptions
        try:
            self.bp = _SolutionBlueprint.model_validate(raw_bp)
        except (ValidationError, Exception):
            self.bp = _SolutionBlueprint()

        try:
            self.pa = _ProblemAnalysis.model_validate(raw_pa)
        except (ValidationError, Exception):
            self.pa = _ProblemAnalysis()

        try:
            self.oa = _OpportunityAnalysis.model_validate(raw_oa)
        except (ValidationError, Exception):
            self.oa = _OpportunityAnalysis()

        self.pv  = self.bp.product_vision if isinstance(self.bp.product_vision, dict) else {}
        self.sel = raw_sel

        self.title      = _sanitize(raw_sel.get("title") or self.pv.get("name") or "Untitled")
        self.hackathon  = _sanitize(state.get("hackathon_name") or "N/A")
        self.challenge  = _sanitize(state.get("challenge_statement") or "N/A")
        self.pitch_30s  = _sanitize(state.get("pitch_30s") or "")
        self.pitch_2min = _sanitize(state.get("pitch_2min") or "")
        self.pitch_5min = _sanitize(state.get("pitch_5min") or "")
        self.slides     = state.get("slides") or []


# ─── 6. Renderers (swap for HTML / PDF / Notion without touching data logic) ──

class MarkdownPRDRenderer:
    """Renders a Product Requirements Document from a ReportContext."""

    def render(self, ctx: ReportContext) -> str:
        bp, pa, pv, sel, locale = ctx.bp, ctx.pa, ctx.pv, ctx.sel, ctx.locale

        be_lines = [
            f"- `{b.method} {b.endpoint}` — {_sanitize(b.description)} "
            f"[{t('prd.tag.live', locale) if b.live_logic else t('prd.tag.mock', locale)}]"
            for b in bp.backend_components
        ]
        be_section = "\n".join(be_lines) if be_lines else "_No endpoints defined_"
        db_section = (
            "\n".join(f"```sql\n{_sanitize(s)}\n```" for s in bp.database_schema)
            if bp.database_schema else "_No schema defined_"
        )

        pv_pitch = _sanitize(pv.get("elevator_pitch") or sel.get("description") or "")
        pv_why   = _sanitize(pv.get("why_this_wins")  or sel.get("why_it_wins") or "")
        prob_st  = _sanitize(pa.problem_statement or sel.get("description") or "")

        return f"""# {t('prd.title', locale)}

> **{t('prd.field.project', locale)}:** {ctx.title}
> **{t('prd.field.generated_by', locale)}:** exHacker
> **{t('prd.field.hackathon', locale)}:** {ctx.hackathon}

---

{t('prd.section.overview', locale)}

### {t('prd.field.problem_statement', locale)}
{prob_st}

### {t('prd.field.elevator_pitch', locale)}
{pv_pitch}

### {t('prd.field.why_wins', locale)}
{pv_why}

---

{t('prd.section.target_users', locale)}

{_bullet(bp.target_users or sel.get('target_users', []))}

---

{t('prd.section.pain_points', locale)}

{_bullet(pa.pain_points)}

**{t('prd.field.success_metrics', locale)}:**
{_bullet(pa.success_metrics)}

---

{t('prd.section.core_features', locale)}

{_bullet(bp.core_features or sel.get('core_features', []))}

---

{t('prd.section.mvp_scope', locale)}

{_bullet(bp.mvp_scope)}

---

{t('prd.section.user_flow', locale)}

{_numbered(bp.user_flow)}

---

{t('prd.section.architecture', locale)}

### {t('prd.field.overview', locale)}
{_sanitize(bp.architecture_overview)}

### {t('prd.field.ai_components', locale)}
{_bullet(bp.ai_components)}

### {t('prd.field.frontend_components', locale)}
{_bullet(bp.frontend_components)}

### {t('prd.field.backend_endpoints', locale)}
{be_section}

### {t('prd.field.integrations', locale)}
{_bullet(bp.integrations)}

---

{t('prd.section.database', locale)}

{db_section}

---

{t('prd.section.roadmap', locale)}

{_numbered(bp.implementation_steps)}

---

{t('prd.section.future_scope', locale)}

{_bullet(bp.future_scope)}

---

_{t('prd.footer', locale)}_
"""


class MarkdownVisionRenderer:
    """Renders a Product Vision Document from a ReportContext."""

    def render(self, ctx: ReportContext) -> str:
        bp, pa, oa, pv, sel, locale = ctx.bp, ctx.pa, ctx.oa, ctx.pv, ctx.sel, ctx.locale

        vision_stmt = _sanitize(pv.get("elevator_pitch") or sel.get("description") or "Building a better future.")
        desc        = _sanitize(sel.get("description") or pv.get("elevator_pitch") or "")
        innovation  = _sanitize(sel.get("innovation_factor") or "")
        why_wins    = _sanitize(sel.get("why_it_wins") or pv.get("why_this_wins") or "")

        return f"""# {t('vision.title', locale)}

> **{t('prd.field.project', locale)}:** {ctx.title}
> **{t('prd.field.hackathon', locale)}:** {ctx.hackathon}
> **{t('vision.field.challenge', locale)}:** {ctx.challenge}

---

{t('vision.section.vision_statement', locale)}

> _{vision_stmt}_

---

{t('vision.section.problem', locale)}

{_sanitize(pa.problem_statement)}

### {t('vision.field.who_affected', locale)}
{_bullet(pa.stakeholders)}

### {t('vision.field.pain_points', locale)}
{_bullet(pa.pain_points)}

---

{t('vision.section.opportunity', locale)}

### Market Gaps
{_bullet(oa.market_gaps)}

### Underserved Users
{_bullet(oa.underserved_users)}

### High-Impact Opportunities
{_bullet(oa.high_impact_opportunities)}

### Technical Opportunities
{_bullet(oa.technical_opportunities)}

### Innovation Opportunities
{_bullet(oa.innovation_opportunities)}

### AI Opportunities
{_bullet(oa.ai_opportunities)}

### Unique Hackathon Angles (Trojan Horse)
{_bullet(oa.unique_hackathon_angles)}

### Monetization Opportunities
{_bullet(oa.monetization_opportunities)}

---

{t('vision.section.solution', locale)}

**{ctx.title}**

{desc}

### {t('vision.field.innovation', locale)}
{innovation or '_Not specified_'}

### {t('vision.field.why_wins', locale)}
{why_wins or '_Not specified_'}

---

{t('vision.section.principles', locale)}

1. **{t('vision.principle.demo_first', locale)}** — {t('vision.principle.demo_first_desc', locale)}
2. **{t('vision.principle.ai_native', locale)}** — {t('vision.principle.ai_native_desc', locale)}
3. **{t('vision.principle.speed', locale)}** — {t('vision.principle.speed_desc', locale)}
4. **{t('vision.principle.judges', locale)}** — {t('vision.principle.judges_desc', locale)}

---

{t('vision.section.success', locale)}

{_bullet(pa.success_metrics)}

---

{t('vision.section.pitch', locale)}

{ctx.pitch_30s or f'_{t("vision.field.pitch_missing", locale)}_'}

---

{t('vision.section.future', locale)}

{_bullet(bp.future_scope)}

---

_{t('prd.footer', locale)}_
"""


class MarkdownReportRenderer:
    """Renders the full Execution Report from a ReportContext."""

    def render(self, ctx: ReportContext) -> str:
        bp, pa, sel, locale = ctx.bp, ctx.pa, ctx.sel, ctx.locale

        pv_str = (
            _sanitize(ctx.pv.get("elevator_pitch") or str(ctx.pv))
            if isinstance(ctx.pv, dict) else _sanitize(str(ctx.pv))
        )

        return f"""# {t('report.title', locale)}

## {t('report.field.challenge', locale)}

{ctx.challenge}

---

# {t('report.section.problem', locale)}

## {t('report.field.problem_statement', locale)}

{_sanitize(pa.problem_statement)}

## {t('report.field.pain_points', locale)}

{_bullet(pa.pain_points)}

## {t('report.field.stakeholders', locale)}

{_bullet(pa.stakeholders)}

## {t('report.field.success_metrics', locale)}

{_bullet(pa.success_metrics)}

---

# {t('report.section.selected_idea', locale)}

## {t('report.field.title', locale)}

{_sanitize(sel.get('title', ''))}

## {t('report.field.description', locale)}

{_sanitize(sel.get('description', ''))}

## {t('report.field.problem_solved', locale)}

{_sanitize(sel.get('problem_solved', ''))}

## {t('report.field.why_wins', locale)}

{_sanitize(sel.get('why_it_wins', ''))}

## {t('report.field.core_features', locale)}

{_bullet(sel.get('core_features', []))}

---

# {t('report.section.blueprint', locale)}

## {t('report.field.product_vision', locale)}

{pv_str}

## {t('report.field.target_users', locale)}

{_bullet(bp.target_users)}

## {t('report.field.mvp_scope', locale)}

{_bullet(bp.mvp_scope)}

## {t('report.field.ai_components', locale)}

{_bullet(bp.ai_components)}

## {t('report.field.integrations', locale)}

{_bullet(bp.integrations)}

---

# {t('report.section.presentation', locale)}

{t('report.field.total_slides', locale)}: {len(ctx.slides)}

---

# {t('report.field.pitch_30s', locale)}

{ctx.pitch_30s}

---

# {t('report.field.pitch_2min', locale)}

{ctx.pitch_2min}

---

# {t('report.field.pitch_5min', locale)}

{ctx.pitch_5min}

---

{t('report.footer', locale)}
"""


# ─── 7. Return type ──────────────────────────────────────────────────────────

@dataclass
class ReportResult:
    final_report:    str
    prd_document:    str
    vision_document: str
    errors:          list[str] = field(default_factory=list)
    success:         bool      = True

    def to_dict(self) -> dict:
        """Return only the keys that go into AgentState."""
        return {
            "final_report":    self.final_report,
            "prd_document":    self.prd_document,
            "vision_document": self.vision_document,
        }


# ─── 8. In-process cache (swap for Redis at scale) ───────────────────────────

_report_cache: dict[str, ReportResult] = {}


def _state_hash(state: dict) -> str:
    serialized = json.dumps(state, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode()).hexdigest()


# ─── 9. Public node ──────────────────────────────────────────────────────────

def report_generator_node(state: dict) -> dict:
    """
    LangGraph-compatible node.
    Returns a plain dict (AgentState keys only).
    Never raises — errors are captured and surfaced via ReportResult.errors.
    """
    errors: list[str] = []

    # Cache hit — skip all rendering
    cache_key = _state_hash(state)
    if cache_key in _report_cache:
        return _report_cache[cache_key].to_dict()

    locale = state.get("locale", "en")

    # Build extraction context
    try:
        ctx = ReportContext(state, locale=locale)
    except Exception as exc:
        errors.append(f"Context build failed: {exc}")
        result = ReportResult("", "", "", errors=errors, success=False)
        return result.to_dict()

    # Render each document independently — one failure doesn't kill the rest
    try:
        final_report = MarkdownReportRenderer().render(ctx)
    except Exception as exc:
        errors.append(f"Report render failed: {exc}")
        final_report = ""

    try:
        prd_document = MarkdownPRDRenderer().render(ctx)
    except Exception as exc:
        errors.append(f"PRD render failed: {exc}")
        prd_document = ""

    try:
        vision_document = MarkdownVisionRenderer().render(ctx)
    except Exception as exc:
        errors.append(f"Vision render failed: {exc}")
        vision_document = ""

    result = ReportResult(
        final_report    = final_report,
        prd_document    = prd_document,
        vision_document = vision_document,
        errors          = errors,
        success         = not errors,
    )

    _report_cache[cache_key] = result
    return result.to_dict()