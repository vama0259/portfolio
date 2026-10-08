---
title: Evidence-first Agent Supervisor
tagline: An agent needs to remember what happened, especially when its tools stop answering.
problem: >-
  Multi-step agent workflows combine research, external actions and human review. A timeout can
  leave a message sent but unconfirmed, while a saved form or a promise can be mistaken for a
  completed outcome. I built a supervisor playbook to keep those states distinct and make the
  next run resume from evidence instead of repeating uncertain actions.
status: shipped
period: October 2026
order: 4
stack:
  - Agent Skills
  - Markdown playbooks
  - Evidence ledgers
  - Capability adapters
metrics:
  - label: Account ownership
    value: Single writer
    basis: Architectural rule in the published skill, not a performance measurement
  - label: Final submission
    value: Human review
    basis: Explicit boundary in the published workflow, not an automated completion claim
tradeoff: >-
  Keeping one supervisor responsible for account operations limits parallelism, but gives
  every external action and shared-state update a clear owner. Instructions also rely on
  the host following them; this package is not an enforcement engine or a hosted service.
wouldChange: >-
  I would add repeatable offline evaluations for individual agent hosts and measure representative
  runs where usage metadata is available. The current release documents scenarios and boundaries;
  it does not claim benchmark gains, token savings or universal integration compatibility.
---

## The project

I built an operational supervisor for coordinating discovery, verification, authorized outreach,
document preparation and review queues. The public release extracts its reusable coordination
pattern into an installable skill. Career operations provide the example domain; this case study
is about the system's architecture and failure handling.

[Source and installation](https://github.com/vama0259/agent-workflow-skills) ·
[Design story](https://github.com/vama0259/agent-workflow-skills/blob/main/docs/design-story.md) ·
[Synthetic demonstrations](https://github.com/vama0259/agent-workflow-skills/blob/main/skills/career-supervisor/references/synthetic-demos.md)

## Evidence before state transitions

The supervisor separates discovery from official verification, a referral promise from a received
referral, and a portal draft from a confirmed submission. An uncertain send stays uncertain until
conversation history resolves it. An empty new queue does not erase historical actions.

One supervisor owns accounts and shared writes. Optional research workers return compact evidence
or prepare materials in isolated directories. On a host without subagents, those roles run
sequentially with the same ownership boundary.

## Designing for interruption

Incremental checkpoints record completed items, partial source coverage, uncertain actions and the
next cursor. After a model limit or tool failure, the next run reconciles evidence before retrying.
Missing inbox access produces a blocked check, not an invented claim that nobody replied.

Connectors, browsers, schedulers and model selection are capability adapters. The instructions
require no particular model or provider. Claude Code, Codex, Cursor and other compatible agents can
load the skill; available account tools and permissions still determine what they can execute.

## Iteration and validation

The underlying guidance evolved to prioritize unfinished preparation, separate referral stages and
maintain evidence-based review queues. The public version removes personal configuration and uses
fictional fixtures. It preserves final employer submission as a human action.

The release includes metadata and packaging checks plus realistic synthetic scenarios. These are
validation artifacts, not a controlled experiment. I am not claiming measured efficiency gains,
conversion improvements or a per-run subscription cost.
