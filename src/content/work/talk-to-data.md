---
title: Talk to Data
tagline: Fifty analysts were filing tickets to ask questions about their own data.
problem: >-
  Michelin's pricing analysts across the US and Europe knew exactly what they wanted to know. They
  just could not get at it. Every question — why did margin move in this segment, which customers
  drove the volume shift — went into a queue and came back as a spreadsheet days later, by which
  point the question had usually changed. The data was not missing. The path to it ran through
  people.
status: production
period: 2024 — present
order: 1
stack:
  - LangGraph
  - ReAct agents
  - Dremio MCP
  - mem0
  - PostgreSQL
  - MLflow
  - Azure ML
  - Kubernetes
  - React / TypeScript
metrics:
  - label: Analysts
    value: 50+
    basis: US and Europe, daily use
  - label: Accuracy
    value: 95%
    basis: 500-question benchmark
  - label: Cost / query
    value: $0.05–0.20
    basis: tracked per query in MLflow
  - label: Consistency
    value: 85%
    basis: run-to-run, same question
tradeoff: >-
  Read-only enforcement at every layer means the system can never write, and that closes off a
  whole class of things analysts asked for — saved segments, corrected records, write-back to the
  warehouse. We chose to be useless for those rather than risk being dangerous once. An agent with
  database credentials is a liability the moment it is clever enough to be useful.
wouldChange: >-
  The 500-question benchmark was built after the agent already worked, which meant it encoded the
  behaviour we had rather than the behaviour we wanted. Writing it first would have made the
  ambiguous-schema failures visible months earlier instead of surfacing them through analyst
  complaints. Evaluation is cheaper to build before you are attached to an answer.
trace:
  - step: Question arrives
    detail: Natural language, no SQL, no schema knowledge assumed
  - step: Memory recall
    detail: mem0 + PostgreSQL retrieve this analyst's own terminology
  - step: Schema selection
    detail: 3 tables resolved from a 50-table semantic layer
    emphasis: true
  - step: Guardrail
    detail: Read-only enforced — no write or DDL reaches the database
    emphasis: true
  - step: Execution
    detail: SQL runs over Dremio via MCP, state held by checkpointer
  - step: Answer
    detail: Charted result; cost and tool latency logged to MLflow
---

## What it does

Talk to Data is a multi-agent natural-language interface to Michelin's pricing warehouse. An
analyst asks a question in the words they already use; the system resolves it against a 50-table
semantic layer exposed through a Dremio MCP server, runs the query, and returns a charted answer.

I own the agent architecture, the LLMOps stack, the security model and the frontend. The
orchestration is ReAct agents on LangGraph with checkpointer-backed state — built while I was
Assistant Data Scientist, then scaled to both regions after the move to Associate.

## The 5% is where the engineering is

Ninety-five percent accuracy on a 500-question benchmark is the number that gets quoted. The
interesting work was the other five percent, and almost all of it was ambiguity rather than
incompetence — a question that maps equally well to two tables, a term that means one thing to
the US pricing team and something else in Europe.

Two things address it. The system keeps a per-analyst memory in mem0 and PostgreSQL of that
person's own vocabulary, so the same phrase resolves differently for different people, correctly.
And where ambiguity survives that, the agent stops and asks rather than guessing. A human-in-the-
loop gate on schema selection is slower than a confident wrong answer, and considerably better.

## Making it repeatable

An agent that is right most of the time is not yet a system. The LLMOps stack on MLflow carries
automated evaluation pipelines, versioning for both prompts and agent graphs, and per-query cost
and tool-latency tracking.

The piece that moved the number most: failed queries are not just logged, they are recycled.
Failures auto-generate few-shot examples and reflection prompts that feed back into the agent.
Run-to-run consistency on the same question went to 85% — which matters more than raw accuracy
for trust, because an analyst who gets two different answers to one question stops using the tool
regardless of which was right.

## Guardrails

Read-only is enforced at every layer, not asserted once. No write and no DDL statement reaches the
database along any path. The interface ships with RBAC through Auth0 and ForgeRock, streams over
SSE, and runs on Azure ML behind Docker and Kubernetes with CI/CD.

Four certified Power BI dashboards — 24 report pages across two regions — are integrated behind
the same interface, so a question that spans both finally has one comparable view instead of two
that disagree.

## What it replaced

Twenty-seven analyst-hours a week, by the stakeholders' own count, at five to twenty cents a
query. The ticket queue is the thing that actually went away.
