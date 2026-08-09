---
title: Autonomous Web Agent
tagline: The model could see the page. It could not tell you which box was the submit button.
problem: >-
  Enterprise workflows live inside web applications that have no useful API — Workday being the
  canonical example. An agent that can read a page still has to act on it, and acting means
  identifying the right element among hundreds of visually similar ones. Screenshots gave the model
  plenty of pixels and almost no grounding. It knew what the page was for. It did not know what to
  click.
status: research
period: 2024 — 2025
order: 2
stack:
  - LangChain
  - OpenAI
  - MCP
  - RAG
  - DOM / XPath resolution
metrics:
  - label: Component ID
    value: 30% → 59–68%
    basis: GPT-4-mini, before and after grounding
  - label: Publication
    value: MLDS 2025
    basis: first author, peer-reviewed
tradeoff: >-
  Resolving semantic labels through the DOM to typed XPaths ties the agent to page structure, so it
  is more accurate and more brittle at the same time. A pure-vision approach degrades gracefully
  when a layout shifts; this one can break outright. For enterprise software that ships on a
  quarterly cycle that was the right side of the trade, and it would be the wrong one on the open
  web.
wouldChange: >-
  The evaluation reports component identification, which is the metric the method improves — but it
  is not the metric anyone cares about. What matters is whether the whole workflow completes, and a
  68% identification rate compounds badly across a twelve-step task. I would measure end-to-end
  completion from the start, even though it is a far less flattering number.
---

## The grounding problem

Give a vision model a screenshot of an enterprise application and it will describe the page
accurately. Ask it which element submits the form and it guesses. The information is present —
the model simply has no reliable bridge from what it understands semantically to what it can
address programmatically.

## The method

Rather than treating the page as an image or as raw DOM, the agent works over both. Page blocks
get semantic labels from the model's own reading of the interface; those labels are then resolved
through the DOM tree into typed XPaths — addressable, executable references to real elements.

The model reasons in the vocabulary it is good at ("the approval button in the timesheet panel")
and acts through references that are unambiguous.

On GPT-4-mini this lifted component identification from 30% to between 59 and 68% depending on
page complexity. The work was exposed over MCP for tool calling, with RAG supplying the workflow
context, and became my first-authored paper at MLDS 2025.

## Why it was worth publishing

The result is not that a bigger model would do better — it would. The result is that a small,
cheap model with the right grounding layer closes most of the gap to one several times its size.
For an enterprise deployment measured on cost per action, that is the difference between a
prototype and something you can actually run.
