import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LICITATOR_350_PERCENTAGE, LICITATOR_FIXED_COST } from "./constants";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      title: "Auction",
      sort: "Sort",
      filter: "Filter",
      edit: "Edit",
      list: "List",
      buyer: "Buyer",
      buyers: "Buyers",
      seller: "Seller",
      sellers: "Sellers",
      name: "Name",
      sloName: "Slovenian name",
      englishName: "English name",
      woodPiece: "Wood piece",
      woodPieces: "Wood pieces",
      addNew: "Add new",
      searchNames: "Search names",
      unsavedChanges: "Unsaved changes",
      seqNo: "Seq. no",
      treeSpecies: "Tree species",
      treeSpeciesPlural: "Tree species",
      widthCm: "Width (cm)",
      lengthM: "Length (m)",
      volumeM3: "Volume (m3)",
      plateNo: "Plate no.",
      maxPriceM3: "Max price / m3 (EUR)",
      maxPrice: "Max offered price",
      minPrice: "Min price",
      minPriceM3: "Min price / m3 (EUR)",
      minPriceEUR: "Min price (EUR)",
      totalPriceM3: "Total price (EUR)",
      soldWoodPieces: "Sold wood pieces",
      boughtWoodPieces: "Bought wood pieces",
      woodPieceOffers: "Wood piece offers",
      offeredPrice: "Offered price",
      offeredPriceM3: "Offered price / m3 (EUR)",
      inventory: "Inventory",
      save: "Save",
      resetToSaved: "Reset to saved",
      saveAs: "Save as",
      open: "Open",
      undo: "Undo",
      addressLine1: "Address line 1",
      addressLine2: "Address line 2",
      isDefined: "Is defined",
      isNotDefined: "Is not defined",
      filters: "Filters",
      sortId: "Date added",
      total: "Total",
      noName: "No name",
      latinName: "Latin",
      remove: "Delete",
      iban: "IBAN",
      ident: "Identifier",
      catalogue: "Catalogue",
      catalogueForSellers: "Catalogue for sellers",
      catalogueForBuyers: "Catalogue for buyers",
      sellerIdent: "Seller identifier",
      isFlatRate: "Flat rate",
      isVatLiable: "VAT liable",
      totalGross: "Total gross",
      costsTo350: `Auction costs for wood pieces valued up to 350 EUR / m3 (${LICITATOR_FIXED_COST} EUR / m3)`,
      costsAbove350: `Auction costs for wood pieces valued above 350 EUR / m3 (${LICITATOR_350_PERCENTAGE * 100}% total)`,
      sellerIncome: "Seller income",
      sellerIncomeGross: "Seller gross income",
      flatRate: "Flat rate (8%)",
      vat: "VAT (22%)",
      totalVolume: "Total volume",
      usedTransport: "Used transport",
      transportCosts: "Transport costs",
      transportVAT: "Transport VAT (22%)",
      loggingCosts: "Logging costs",
      loggingCostsVAT: "Logging VAT (9.5%)",
      loggingCostsNonWoodsVAT: "Logging outside woods VAT (22%)",
      payout: "Payout",
      editWoodPieces: "Edit wood pieces",
      saveSuccess: "Saved successfully",
      couldNotDelete: "Could not delete. Delete related data first",
      couldNotUpdate: "Could not update",
      couldNotCreate: "Could not create",
      summary: "Summary",
      select: "Select",
      isLowerThanMin: "Is lower than min",
      usedLogging: "Logging woods",
      bypassMinPrice: "Bypass min price",
      export: "Export",
      exportInvoice: "Export invoice",
      soldPiecesPDFName: "sold-pieces",
      soldPieces: "Sold pieces",
      boughtPiecesPDFName: "bought-pieces",
      boughtPieces: "Bought pieces",
      noData: "No data",
      exportForBuyers: "Export for buyers",
      exportWithPrices: "Export with max. prices",
      cancel: "Cancel",
      ok: "Yes",
      areYouSure: "Are you sure?",
      confirmNeeded: "Confirmation needed",
      options: "Options",
      catalogueTitle: "Wood auction",
      catalogueSubtext: `Gornja Radgona ${new Date().getFullYear()}`,
      statistics: "Statistics",
      numWoodPieces: "Number of wood pieces",
      numUnsoldWoodPieces: "Number of unsold wood pieces",
      offeredMaxPrice: "Max offered price",
      usedLoggingOutsideWoods: "Logging non-woods",
      loggingPrice: "Logging price",
      invoice: "Invoice",
      resetApplicationData: "Reset application data",
      language: "Language",
      totalIncome: "Total income",
      value: "Value",
      unit: "Unit",
      year: `${new Date().getFullYear()}`,
      sellingCatalogue: "Sale catalog",
      topThreeOffersPerVolumePrice: "Top three offers - price per volume",
      topThreeOffersPerTotalPrice: "Top three offers - total price",
      topThreeOffers: "Top three offers",
      totalPrice: "Total price",
      success: "Success",
      generating: "Generating...",
      companyName: "Company name",
      address: "Address",
      stamp: "Stamp",
      signature: "Signature",
      checkForUpdates: "Check for updates",
      noUpdatesFound: "No updates found",
      info: "Info",
      foundUpdate: "Found update",
      shouldRelaunch: "Update and relaunch application?",
      updateInstalled: "Update installed",
      numOffers: "No. offers",
      failedToRelaunch: "Failed to relaunch",
      downloading: "Downloading",
    },
  },
  sl: {
    translation: {
      title: "Licitacija",
      sort: "Uredi",
      filter: "Filtriraj",
      edit: "Urejanje",
      list: "Seznam",
      buyer: "Kupec",
      buyers: "Kupci",
      seller: "Prodajalec",
      sellers: "Prodajalci",
      name: "Ime",
      sloName: "Slovensko ime",
      englishName: "Angleško ime",
      woodPiece: "Hlod",
      woodPieces: "Hlodi",
      addNew: "Dodaj",
      searchNames: "Išči po imenu",
      unsavedChanges: "Neshranjene spremembe",
      seqNo: "Zap. št.",
      treeSpecies: "Drevesna vrsta",
      treeSpeciesPlural: "Drevesne vrste",
      widthCm: "Debelina (cm)",
      lengthM: "Dolžina (m)",
      volumeM3: "Kubatura (m3)",
      plateNo: "Št. ploščice",
      maxPriceM3: "Ponujena cena / m3",
      maxPrice: "Ponujena cena",
      minPrice: "Pričakovana cena",
      minPriceM3: "Pričakovana cena / m3 (EUR)",
      minPriceEUR: "Pričakovana cena (EUR)",
      totalPriceM3: "Skupna cena (EUR)",
      soldWoodPieces: "Prodani hlodi",
      boughtWoodPieces: "Kupljeni hlodi",
      woodPieceOffers: "Ponudbe za hlode",
      offeredPrice: "Ponujena cena",
      offeredPriceM3: "Ponujena cena / m3",
      inventory: "Inventar",
      save: "Shrani",
      resetToSaved: "Zavrži neshranjene spremembe",
      saveAs: "Shrani kot",
      open: "Odpri",
      undo: "Nazaj",
      addressLine1: "Naslov vrstica 1",
      addressLine2: "Naslov vrstica 2",
      isDefined: "Je podana",
      isNotDefined: "Ni podana",
      filters: "Filtriraj",
      sortId: "Datum vnosa",
      total: "Skupaj",
      noName: "Brez imena",
      latinName: "Latinsko",
      remove: "Izbriši",
      iban: "IBAN",
      ident: "Identifikator",
      catalogue: "Katalog",
      catalogueForSellers: "Katalog za prodajalce",
      catalogueForBuyers: "Katalog za kupce",
      sellerIdent: "Identifikator prodajalca",
      isFlatRate: "Pavšalist",
      isVatLiable: "DDV zavezanec",
      totalGross: "Skupaj bruto",
      costsTo350: `Stroški licitacije za vrednost hlodov do 350 EUR / m3 (${LICITATOR_FIXED_COST} EUR / m3)`,
      costsAbove350: `Stroški licitacije za vrednost hlodov nad 350 EUR / m3 (${LICITATOR_350_PERCENTAGE * 100}% vrednosti)`,
      sellerIncome: "Dohodek lastnika hlodov",
      sellerIncomeGross: "Dohodek lastnika hlodov bruto",
      flatRate: "Pavšal (8%)",
      vat: "DDV (22%)",
      totalVolume: "Skupaj kubatura",
      usedTransport: "Uporabljen prevoz",
      transportCosts: "Prevoz cena",
      transportVAT: "DDV za prevoz (22%)",
      payout: "Za izplačilo",
      editWoodPieces: "Uredi hlode",
      saveSuccess: "Uspešno shranjeno",
      couldNotDelete:
        "Napaka pri brisanju. Najprej pobrišite povezane podatke.",
      couldNotUpdate: "Napaka pri shranjevanju lokalnih sprememb",
      couldNotCreate: "Napaka pri ustvarjanju podatkov",
      summary: "Povzetek",
      select: "Izberi",
      isLowerThanMin: "Nižja kot pričakovana",
      loggingCosts: "Posek",
      loggingCostsVAT: "Posek gozdni DDV (9.5%)",
      loggingCostsNonWoodsVAT: "Posek izvengozdni DDV (22%)",
      usedLogging: "Posek gozdni",
      bypassMinPrice: "Dovoli nižjo ceno",
      export: "Izvozi",
      exportInvoice: "Izvozi račun",
      soldPiecesPDFName: "prodani-kosi",
      soldPieces: "Prodani kosi",
      boughtPiecesPDFName: "kupljeni-kosi",
      boughtPieces: "Kupljeni kosi",
      noData: "Ni podatkov",
      exportForBuyers: "Izvozi za kupce",
      exportWithPrices: "Izvozi s ponujenimi cenami",
      cancel: "Zavrni",
      ok: "Sprejmi",
      areYouSure: "Ali ste prepričani?",
      confirmNeeded: "Potrebna potrditev",
      options: "Možnosti",
      catalogueTitle: "Licitacija lesa",
      catalogueSubtext: `Gornja Radgona ${new Date().getFullYear()}`,
      statistics: "Statistika",
      numWoodPieces: "Število hlodov",
      numUnsoldWoodPieces: "Število neprodanih hlodov",
      offeredMaxPrice: "Najvišja ponujena cena",
      usedLoggingOutsideWoods: "Posek izvengozdni",
      loggingPrice: "Posek cena",
      invoice: "Obračun",
      resetApplicationData: "Resetiraj podatke aplikacije",
      language: "Jezik",
      totalIncome: "Skupni prihodki",
      value: "Vrednost",
      unit: "Enota",
      year: `${new Date().getFullYear()}`,
      sellingCatalogue: "Prodajni katalog",
      topThreeOffersPerVolumePrice: "Top 3 ponudbe - cena na volumen",
      topThreeOffersPerTotalPrice: "Top 3 ponudbe - skupna cena",
      topThreeOffers: "Top 3 ponudbe",
      totalPrice: "Skupna cena",
      success: "Uspešno",
      generating: "Generiranje...",
      companyName: "Ime podjetja",
      address: "Naslov",
      stamp: "Žig",
      signature: "Podpis",
      checkForUpdates: "Preveri posodobitve",
      noUpdatesFound: "Ni posodobitev, aplikacija je že najnovejše verzije",
      info: "Informacija",
      foundUpdate: "Najdena posodobitev",
      shouldRelaunch: "Posodobim in na novo zaženem aplikacijo?",
      updateInstalled: "Aplikacija posodobljena",
      numOffers: "Št. ponudb",
      failedToRelaunch: "Ponovni zagon aplikacije ni uspel",
      downloading: "Prenos...",
    },
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
