# CV review and application guidance

Prepared 18 October 2026. The rewritten CV retains the Senior Software Engineer title and a two-page format. It is intended for senior engineering positions with team leadership responsibilities, Technical Lead and Engineering Lead roles, and hands-on Engineering Manager openings where the actual requirements fit this experience.

## What changed and why

The previous CV put a long summary and eight groups of technology badges ahead of the work. It repeated Tasdid and Jabi in both employment and selected projects, leaving little room for the leadership demonstrated in the portfolio. Its extracted text joined some skills and contact fields without spaces. The rewrite puts experience immediately after a shorter summary and moves the compact technical skills section to page two. It uses ordinary paragraphs, standard section headings and one reading column, with visible contact information and working portfolio, LinkedIn and GitHub links. Selective bold text highlights team scope and measurable outcomes without changing reading order.

Cardy now explains the decisions behind the rebuild: hiring the team, introducing the business-model change before the new interface, comparing old and new API behaviour, reconciling data before cutover, and documenting rollback. These are stronger evidence of leadership than describing someone as strategic or results-driven. The work shows responsibility for technical quality, product sequencing and the team's ability to maintain what it ships.

The refinement also restores the existing Engineering Manager CV's specific evidence of ownership of hiring, offers and the technical-team budget, and its production recovery with zero records lost. The Qi section adds Basmayah's three-day implementation, carefully limiting the speed claim to the applicant and guarantor interfaces built from the design team's specifications. These examples strengthen management scope, operational responsibility and delivery evidence without inventing a new metric or claiming formal performance-management practices.

Qi now distinguishes the mini-apps and features Aws implemented from the broader systems delivered by Qi and its partners. The CV describes requirements, integration, payment states, partner onboarding and collaboration with other teams. It retains the existing CV's Senior title and March 2026 promotion. It does not claim sole authorship of the national Tasdid platform or responsibility for its entire backend.

The second page keeps consulting, Sifrtas and HAWSR, adds concise UNOPS leadership evidence, and replaces repeated Qi project descriptions with NotifyX, Asheerty and Sadeek. Maaahr remains in education. The technology list is shorter, with technical depth demonstrated in the experience bullets themselves.

## Evidence and factual decisions

- Main sources: the existing Senior Software Engineer and Engineering Manager PDFs; `site/src/data/projects.generated.json`; `site/src/data/about.ts`; `site/src/data/profile.ts`; `site/src/data/before-code.json`; and `site/src/data/achievements.ts`.
- Cardy's 200 venues, 2,000 subscribers and 20,000 downloads follow the current project story. These are service totals, not a claim that Aws alone caused that growth. Team scope is 5+ people across engineering, design and QA, not 5+ software engineers.
- Cardy's current stack is Bun, TypeScript and PostgreSQL; PHP/Laravel and MySQL are described as the inherited system. Migration checks, release practices, test scenarios and the dashboard rewrite come from the detailed Cardy story.
- The existing CVs supply the 30 releases in six months, ownership of hiring/offers/team budget, replica-based incident recovery with zero records lost, consulting clients, Sifrtas dates and cost reduction, Qi promotion and NotifyX benchmark. The benchmark is explicitly a load-test result per worker, not a production service-level commitment. Basmayah's three-day delivery is supported by its detailed project story, which identifies 9–11 September 2026 and distinguishes implementation from the UI/UX team's design contribution.
- HAWSR uses 2021–2024 from the detailed project story, confirmed by the user. Older CV dates and the About page still differ; this rewrite does not edit portfolio copy. NotifyX uses the portfolio's 2024 start rather than the previous CV's 2025 start.
- The Ljubljana entry explicitly says that the degree was not conferred. The degree title appears only as the exchange programme, not as an awarded MSc. Turing College is listed as a certificate in 2026 without the older start month, which conflicts with Maaahr's published project timeline.
- English is described as professional working proficiency. The previous IELTS range is omitted because it is not a single documented examination result. Visa status is unstated, as requested. Location and openness to relocation remain visible.
- The old uptime figure, broad payment-volume claims and provider superlative are omitted. They are either historical snapshots without dates suitable for reuse, unclear in attribution, or less informative than the current engineering evidence.
- The retained facts are supported by the user's materials. Employment, financial figures and benchmarks have not been independently audited.

## ATS preparation

The PDF contains selectable text in a single column. The Word document uses body paragraphs for the name, contact details, experience and skills; it has no layout tables, text boxes, photographs, logos, skill meters or hidden keyword text. Full job titles and consistent date lines make roles easier to identify. Keywords appear in the skills section and in examples of their actual use.

Greenhouse specifically identifies columns, complex tables, headers, footers, text boxes and incomplete job titles as possible parsing problems. The rewrite avoids those structures. Reference: [Greenhouse resume parsing guidance](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse).

Local checks cover reading order, text completeness, contact information, links, page count and visible layout. They do not constitute a test inside an employer's ATS. No CV can guarantee a ranking, interview or offer: employers use different requirements and screening rules.

## Using the CV for EU applications

Treat this as the base CV. Before each application, read the actual vacancy and adjust the summary and ordering of relevant bullets to match its responsibilities. Keep historical job titles unchanged. Use the employer's terminology where it accurately describes the work, and follow its requested file format. Europass similarly advises tailoring the profile, relevant experience and examples to the vacancy: [Europass CV guidance](https://europass.europa.eu/en/create-europass-cv).

For payments or fintech roles, prioritise payment confirmation, duplicate-request handling, reconciliation, merchant workflows and cross-team delivery. For full stack or platform leadership, prioritise Cardy's migration, review process and operational ownership, then NotifyX. For AI product roles, move Sadeek and Asheerty higher and expand Maaahr only with material from its project story. Do not add Java, Kubernetes, AWS cloud infrastructure, line-management practices or other vacancy keywords without corresponding experience.

The leadership emphasis was checked against first-party descriptions of EU engineering roles, including [Wise's Engineering Lead role in Tallinn](https://wise.jobs/job/engineering-lead-product-eligibility-relocation-support-in-tallinn-jid-1028), which discusses team ownership, architecture, performance, reliability and engineering quality. This is a positioning reference, not a claim that the role is still open or that the candidate meets every requirement.

For management applications, make the actual remit clear in interviews: who reported directly, which hiring decisions Aws owned, and how feedback, prioritisation and performance discussions worked. The CV uses documented hiring, mentoring and delivery evidence; it does not invent formal performance-management or manager-of-managers experience.

Choose openings whose essential language, location, work-permission and technical requirements fit. Answer application questions about relocation and sponsorship directly. After upload, review any autofilled title, employer, dates and contact fields, because a readable file can still be interpreted differently by individual systems.

## Editable source and distribution

Edit `cv/Aws_Abdulfattah__Senior_Software_Engineer.md` and rebuild the Word document with `scripts/build-cv.py` using the bundled document runtime. Render the Word document with the documents skill's `render_docx.py --emit_pdf` and inspect both pages before copying the PDF to the canonical CV and the website asset.

The website's existing viewer reads `site/public/cv/Aws_Abdulfattah_CV.pdf`. The legacy Senior Software Engineer URL reads `cv/Aws_Abdulfattah__Senior_Software_Engineer.pdf`. Both receive identical reviewed PDFs. Other role-specific PDFs are unchanged. Updating these local files does not publish the website.
