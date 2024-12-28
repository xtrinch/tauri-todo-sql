import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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
      woodPiece: "Wood piece",
      woodPieces: "Wood pieces",
      addNew: "Add new",
      searchNames: "Search names",
      unsavedChanges: "Unsaved changes",
      seqNo: "Seq. no",
      treeSpecies: "Tree species",
      widthCm: "Width (cm)",
      lengthM: "Length (m)",
      volumeM3: "Volume (m3)",
      plateNo: "Plate no.",
      maxPriceM3: "Max price / m3 (EUR)",
      maxPrice: "Max price",
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
      woodPiece: "Hlod",
      woodPieces: "Hlodi",
      addNew: "Dodaj",
      searchNames: "Isci po imenu",
      unsavedChanges: "Neshranjene spremembe",
      seqNo: "Zap. st.",
      treeSpecies: "Drevesna vrsta",
      widthCm: "Sirina (cm)",
      lengthM: "Dolzina (m)",
      volumeM3: "Kubatura (m3)",
      plateNo: "St. ploscice",
      maxPriceM3: "Max. cena / m3 (EUR)",
      maxPrice: "Max. cena",
      totalPriceM3: "Skupna cena (EUR)",
      soldWoodPieces: "Prodani hlodi",
      boughtWoodPieces: "Kupljeni hlodi",
      woodPieceOffers: "Ponudbe za hlode",
      offeredPrice: "Ponujena cena",
      offeredPriceM3: "Ponujena cena / m3 (EUR)",
      inventory: "Inventar",
      save: "Shrani",
      resetToSaved: "Ponastavi na shranjeno",
      saveAs: "Shrani kot",
      open: "Odpri",
      undo: "Nazaj",
      addressLine1: "Naslov vrstica 1",
      addressLine2: "Naslov vrstica 2",
      isDefined: "Je podana",
      isNotDefined: "Ni podana",
      filters: "Filtriraj",
      sortId: "Datum dodaje",
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
