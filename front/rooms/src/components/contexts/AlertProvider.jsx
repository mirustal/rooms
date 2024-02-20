import { createContext, useState } from "react";
import { Alert } from "@vkontakte/vkui";
import { Locales } from "../../locales/locales";

export const AlertContext = createContext();
export const AlertManagerContext = createContext();

export default function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);

  const alertManager = {
    showAlert: (alertToShow) => setAlert(alertToShow),
    closeAlert: () => setAlert(null),
  };

  return (
    <AlertContext.Provider value={alert}>
      <AlertManagerContext.Provider value={alertManager}>
        {children}
      </AlertManagerContext.Provider>
    </AlertContext.Provider>
  );
}

export function ErrorAlert({ message, alertManager }) {
  return (
    <Alert
    header={Locales.Alerts.ErrorTitle}
      text={message}
      onClose={alertManager.closeAlert}
    />
  );
}

export function AreYouShureAlert({ alertManager, onYes, yesTitle, noTitle, title }) {
  return (
    <Alert
      header={title}
      actions={[
        {
          title: yesTitle,
          mode: "destructive",
          autoClose: true,
          action: () => {onYes()}
        },
        {
          title: noTitle,
          mode: "cancel",
          autoClose: true,
        }
      ]}
      onClose={alertManager.closeAlert}
    />
  );
}

export function TipAlert({ message, alertManager, onClose }) {
  return (
    <Alert
    header={Locales.Alerts.TipTitle}
      text={message}
      onClose={() => {
        alertManager.closeAlert()
        if (onClose) onClose()
      }}
    />
  );
}