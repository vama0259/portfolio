---
title: Stratified Anomaly Detection
tagline: Compare every market to every other market and the small ones all look like errors.
problem: >-
  Michelin's pricing data carries genuine structure — a low-volume specialty market and a national
  account behave nothing alike, and neither is wrong. Standard outlier detection over the pooled
  data flags the small populations relentlessly, because unusual-in-general and unusual-for-its-kind
  are different questions. The dashboards downstream were being skewed by transposed quantities and
  zero-value rows that nobody had the time to find by hand.
status: shipped
period: "2024"
order: 3
stack:
  - Isolation Forest
  - Z-screening
  - Rolling price windows
  - Power BI
  - Python
metrics:
  - label: Records screened
    value: 10–15%
    basis: every Michelin sales pipeline
  - label: Hierarchy levels
    value: "3"
    basis: stratification depth
  - label: Stratum floor
    value: 50+
    basis: unique values required per stratum
tradeoff: >-
  A 50-unique-value floor per stratum keeps the statistics honest, but it means the smallest
  populations get folded into a coarser level and judged against a slightly less specific peer
  group. Genuinely anomalous records in thin segments are the ones most likely to slip through.
  Precision in the tail was traded for not flooding analysts with false positives everywhere else.
wouldChange: >-
  The system screens records but does not explain them, so an analyst seeing a flagged row still
  has to reconstruct why. The LLM root-cause layer was built afterwards as a separate project —
  that reasoning belonged in the original design, where the structured signals that triggered the
  flag are still in hand rather than recovered later.
---

## Like-for-like, or nothing

The core decision is that an outlier is only meaningful relative to a comparable population. The
data is partitioned across three hierarchy levels, with a floor of 50 unique values per stratum so
no group is small enough to make its own statistics meaningless. Records are then scored with
Isolation Forest and Z-screening over rolling price windows.

The effect is that a specialty market is judged against specialty markets, and a transposed
quantity in one stands out where previously it was buried under the noise of being small.

## What it catches

Ten to fifteen percent of records, chiefly quantity and price transpositions and zero-value
entries. It runs as the standard cleaning stage in every Michelin sales data pipeline — the
Power BI dashboards and the downstream time-series forecasting both sit on top of it.

Being the default stage in every pipeline is the part I would point to. A model that runs when
someone remembers to run it is a script; one that everything else depends on is infrastructure.

## The follow-on

A later project extended it with LLM-assisted root cause analysis — combining the structured
signals that triggered a flag with reasoning over time windows, feature shifts and historical
baselines to produce an explanation an analyst can read. Quality was checked with consistency
tests, analyst validation and latency measurement.
