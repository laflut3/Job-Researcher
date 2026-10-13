import type { JobListing } from "./index.js";

type Facet = { name: string; terms: string[] };
type Domain = Facet & { subdomains: Facet[] };
const facet = (name: string, aliases: string): Facet => ({ name, terms: aliases.split("|") });
const domain = (name: string, aliases: string, subdomains: Facet[] = []): Domain => ({
  ...facet(name, aliases),
  subdomains,
});

const domains: Domain[] = [
  domain(
    "Technology / Informatique",
    "technology|tech|information technology|informatique|technologies numériques|IT",
    [
      facet(
        "Software Development / Développement logiciel",
        "software development|software developer|software engineer|web developer|full stack|frontend|front end|backend|back end|programming|développement logiciel|développeur|développeuse|programmation",
      ),
      facet(
        "DevOps & Site Reliability",
        "devops|site reliability|SRE|platform engineer|platform engineering|ingénieur plateforme|ingénierie plateforme|ingénieur infrastructure",
      ),
      facet(
        "Cybersecurity / Cybersécurité",
        "cybersecurity|cyber security|cybersécurité|sécurité informatique|information security|infosec|security operations|SOC analyst|sécurité des systèmes",
      ),
      facet(
        "Cloud Computing",
        "cloud computing|cloud engineer|cloud architect|cloud infrastructure|AWS|Azure|GCP|Google Cloud|ingénieur cloud|informatique en nuage",
      ),
      facet(
        "Data & AI / Données et IA",
        "data engineer|data scientist|data analyst|analytics engineer|machine learning|artificial intelligence|AI engineer|science des données|ingénieur données|intelligence artificielle|apprentissage automatique",
      ),
      facet(
        "IT Support & Systems / Support et systèmes",
        "IT support|help desk|helpdesk|systems administrator|system administrator|sysadmin|network engineer|network administrator|support informatique|administrateur systèmes|administrateur réseau",
      ),
      facet(
        "Quality Assurance & Testing / Tests logiciels",
        "QA engineer|quality assurance|test automation|software tester|assurance qualité logicielle|test logiciel|tests logiciels",
      ),
    ],
  ),
  domain(
    "Engineering / Ingénierie",
    "engineering|engineer|ingénierie|ingénieur|ingénieure|aerospace|aéronautique|génie civil|mécanique|électronique",
    [
      facet(
        "Civil Engineering / Génie civil",
        "civil engineering|génie civil|construction engineer",
      ),
      facet(
        "Mechanical Engineering / Génie mécanique",
        "mechanical engineering|mechanical engineer|génie mécanique|ingénieur mécanique",
      ),
      facet(
        "Electrical Engineering / Génie électrique",
        "electrical engineering|electrical engineer|génie électrique|ingénieur électrique",
      ),
      facet(
        "Industrial & Manufacturing / Industrie et production",
        "industrial engineering|manufacturing|production engineer|process engineer|ingénierie industrielle|production industrielle",
      ),
    ],
  ),
  domain(
    "Finance & Accounting / Finance et comptabilité",
    "finance|financial|accounting|accountant|comptabilité|comptable|financier|financière",
    [
      facet("Accounting / Comptabilité", "accounting|accountant|comptabilité|comptable"),
      facet(
        "Financial Analysis / Analyse financière",
        "financial analyst|financial analysis|analyste financier|analyse financière",
      ),
    ],
  ),
  domain(
    "Marketing & Communications / Marketing et communication",
    "marketing|communications|communication|content marketing|marketing digital|communication digitale",
    [
      facet(
        "Digital Marketing / Marketing numérique",
        "digital marketing|SEO|SEM|marketing numérique|marketing digital",
      ),
      facet(
        "Communications / Communication",
        "communications|communication|public relations|relations publiques",
      ),
    ],
  ),
  domain(
    "Sales & Business Development / Vente et développement commercial",
    "sales|business development|account executive|vente|commercial|développement commercial|chargé d'affaires|chargée d'affaires",
    [
      facet("Sales / Vente", "sales|sales representative|vente|commercial|vendeur|vendeuse"),
      facet(
        "Business Development / Développement commercial",
        "business development|business developer|développement commercial",
      ),
    ],
  ),
  domain(
    "Human Resources / Ressources humaines",
    "human resources|human resource|HR|recruiter|recruitment|ressources humaines|recrutement|recruteur|recruteuse",
    [
      facet(
        "Recruitment / Recrutement",
        "recruiter|recruitment|talent acquisition|recrutement|recruteur|recruteuse",
      ),
    ],
  ),
  domain(
    "Product & Design / Produit et design",
    "product management|product manager|product design|UX|UI|design|produit|conception|designer",
    [
      facet(
        "Product Management / Gestion de produit",
        "product manager|product management|chef de produit|gestion de produit",
      ),
      facet(
        "UX & UI Design / Design UX et UI",
        "UX designer|UI designer|UX design|UI design|expérience utilisateur|interface utilisateur",
      ),
    ],
  ),
  domain(
    "Operations & Logistics / Opérations et logistique",
    "operations|logistics|supply chain|opérations|logistique|chaîne logistique|supply-chain",
    [
      facet(
        "Logistics & Supply Chain / Logistique et approvisionnement",
        "logistics|supply chain|logistique|chaîne logistique|approvisionnement",
      ),
    ],
  ),
  domain(
    "Customer Support / Service client",
    "customer support|customer service|client support|service client|assistance clientèle|support client",
    [
      facet(
        "Customer Service / Relation client",
        "customer service|customer success|service client|relation client|succès client",
      ),
    ],
  ),
  domain(
    "Healthcare / Santé",
    "healthcare|health care|medical|health services|santé|médical|médicale|soins",
    [
      facet(
        "Medical & Clinical / Médical et clinique",
        "clinical|clinician|nurse|medical doctor|clinique|infirmier|infirmière|médecin",
      ),
    ],
  ),
  domain(
    "Education & Research / Éducation et recherche",
    "education|teaching|teacher|research|éducation|enseignement|enseignant|enseignante|recherche|chercheur|chercheuse",
    [
      facet(
        "Education / Enseignement",
        "education|teaching|teacher|éducation|enseignement|enseignant|enseignante",
      ),
      facet("Research / Recherche", "research|researcher|recherche|chercheur|chercheuse"),
    ],
  ),
  domain("Legal / Juridique", "legal|lawyer|law firm|juridique|juriste|avocat|avocate|droit", [
    facet(
      "Legal Counsel / Conseil juridique",
      "legal counsel|corporate counsel|conseil juridique|juriste",
    ),
  ]),
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasTerm(text: string, terms: string[]) {
  return terms.some((term) => ` ${text} `.includes(` ${normalize(term)} `));
}

export function classifyJob(job: JobListing) {
  const text = normalize(
    [job.title, job.category ?? "", ...job.subcategories, ...job.tags, job.description].join(" "),
  );
  const matched = domains.map((item) => ({
    domain: item,
    subdomains: item.subdomains.filter((subdomain) => hasTerm(text, subdomain.terms)),
  }));
  const matchedDomains = matched.filter(
    ({ domain: item, subdomains }) =>
      subdomains.length > 0 ||
      hasTerm(
        text,
        item.name === "Engineering / Ingénierie"
          ? item.terms.filter(
              (term) =>
                !["engineering", "engineer", "ingénierie", "ingénieur", "ingénieure"].includes(
                  term,
                ),
            )
          : item.terms,
      ),
  );
  if (
    matchedDomains.length === 0 &&
    hasTerm(text, ["engineering", "engineer", "ingénierie", "ingénieur", "ingénieure"])
  ) {
    const engineering = matched.find(
      ({ domain: item }) => item.name === "Engineering / Ingénierie",
    );
    if (engineering) matchedDomains.push(engineering);
  }

  return {
    domains: matchedDomains.length
      ? matchedDomains.map(({ domain: item }) => item.name)
      : ["Other / Autre"],
    subdomains: [
      ...new Set([
        ...matchedDomains.flatMap(({ subdomains }) => subdomains.map(({ name }) => name)),
        ...job.subcategories.filter((value) => value.trim()),
      ]),
    ],
  };
}

export function resolveDomain(value: string) {
  const normalized = normalize(value);
  return (
    domains.find(
      (item) =>
        normalize(item.name) === normalized ||
        hasTerm(normalized, [...item.terms, ...item.subdomains.flatMap(({ terms }) => terms)]),
    )?.name ?? value.trim()
  );
}

export function resolveSubdomain(value: string) {
  const normalized = normalize(value);
  return (
    domains
      .flatMap(({ subdomains }) => subdomains)
      .find((item) => normalize(item.name) === normalized || hasTerm(normalized, item.terms))
      ?.name ?? value.trim()
  );
}
