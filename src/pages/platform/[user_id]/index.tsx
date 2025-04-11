import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import PlatformLayout from "@/layout/PlatformLayout";
import TemperatureCard from "@/components/cards/weather/TemperatureCard";
import Calendar from "@/components/ui/Calendar/Calendar";
import Loader from "@/components/ui/Loader";
import Head from "next/head";
import Swal from "sweetalert2";
import FirstLoginModal from "@/components/modals/FirstLoginModal";
import { API_BASE_URL } from "@/constants/constants";

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
  type?: string;
};

const Dashboard = () => {
  const router = useRouter();
  const userId = router.isReady ? (router.query.user_id as string) : undefined;

  const [userData, setUserData] = useState<User | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(true);
  const [isUserDataLoading, setIsUserDataLoading] = useState<boolean>(true);
  const [isFahrenheit, setIsFahrenheit] = useState<boolean>(true);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!router.isReady || !userId) return;

    let isMounted = true;
    setIsUserDataLoading(true);

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/user/${userId}`,
          {
            withCredentials: true,
            timeout: 10000, // 10 second timeout
          }
        );
        if (isMounted) {
          const fetchedUser = response.data.user as User;
          setUserData(fetchedUser);
          if (!fetchedUser.business_name || !fetchedUser.type) {
            setIsSetupModalOpen(true);
          }
        }
      } catch (error: any) {
        if (!isMounted) return;

        let errorTitle = "Error";
        let errorText = "Failed to fetch user data. Please try again later.";

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            errorTitle = "Access Denied";
            errorText = "Session expired. Please log in again.";
          } else if (error.response?.status === 404) {
            errorTitle = "Not Found";
            errorText = `User not found.`;
          } else if (error.code === "ECONNABORTED") {
            errorText =
              "Request timed out. Please check your connection and try again.";
          }
        } else {
          console.error("Non-Axios error fetching user data:", error);
        }

        await Swal.fire({
          title: errorTitle,
          text: errorText,
          icon: "error",
          confirmButtonText: "OK",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
        router.push("/");
      } finally {
        if (isMounted) {
          setIsUserDataLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [router.isReady, userId, router]);

  useEffect(() => {
    let isMounted = true;
    setIsLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isMounted) {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLocationError(null);
        }
      },
      (error) => {
        if (isMounted) {
          let errorMessage = "Unable to retrieve location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location services in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Request to get user location timed out.";
              break;
            default:
              errorMessage = `An unknown error occurred: ${error.message}`;
              break;
          }
          setLocationError(errorMessage);
          setLocation(null);
        }
      },
      { timeout: 10000 }
    );

    const checkLoading = () => {
      if (isMounted) {
        setIsLocationLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      () => checkLoading(),
      () => checkLoading(),
      { timeout: 10000 }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFirstLogin = async (
    businessName: string,
    businessType: string,
    subType?: string[]
  ) => {
    try {
      await axios.put(
        `${API_BASE_URL}/user/${userId}`,
        { business_name: businessName, type: businessType, sub_type: subType },
        { withCredentials: true }
      );
      await Swal.fire({
        title: "Welcome!",
        text: "Your account is now set up. Let’s get started 🚀",
        icon: "success",
        confirmButtonText: "Ok",
      }).then(() => {
        window.location.reload();
      });
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              business_name: businessName,
              type: businessType,
              sub_type: subType,
            }
          : prev
      );
      setIsSetupModalOpen(false);
    } catch (error: any) {
      console.error("Error updating business info:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to update business info. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const renderWeatherContent = () => {
    if (isLocationLoading) {
      return (
        <div className="h-48 flex items-center justify-center p-4 rounded-lg bg-gray-500 dark:bg-gray-800">
          <Loader />
        </div>
      );
    }

    if (locationError) {
      return (
        <div className="h-48 flex flex-col items-center justify-center text-center p-4 rounded-lg bg-gray-500 dark:bg-gray-900 text-dark dark:text-light">
          <p className="font-semibold mb-1">Weather Unavailable</p>
          <p className="text-sm">{locationError}</p>
        </div>
      );
    }

    if (location) {
      return (
        <TemperatureCard
          lat={location.lat}
          lon={location.lon}
          fahrenheit={!isFahrenheit}
        />
      );
    }

    return (
      <div className="h-48 flex items-center justify-center p-4 rounded-lg bg-gray-500 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        <p>Could not load weather data.</p>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{`Dashboard ${
          userData ? `- ${userData.first_name}` : ""
        } | Graminate Platform`}</title>
      </Head>
      <PlatformLayout>
        <div className="p-4 sm:p-6">
          <header className="mb-4">
            <h1 className="text-lg font-semibold text-dark dark:text-light">
              {isUserDataLoading
                ? "Loading..."
                : `Hello ${userData?.first_name || "User"},`}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome to your dashboard.
            </p>
          </header>

          <hr className="mb-6 border-gray-200 dark:border-gray-700" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {renderWeatherContent()}
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Calendar />
            </div>
          </div>
        </div>
      </PlatformLayout>
      {isSetupModalOpen && userId && (
        <FirstLoginModal
          isOpen={isSetupModalOpen}
          userId={userId}
          onSubmit={handleFirstLogin}
          onClose={() => setIsSetupModalOpen(false)}
        />
      )}
    </>
  );
};

export default Dashboard;
