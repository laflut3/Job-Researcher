import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const locales = ["en-us", "fr-fr"] as const;
export type Locale = (typeof locales)[number];
export type Language = "en" | "fr";

export function languageForLocale(locale: string): Language {
  return locale === "fr-fr" ? "fr" : "en";
}

const resources = {
  en: {
    translation: {
      language: "Language",
      languageEnglish: "English",
      languageFrench: "Français",
      theme: "Theme",
      themeSystem: "System",
      themeLight: "Light",
      themeDark: "Dark",
      heroTitle: "Find your next opportunity",
      worldwide: "worldwide.",
      heroDescription:
        "Search global remote and European listings. Apply directly with the original source.",
      titleSearch: "Job title or keyword",
      titlePlaceholder: "Role, skill or keyword",
      country: "Country",
      anyCountry: "Any country",
      location: "City or location",
      anyLocation: "Any city or location",
      jobType: "Job type",
      anyJobType: "Any job type",
      internships: "Internships",
      apprenticeships: "Apprenticeships",
      fixedTerm: "Fixed-term",
      permanent: "Permanent",
      anyDomain: "Any domain",
      anySubdomain: "Any subdomain",
      domain: "Domain",
      subdomain: "Subdomain",
      chooseDomainFirst: "Choose a domain first",
      company: "Company",
      anyCompany: "Any company",
      searchJobs: "Search jobs",
      companyHint:
        "Companies update from available listings after you choose a country or location.",
      quickFilters: "Quick filters",
      remoteOnly: "Remote only",
      clearFilters: "Clear filters",
      opportunities: "Opportunities",
      resultCount_one: "{{count}} role to explore",
      resultCount_other: "{{count}} roles to explore",
      listingsFrom: "Listings from",
      loadingResults: "Finding your next move…",
      loadErrorTitle: "We couldn’t load the listings",
      loadErrorDescription: "The free job feed may be temporarily unavailable. Please try again.",
      retry: "Try again",
      emptyTitle: "No matching roles in the loaded listings",
      emptyDescription: "Try a broader keyword, clear a filter, or load more listings.",
      loadingPage: "Loading this page…",
      couldNotLoadMore: "Could not load more listings.",
      loadingListings: "Loading listings…",
      loadMore: "Load more listings",
      pages: "Job results pages",
      previous: "Previous",
      next: "Next",
      loading: "Loading…",
      listingsDisclaimer:
        "Listings are provided by third-party sources. Always check the original posting for current details and eligibility.",
      footer: "fleo-jobs · Open-source job discovery",
      dateUnavailable: "Date unavailable",
      today: "Today",
      yesterday: "Yesterday",
      daysAgo_one: "{{count}} day ago",
      daysAgo_other: "{{count}} days ago",
      remote: "Remote",
      viewJob: "View job",
      originalListing: "Open the original listing for more details.",
    },
  },
  fr: {
    translation: {
      language: "Langue",
      languageEnglish: "English",
      languageFrench: "Français",
      theme: "Thème",
      themeSystem: "Système",
      themeLight: "Clair",
      themeDark: "Sombre",
      heroTitle: "Trouvez votre prochain stage",
      worldwide: "dans le monde entier.",
      heroDescription:
        "Explorez des offres internationales, sur site et à distance. Postulez directement auprès de la source.",
      titleSearch: "Intitulé du poste ou mot-clé",
      titlePlaceholder: "Poste, compétence ou mot-clé",
      country: "Pays",
      anyCountry: "Tous les pays",
      location: "Ville ou lieu",
      anyLocation: "Toutes les villes",
      jobType: "Type de contrat",
      anyJobType: "Tous les contrats",
      internships: "Stages",
      apprenticeships: "Alternances",
      fixedTerm: "CDD",
      permanent: "CDI",
      anyDomain: "Tous les domaines",
      anySubdomain: "Tous les sous-domaines",
      domain: "Domaine",
      subdomain: "Sous-domaine",
      chooseDomainFirst: "Choisissez d’abord un domaine",
      company: "Entreprise",
      anyCompany: "Toutes les entreprises",
      searchJobs: "Rechercher",
      companyHint:
        "Les entreprises disponibles s’actualisent après le choix d’un pays ou d’un lieu.",
      quickFilters: "Filtres rapides",
      remoteOnly: "À distance uniquement",
      clearFilters: "Effacer les filtres",
      opportunities: "Offres",
      resultCount_one: "{{count}} offre à découvrir",
      resultCount_other: "{{count}} offres à découvrir",
      listingsFrom: "Offres de",
      loadingResults: "Recherche des offres…",
      loadErrorTitle: "Impossible de charger les offres",
      loadErrorDescription: "Le flux gratuit est peut-être temporairement indisponible. Réessayez.",
      retry: "Réessayer",
      emptyTitle: "Aucune offre correspondante dans les résultats chargés",
      emptyDescription: "Élargissez votre recherche, retirez un filtre ou chargez plus d’offres.",
      loadingPage: "Chargement de cette page…",
      couldNotLoadMore: "Impossible de charger d’autres offres.",
      loadingListings: "Chargement des offres…",
      loadMore: "Charger plus d’offres",
      pages: "Pages des résultats",
      previous: "Précédent",
      next: "Suivant",
      loading: "Chargement…",
      listingsDisclaimer:
        "Les offres viennent de sources tierces. Consultez l’annonce d’origine pour vérifier les détails et les conditions.",
      footer: "fleo-jobs · Recherche d’offres open source",
      dateUnavailable: "Date inconnue",
      today: "Aujourd’hui",
      yesterday: "Hier",
      daysAgo_one: "Il y a {{count}} jour",
      daysAgo_other: "Il y a {{count}} jours",
      remote: "À distance",
      viewJob: "Voir l’offre",
      originalListing: "Consultez l’annonce d’origine pour plus de détails.",
    },
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (language) => {
  document.documentElement.lang = language;
  document.title =
    language === "fr"
      ? "fleo-jobs — Trouvez un stage à l’international"
      : "fleo-jobs — Find opportunities worldwide";
});

export function localizeFacet(value: string, language: Language) {
  const [english, french] = value.split(" / ");
  return language === "fr" ? (french ?? english) : english;
}

export default i18n;
