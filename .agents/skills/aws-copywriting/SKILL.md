---
name: aws-copywriting
description: "Write and improve copy for Aws Abdulfattah’s MyPortfolio project and associated CV in his personal voice. Create ChatGPT prompts for that work using AIDA, PAS, BAB, FAB, and project storytelling. Use for introductions, project stories, CV summaries, headlines, and contact invitations."
---

# Copywriting in Aws’s Voice

Help Aws improve this personal portfolio and its associated CV for people considering hiring him. Create copywriting prompts for that purpose. Keep this skill scoped to the MyPortfolio project; do not redirect its project stories into product marketing or customer acquisition. Treat the existing portfolio as AI-written except for specific excerpts Aws explicitly identifies as his own. Only those confirmed excerpts may be used to infer his style.

## Voice and context

Read [references/voice.md](references/voice.md) before writing or assembling a prompt. It contains human-written samples, evidence-based observations, and the calibration status. Distinguish observed traits from preferences Aws has explicitly confirmed. The samples are a starting point, not a complete account of his voice.

Use project files for factual context, page purpose, and available actions only. For this portfolio, relevant sources include `site/src/data/about.ts`, `site/src/data/profile.ts`, `site/src/data/projects.ts`, the selected project’s data, and `README.md`. Read only what the task needs. The repository contains different versions of some metrics; do not resolve conflicting numbers by choosing the larger one or assuming one file is authoritative. Ask about material conflicts or omit the disputed figure.

Historical claims in the writing sample are evidence of writing style, not automatically current portfolio facts. Preserve supplied role and ownership distinctions: contributing to a project, leading a team, and building a product alone mean different things.

## Writing and rewriting

- Identify the section, message, and any appropriate next action from the request and relevant context. The confirmed audience is someone considering hiring Aws. English is the working language based on his samples. Follow any explicit language preference. Ask only about gaps that affect the result, without reopening settled preferences.
- Ground the copy in Aws’s own sample and subsequent feedback. Preserve first-person ownership, curiosity, interest in automation, and the connection between experience and contribution when relevant. Do not insert every trait into every paragraph.
- Improve grammar, flow, and specificity without inventing experiences or turning the prose into a different personality. Do not imitate grammatical mistakes. Preserve his positive professional voice, connected explanations, and natural personal humor where relevant. Avoid replacing these with slogans or a deliberately terse style.
- Use periods and commas for sentence punctuation. Do not generate em dashes, en dashes, middle dots, bullet glyphs as text separators, semicolons, decorative ordinal symbols, or theatrical labels such as “Chapter nº1.” Use plain descriptive headings. No smileys or emoji in portfolio or CV copy, even when they occur in conversational samples. Contractions such as “I'm” and “I'll” are explicitly present in his confirmed examples and remain natural. Preserve required spelling and syntax in product names, URLs, measurements, and code; the writing preference does not authorize breaking functional syntax.
- Tone down corporate claims. Preserve his personal reasons for building, his decisions, and his honest reaction to the outcome. A project’s capabilities are supporting evidence of his work; avoid presenting the case study as an advertisement. Keep expressions such as “the best part” or “it just works” when they fit, without forcing them into every draft. His Coldplay line confirms that personal humor is welcome where it belongs. Do not force a joke into every project or CV entry.
- Adapt the amount of detail to the placement. Portfolio stories can carry personal reasoning and enthusiasm; CV copy should retain the same ownership and plain language in a shorter form. A CV entry need not contain a full persuasion arc or a CTA.
- Use the requested framework. When none is requested, choose one only if it helps the section; ordinary clear prose is often best for a short introduction or interface label. Read the relevant entry in [references/prompts.md](references/prompts.md).
- Keep the framework beneath the finished prose. Do not print labels such as “Agitation” in website copy unless the user wants an annotated demonstration.
- Match calls to action to actions that actually exist. For personal portfolio copy, invite an appropriate conversation or a look at the work. Do not assume a sales offer.
- When editing the website, read the affected source and applicable repository instructions, make the scoped copy changes, and preserve functional behavior. A request for a draft or prompt does not by itself require website edits.

Return the requested copy in its usable format. Keep rationale brief and separate. Offer alternatives when they help calibrate voice or the user requests them; do not attach a full analysis to every short rewrite.

## Creating ChatGPT prompts

Use [references/prompts.md](references/prompts.md) to construct a standalone prompt that can be pasted into ChatGPT. Include the pertinent voice guidance inside the prompt; do not rely on ChatGPT having access to these files.

Include the objective, audience, channel, desired next action, chosen framework, length or layout limits, and supplied facts. Include the human-written sample when voice matching is important and Aws has provided it for this use. If context is missing, use clearly named fill-in fields rather than invented facts. For a prompt intended for immediate use, ask only about essential missing inputs or state a reasonable assumption.

Ask for finished copy that sounds natural, follows the supplied facts, and respects the voice. Framework stages guide the argument, not the personality. Instruct ChatGPT to omit unsupported claims and identify essential missing information separately.

## Review and calibration

Before delivery, check whether the copy sounds compatible with the human-written samples, states the correct personal contribution, and gives the reader a clear reason to care. Check generated prose and headings for the prohibited punctuation, decorative labels, and smileys. Remove unsupported comparisons, outcomes, urgency, and inflated claims. General terms Aws used, such as “innovation,” are not banned; prefer a concrete explanation where the facts support one.

Use the approved NotifyX rewrite in `references/voice.md` as the baseline for personal project stories. Its acceptance does not require every project to have the same length, structure, or ending. Do not restart voice calibration for ordinary requests. When Aws corrects a draft or supplies another confirmed sample, record that feedback in `references/voice.md`, keeping the original samples intact. Treat explicit preferences as settled and apply them to subsequent copy.
