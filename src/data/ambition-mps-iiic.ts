export type Step = { id: string; label: string; months: number; range: string; evidence?: { label: string; href: string } };
export type Assumption = {
  id: string; short: string; status: "verified" | "at-risk" | "needs-validation"; text: string; note?: string;
  sources?: { label: string; href: string }[];
  ifFails?: { replace?: Record<string, { months: number; label: string }>; add?: Step; baselineMultiplier?: number };
};

const PEOPLE = "/disease/mps-iiic";

export const ambition = {
  milestone: "Maria's families are enrolled in an IRB-approved natural history study that uses a biomarker regulators already recognize.",
  baselineSteps: [
    { id: "b1", label: "Find who works on Sanfilippo C and what already exists", months: 8, range: "6–12 months" },
    { id: "b2", label: "First real conversation with a research partner", months: 2, range: "2–3 months" },
    { id: "b3", label: "Write a protocol, get IRB approval, open sites, choose an endpoint from scratch", months: 15, range: "12–18 months" },
  ] as Step[],
  atlasSteps: [
    { id: "a1", label: "Mechanism cluster and existing assets surfaced", months: 0.1, range: "Day 1", evidence: { label: "Cluster: Waste clearance failure", href: "/atlas/mps-iiic" } },
    { id: "a2", label: "Sourced proposal sent to the study sponsor", months: 0.5, range: "~2 weeks", evidence: { label: "Partner: Phoenix Nest (public contact)", href: PEOPLE } },
    { id: "a3", label: "Families enroll in an existing, approved natural history study", months: 1.9, range: "1–2.5 months", evidence: { label: "JLK-447 · NCT05825131", href: "https://clinicaltrials.gov/study/NCT05825131" } },
    { id: "a4", label: "Endpoint starts from the CSF heparan sulfate precedent in types A and B", months: 0, range: "In parallel", evidence: { label: "Regulatory precedent: MPS IIIA and IIIB", href: "#assumption-precedent" } },
  ] as Step[],
  assumptions: [
    { id: "precedent", short: "precedent", status: "verified", text: "A heparan sulfate biomarker precedent exists in Sanfilippo types A and B.", sources: [
      { label: "MPS IIIA: FDA agreement on CSF heparan sulfate (June 2024)", href: "https://www.biospace.com/ultragenyx-announces-plans-to-file-for-accelerated-approval-of-ux111-for-the-treatment-of-sanfilippo-syndrome-type-a-mps-iiia" },
      { label: "MPS IIIB: FDA feedback on CSF HS-NRE (Dec 2025)", href: "https://www.businesswire.com/news/home/20260218269143/en/Spruce-Biosciences-Announces-Positive-Type-B-Meetings-with-U.S.-FDA-for-TA-ERT-for-the-Treatment-of-Sanfilippo-Syndrome-Type-B-MPS-IIIB" },
    ] },
    { id: "study-open", short: "study open", status: "at-risk", text: "JLK-447 is still enrolling and Maria's families meet its eligibility criteria.", note: "Two-year study that began recruiting in Nov 2024.", ifFails: { replace: { a3: { months: 8, label: "Open a new site using JLK-447's protocol" } } } },
    { id: "sponsor", short: "sponsor reply", status: "needs-validation", text: "The study sponsor responds and wants more participants.", ifFails: { replace: { a2: { months: 2.5, label: "Find another route via Cure Sanfilippo Foundation" } } } },
    { id: "biomarker", short: "biomarker transfer", status: "needs-validation", text: "CSF heparan sulfate works as a biomarker in type C, even though HGSNAT is a membrane enzyme.", note: "Needs expert review.", ifFails: { add: { id: "a5", label: "Validate a type C–specific biomarker", months: 6, range: "~6 months" } } },
    { id: "baseline", short: "baseline estimate", status: "needs-validation", text: "Our 'building alone' timeline is realistic.", ifFails: { baselineMultiplier: 0.5 } },
  ] as Assumption[],
  validateNext: [
    { task: "Check NCT05825131's recruitment status and eligibility", owner: "Maria", href: "https://clinicaltrials.gov/study/NCT05825131" },
    { task: "Send the sourced proposal to Phoenix Nest", owner: "Maria", href: PEOPLE },
    { task: "Ask a type C gene therapy researcher whether CSF heparan sulfate applies", owner: "Expert review" },
    { task: "Interview 3 patient-group leaders about how long their study took", owner: "Atlas team" },
    { task: "Run this same journey on 5 other diseases to test coverage", owner: "Atlas team" },
  ] as { task: string; owner: string; href?: string }[],
};
