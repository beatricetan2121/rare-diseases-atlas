# Rare Disease Atlas — build plan

## Direction
Create a white, publication-like scientific interface inspired by the restraint and credibility of AstraZeneca’s visual identity, without copying its logo or trade dress. The latest request supersedes the uploaded brief’s dark-night-sky palette. Keep the constellation metaphor as a fine, evidence-led network on white rather than a decorative space scene. Use precise typography, generous space, quiet violet/teal accents, amber only for caution, and red only for contradiction. Clearly distinguish verified evidence from illustrative mock claims; do not present placeholder sources or the September 2026 treatment claim as independently confirmed fact.

## Pages and perspectives
- **Home → Who are you? → Search → Atlas:** A clear introduction, role selection, a search with synonyms and type clarification, then an interactive disease network with a selected-disease panel, evidence drawer, and an honest no-results/gap state.
- **Maria, patient-group leader:** Related diseases, shared research assets, partner groups, and an actionable next step in plain language.
- **Devon, newly diagnosed caregiver:** A calmer, simpler view centered on the exact patient community and immediate support; usable on a phone.
- **Priya, therapy scout:** Clusters ranked by mechanism fit, with compatibility, readiness, and contacts.
- **Dr. Osei, researcher:** Mechanism-spanning links, collaborators across gene names, and research infrastructure.
- **Disease detail:** Overview, People, sourced connections, readiness checklist, editable outreach draft, and an explicitly illustrative faster-route comparison.

## Delivery checkpoints
1. **Foundation and discovery:** White scientific design system; shared network background; home, role selection, search, atlas with selected-disease panel, evidence drawer and honest-gap state. Stop for review.
2. **Depth and action:** Disease overview cards, related-disease paths, research assets, next-step checklist, editable outreach, and People tab. Stop for review.
3. **Specialist lenses and polish:** Priya and Dr. Osei network views, faster-route comparison, accessible list view, and phone refinement. Stop for review.

## Technical approach
Use the existing React/TanStack Start app and local JSON mock data only; no backend or external API. Keep data access behind asynchronous functions in `src/lib/atlas.ts` so real sources can be connected later. Carry the chosen perspective in app context and `?as=` links. Render the network with canvas-based drawing and preserve accessible text/list alternatives. Every relationship and substantive claim opens its source details; placeholder and inferred evidence is visibly labeled. Respect reduced-motion settings and include the research-not-medical-advice disclaimer.
