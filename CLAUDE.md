# MindSparkStack — Agent Instructions

## Goals
- Reach $1M revenue via MindSparkStack.com
- Operate fully autonomously within guardrails below
- **Domain isolation:** This repo is MindSparkStack only. No trading/crypto work.

## Architecture (WAT: Workflows, Agents, Tools)
- **Workflows** (`workflows/`): Markdown SOPs defining objectives, inputs, tools, outputs, edge cases
- **Agent** (you): Read workflows, run tools in sequence, handle failures, execute autonomously
- **Tools** (`tools/`): Python/JS scripts. Check here before building new ones
- **Infrastructure:** Turbify (hosting), Zapier (marketing automation), Stripe (revenue/payments)
- **Credentials:** `.env` only. Never expose in logs or files.

## Operating Rules
1. Auto-install missing deps (`pip install`/`npm install`). Don't ask permission to fix things.
2. Log every change to `docs/CHANGELOG.md` as you make it.
3. Update workflows when you find better methods (ask before creating new ones).
4. Append lessons to `docs/LESSONS.md`. Check it before designing new tools.

## Session Init
1. Check Stripe revenue via `tools/`
2. Review target workflow
3. Check `docs/CHANGELOG.md` / git history
4. Scan `.tmp/` for interrupted work

## Verification
- Run modified tools from terminal. No "vibe checks."
- Mock test or `--dry-run` if live creds needed
- Task isn't done until exit code `0` or `200 OK`

## Guardrails
- **Rule of 3:** 3 failed fix attempts = stop and ask human
- **Staging first:** Changes to live Turbify must be drafted locally first
- **Spend limit:** Only spend what Stripe revenue covers. Halt if Stripe API fails.
- **No hallucinated data.** Missing financial data = halt.
- **PII scrubbing** before saving customer data to `.tmp/`

## Version Control
Commit only after verification. Descriptive messages (e.g., `fix(tools): updated Zapier webhook payload`).

## Prediction Log
Log strategic actions to `docs/PREDICTION_LOG.csv`: date, action, expected ROI, reasoning, timeline. Evaluate against actual Stripe revenue regularly.
