import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import PlatformLayout from "@/layout/PlatformLayout";
import TemperatureCard from "@/components/cards/weather/TemperatureCard";
import Calendar from "@/components/ui/Calendar/Calendar";
import Loader from "@/components/ui/Loader";
import ProgressCard from "@/components/cards/ProgressCard";
import StatusCard from "@/components/cards/StatusCard";
import Head from "next/head";
import Swal from "sweetalert2";

type Coordinates = {
  lat: number;
  lon: number;
};

type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  business_name?: string;
  imageUrl?: string | null;
  language?: string;
  time_format?: string;
};

const Dashboard = () => {
  const router = useRouter();
  const userId = router.isReady ? (router.query.user_id as string) : undefined;
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationServiceEnabled, setLocationServiceEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [temperatureScale, setTemperatureScale] =
    useState<string>("Fahrenheit");

  const fahrenheit = temperatureScale === "Fahrenheit";

  const steps = [
    "Procurement",
    "Preparation",
    "Farming",
    "Recurring Cost",
    "Harvest",
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!router.isReady || !userId) return;

      try {
        const response = await axios.get(
          `http://localhost:3001/api/user/${userId}`,
          {
            withCredentials: true,
            timeout: 10000,
          }
        );
        setUserData(response.data.user);
      } catch (error: any) {
        let errorText = "Failed to fetch user data.";

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            errorText = "Session expired. Please log in again.";
          } else if (error.response?.status === 404) {
            errorText = `User not found for ID '${userId}'.`;
          }
        }

        await Swal.fire({
          title: "Access Denied",
          text: errorText,
          icon: "error",
          confirmButtonText: "OK",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
        router.push("/");
      }
    };

    fetchUserData().catch(() => {});
  }, [router.isReady, userId]);

  useEffect(() => {
    if (!router.isReady || !userId) return;

    const savedStep = localStorage.getItem("currentStep");
    if (savedStep) {
      const stepNum = parseInt(savedStep, 10);
      if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= steps.length) {
        setCurrentStep(stepNum);
      } else {
        localStorage.removeItem("currentStep");
      }
    }

    const checkLocationService = (): Promise<Coordinates> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          setLocationServiceEnabled(false);
          reject("Geolocation is not supported by your browser.");
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationServiceEnabled(true);
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (error) => {
            setLocationServiceEnabled(false);
            reject(
              `Unable to retrieve location: ${error.message}. Please enable location services.`
            );
          },
          { timeout: 10000 }
        );
      });
    };

    setIsLoading(true);
    checkLocationService()
      .then((coords) => {
        setLocation(coords);
        setError(null);
      })
      .catch((err) => {
        setLocation(null);
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router.isReady, userId]);

  useEffect(() => {
    if (isAuthorized && currentStep >= 1 && currentStep <= steps.length) {
      localStorage.setItem("currentStep", currentStep.toString());
    }
  }, [currentStep, isAuthorized, steps.length]);

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
              Hello {userData?.first_name},
            </h1>
          </header>
          <hr className="mb-6 border-gray-300" />

          <div className="flex flex-col lg:flex-row gap-6 px-6 items-start">
            <div className="w-full lg:w-1/3 flex-shrink-0">
              {isLoading ? (
                <Loader />
              ) : locationServiceEnabled && location ? (
                <TemperatureCard
                  lat={location.lat}
                  lon={location.lon}
                  fahrenheit={!fahrenheit}
                />
              ) : (
                <div className="p-4 rounded bg-gray-500 dark:bg-gray-700  text-dark dark:text-light">
                  <p className="font-medium">Could not retrieve weather</p>
                </div>
              )}
            </div>

            <div className="flex-grow">
              <h2 className="text-xl font-semibold text-dark dark:text-light mb-2">
                Budget Tracker
              </h2>
              <ProgressCard
                steps={steps}
                currentStep={currentStep}
                onStepChange={handleStepChange}
              />
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <StatusCard steps={steps} currentStep={currentStep} />
                </div>
                <div>
                  <Calendar />
                </div>
              </div>
            </div>
          </div>
        </main>
      </PlatformLayout>
    </>
  );
};

export default Dashboard;
