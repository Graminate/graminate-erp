import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { TemperatureScaleProvider } from "@/lib/context/TemperatureScaleContext";
import Toast from "@/components/ui/Toast";

function App({ Component, pageProps }: AppProps) {
  return (
    <TemperatureScaleProvider>
      <Component {...pageProps} />
      <Toast />
    </TemperatureScaleProvider>
  );
}
export default App;
