# Rare Disease Atlas

An evidence-led rare-disease map prototype. The current review includes the introduction, four perspectives, search, constellation map, evidence inspection, an honest-gap example, and a Type C partner and outreach page. Contact details and research programs are public-source references, not a live directory; the email draft opens in the visitor’s email app and is never sent automatically.

## Run locally

```sh
bun install && bun run dev
```

## Architecture

TanStack Start provides the routes. `src/components/atlas/atlas-shell.tsx` holds the shared background and selected persona. The `?as=maria|devon|priya|osei` query makes perspectives shareable. `src/data/nodes.json` and `src/data/edges.json` contain illustrative records. All screens consume asynchronous functions from `src/lib/atlas.ts`, each with a short mock delay. Replace those function implementations with your backend calls later without changing the route components.

## Data contract and future sources

Nodes encode diseases, clusters and organizations with IDs, names, synonyms, cross-references, activity and attributes. Edges encode relationships with plain explanations, evidence type and level, source information, confidence and contradictions. Real data may later come from OMIM (disease/gene), HPO (phenotypes), ClinVar (variants), PubMed (publications), ClinicalTrials.gov (trials), NIH RePORTER (grants) and NORD/Orphanet (disease/community information). Placeholder IDs (`TBD-*`) are deliberately not real citations.

Future AI extraction from papers, synonym matching, plain-language explanations and outreach drafting would live behind the corresponding `atlas.ts` functions and require human verification before display. No backend or external data APIs are called by this prototype. The Google Fonts stylesheet is the sole external visual resource.
