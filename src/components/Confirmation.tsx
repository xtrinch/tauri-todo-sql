import { confirmable, ConfirmDialog } from "react-confirm";
import { useTranslation } from "react-i18next";

export interface Props {
  okLabel?: string;
  cancelLabel?: string;
  title?: string;
  confirmation?: string;
}

const Confirmation: ConfirmDialog<Props, boolean> = (props) => {
  const { t } = useTranslation();

  return (
    <div
      id="default-modal"
      aria-hidden="true"
      className="bg-gray-400/50 flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[100%] max-h-full"
      onClick={(e) => {
        props.proceed(false);
      }}
    >
      <div
        className="relative p-4 bg-gray-100 rounded-lg"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex space-y-3 flex-col">
          <div>{props.title}</div>
          <div>{props.confirmation}</div>
          <div className="flex flex-row space-x-3">
            <button
              onClick={() => props.proceed(false)}
              className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
            >
              {props.cancelLabel || t("cancel")}
            </button>
            <button
              onClick={() => props.proceed(true)}
              className="button-l bg-red-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
            >
              {props.okLabel || t("ok")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default confirmable(Confirmation);
