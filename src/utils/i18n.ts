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
      seller: "Seller",
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
      totalPriceM3: "Total price (EUR)",
      soldWoodPieces: "Sold wood pieces",
      boughtWoodPieces: "Bought wood pieces",
      woodPieceOffers: "Wood piece offers",
      offeredPrice: "Offered price",
    },
  },
  fr: {
    translation: {
      "Welcome to React": "Bienvenue à React et react-i18next",
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
