import { useEffect, useState } from "react";
import PlatformLayout from "@/layout/PlatformLayout";
import TemperatureCard from "@/components/cards/weather/TemperatureCard";
import Calendar from "@/components/ui/Calendar/Calendar";
import Loader from "@/components/ui/Loader";
import ProgressCard from "@/components/cards/ProgressCard";
import StatusCard from "@/components/cards/StatusCard";
import Head from "next/head";

type Coordinates = {
  lat: number;
  lon: number;
};

const UserPlatformPage = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationServiceEnabled, setLocationServiceEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [temperatureScale] = useState<string>("Fahrenheit");

  const fahrenheit = temperatureScale === "Fahrenheit";

  const steps = [
    "Procurement",
    "Preparation",
    "Farming",
    "Recurring Cost",
    "Harvest",
  ];

  useEffect(() => {
    const savedStep = localStorage.getItem("currentStep");
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }

    checkLocationService()
      .then((coords) => {
        setLocation(coords);
      })
      .catch((err) => {
        setLocationServiceEnabled(false);
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("currentStep", currentStep.toString());
  }, [currentStep]);

  const checkLocationService = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          reject("Unable to find location. Please enable location services.");
        }
      );
    });
  };

  const handleStepChange = (data: { step: number }) => {
    setCurrentStep(data.step);
  };

  return (
    <>
      <Head>
        <title>Graminate | Platform</title>
      </Head>
      <PlatformLayout>
        <main className="min-h-screen text-white relative">
          <header className="px-6 py-4">
            <h1 className="text-2xl font-bold text-dark dark:text-light">
              Dashboard
            </h1>
          </header>
          <hr className="mb-6 border-gray-300" />

          {isLoading ? (
            <div className="flex justify-center items-center min-h-screen">
              <Loader />
            </div>
          ) : (
            <div className="flex gap-4 px-6 items-start">
              {locationServiceEnabled && location && (
                <div className="flex-shrink-0 w-1/3">
                  <h2 className="text-xl font-semibold text-dark dark:text-light mb-2">
                    Weather
                  </h2>
                  <TemperatureCard
                    lat={location.lat}
                    lon={location.lon}
                    fahrenheit={!fahrenheit}
                  />
                </div>
              )}

              <div className="flex-grow">
                <h2 className="text-xl font-semibold text-dark dark:text-light mb-2">
                  Budget Tracker
                </h2>
                <ProgressCard
                  steps={steps}
                  currentStep={currentStep}
                  onStepChange={handleStepChange}
                />
                <div className="mt-6 grid grid-cols-2 gap-6">
                  {!error && (
                    <div>
                      <StatusCard steps={steps} currentStep={currentStep} />
                    </div>
                  )}
                  <div>
                    <Calendar />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </PlatformLayout>
    </>
  );
};

export default UserPlatformPage;
