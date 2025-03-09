import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { TemperatureScaleProvider } from "@/lib/context/TemperatureScaleContext";

function App({ Component, pageProps }: AppProps) {
  return (
    <TemperatureScaleProvider>
      <Component {...pageProps} />
    </TemperatureScaleProvider>
  );
}
export default App;
