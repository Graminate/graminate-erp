import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import NavPanel from "@/components/layout/NavPanel";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";
import TextField from "@/components/ui/TextField";
import DropdownSmall from "@/components/ui/Dropdown/DropdownSmall";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/components/ui/Button";
import { LANGUAGES, TIME_FORMAT } from "@/constants/options";
import Loader from "@/components/ui/Loader";
import axiosInstance from "@/lib/utils/axiosInstance";
import axios from "axios";
import Checkbox from "@/components/ui/Checkbox";

const GeneralPage = () => {
  const router = useRouter();
  const { view, user_id } = router.query;
  const currentView = (view as string) || "profile";
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const [userType, setUserType] = useState<string | null>(null);
  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [isUserTypeLoading, setIsUserTypeLoading] = useState(true);

  const [user, setUser] = useState({
    profilePicture: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    language: "English",
    timeFormat: "24-hour",
  });

  useEffect(() => {
    if (!userId) return;
    setIsUserTypeLoading(true);
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/user/${userId}`);
        const userData = response.data.user ?? response.data.data?.user;

        if (!userData) {
          throw new Error("User data not found in response");
        }

        setUser({
          profilePicture: userData.profile_picture || "",
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          phoneNumber: userData.phone_number || "",
          language: userData.language || "English",
          timeFormat: userData.time_format || "24-hour",
        });

        const type = userData?.type || "Producer";
        const rawSubTypes = userData?.sub_type;

        const parsedSubTypes = Array.isArray(rawSubTypes)
          ? rawSubTypes
          : typeof rawSubTypes === "string"
          ? rawSubTypes.replace(/[{}"]/g, "").split(",").filter(Boolean)
          : [];

        setUserType(type);
        setSubTypes(parsedSubTypes);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (axios.isAxiosError(error)) {
          console.error("Axios error details:", error.response?.data);
        }

        setUserType("Producer");
        setSubTypes([]);
        setUser({
          profilePicture: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          language: "English",
          timeFormat: "24-hour",
        });
      } finally {
        setIsUserTypeLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const navButtons = useMemo(() => {
    const buttons = [{ name: "Profile", view: "profile" }];

    if (userType === "Producer") {
      buttons.push({ name: "Weather", view: "weather" });

      if (subTypes.includes("Poultry")) {
        buttons.push({ name: "Poultry", view: "poultry" });
      }
      if (subTypes.includes("Fishery")) {
        buttons.push({ name: "Fishery", view: "fishery" });
      }
      if (subTypes.includes("Animal Husbandry")) {
        buttons.push({ name: "Animal Husbandry", view: "animal_husbandry" });
      }
    }

    return buttons;
  }, [userType, subTypes]);

  const changeView = (newView: string) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, view: newView },
    });
  };

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [weatherSettings, setWeatherSettings] = useState({
    location: "",
    scale: "Celsius",
    aiSuggestions: false,
  });

  const handleSaveChanges = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSuccessMessage("");

    try {
      await axiosInstance.put(`/user/${userId}`, {
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phoneNumber,
        language: user.language,
        time_format: user.timeFormat,
      });

      setSuccessMessage("Profile updated successfully!");
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred";
      if (axios.isAxiosError(error)) {
        const serverError =
          error.response?.data?.error || error.response?.data?.message;
        errorMessage = serverError || error.message;
        console.error(
          "Error updating profile:",
          errorMessage,
          error.response?.data
        );
      } else if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error updating profile:", errorMessage);
      } else {
        console.error("Error updating profile:", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <PlatformLayout>
        <div className="flex min-h-screen">
          <SettingsBar />

          {/* Main content */}
          <main className="flex-1 px-12">
            <div className="pb-4 font-bold text-lg text-dark dark:text-light">
              General Settings
            </div>

            {/* Navigation panel */}
            {isUserTypeLoading ? (
              <Loader />
            ) : (
              <NavPanel
                buttons={navButtons}
                activeView={currentView}
                onNavigate={(newView: string) => changeView(newView)}
              />
            )}

            <section className="py-6">
              {/* Profile View */}
              {currentView === "profile" && (
                <div>
                  <div className="rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4 dark:text-light">
                      Profile Settings
                    </h2>
                    <p className="text-gray-300 mb-6">
                      This applies across your account.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mb-8 relative">
                    <div className="relative group w-24 h-24">
                      <Image
                        src={
                          user.profilePicture ||
                          `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(
                            user.firstName
                          )}+${encodeURIComponent(user.lastName)}&size=250`
                        }
                        alt="Profile Picture"
                        width={96}
                        height={96}
                        className="rounded-full object-cover border border-gray-300 dark:border-gray-600"
                        unoptimized={!user.profilePicture}
                      />

                      {user.profilePicture && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                          <button
                            onClick={() => {
                              // Call image upload API endpoint
                              // Local state preview being cleared for now
                              setUser((prev) => ({
                                ...prev,
                                profilePicture: "",
                              }));
                              // TODO: Add API call to remove profile picture on server
                            }}
                            className="rounded-full p-2 text-white hover:text-red-400"
                            aria-label="Remove profile picture"
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="size-6"
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* File Upload Section */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-dark dark:text-light mb-1">
                        Upload Profile Picture
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="profile-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              // 2MB limit
                              alert("File size must be less than 2MB");
                              return;
                            }

                            const imageUrl = URL.createObjectURL(file);
                            setUser((prev) => ({
                              ...prev,
                              profilePicture: imageUrl,
                            }));
                          }
                        }}
                      />

                      <label
                        htmlFor="profile-upload"
                        className="cursor-pointer bg-green-200 text-white px-3 py-1 rounded text-sm text-center w-fit hover:bg-green-100"
                      >
                        Choose File
                      </label>
                      <p className="text-xs text-dark dark:text-light mt-1">
                        Max 2MB
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 max-w-lg">
                    <TextField
                      label="First Name"
                      placeholder="Enter your first name"
                      value={user.firstName}
                      onChange={(val) =>
                        setUser((prev) => ({ ...prev, firstName: val }))
                      }
                      width="large"
                      isDisabled={true} // Typically non-editable, adjust if needed
                    />
                    <TextField
                      label="Last Name"
                      placeholder="Enter your last name"
                      value={user.lastName}
                      onChange={(val) =>
                        setUser((prev) => ({ ...prev, lastName: val }))
                      }
                      width="large"
                      isDisabled={true} // Typically non-editable, adjust if needed
                    />

                    <div className="flex gap-4">
                      <DropdownSmall
                        label="Language"
                        items={LANGUAGES}
                        selected={user.language}
                        onSelect={(val) =>
                          setUser((prev) => ({ ...prev, language: val }))
                        }
                      />

                      <DropdownSmall
                        label="Time Format"
                        items={TIME_FORMAT}
                        selected={user.timeFormat}
                        onSelect={(val) =>
                          setUser((prev) => ({ ...prev, timeFormat: val }))
                        }
                      />
                    </div>

                    <TextField
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      value={user.phoneNumber}
                      onChange={(val) =>
                        setUser((prev) => ({ ...prev, phoneNumber: val }))
                      }
                      width="large"
                    />
                  </div>

                  <div className="mt-6">
                    <Button
                      style="primary"
                      text="Save Changes"
                      onClick={handleSaveChanges}
                      isDisabled={isSaving} // Disable button while saving
                    />
                  </div>

                  {/* Success Message */}
                  {successMessage && (
                    <p className="text-green-500 mt-2">{successMessage}</p>
                  )}
                </div>
              )}

              {/* Weather View */}
              {currentView === "weather" && (
                <div>
                  <div className="rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4 dark:text-light">
                      Weather Settings
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Configure your weather preferences.
                    </p>
                  </div>

                  {/* Weather Settings Form */}
                  <div className="flex flex-col gap-4 max-w-lg">
                    <TextField
                      label="Set Location"
                      placeholder="Enter your location"
                      value={weatherSettings.location}
                      onChange={(val) =>
                        setWeatherSettings((prev) => ({
                          ...prev,
                          location: val,
                        }))
                      }
                      width="large"
                    />

                    <DropdownSmall
                      label="Scale"
                      items={["Celsius", "Fahrenheit"]}
                      selected={weatherSettings.scale}
                      onSelect={(val) =>
                        setWeatherSettings((prev) => ({ ...prev, scale: val }))
                      }
                    />

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="ai-suggestions"
                        checked={weatherSettings.aiSuggestions}
                        onChange={() =>
                          setWeatherSettings((prev) => ({
                            ...prev,
                            aiSuggestions: !prev.aiSuggestions,
                          }))
                        }
                        className="w-5 h-5 text-green-600 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2"
                      />
                      <label
                        htmlFor="ai-suggestions"
                        className="text-sm dark:text-light"
                      >
                        Enable AI Suggestions for weather insights
                      </label>
                    </div>
                    {/* Add Save button for Weather Settings */}
                    <div className="mt-6">
                      <Button
                        style="primary"
                        text="Save Weather Settings"
                        // onClick={handleSaveWeatherSettings} // TODO: Create this handler
                        // isLoading={isSavingWeather} // TODO: Add state for this
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Poultry View */}
              {currentView === "poultry" && (
                <div className="rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-6 dark:text-light">
                    Poultry Settings
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Flock Management Section */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <h3 className="font-semibold mb-4 dark:text-light">
                        Flock Management
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Default Flock Type
                          </label>
                          <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option>Broiler</option>
                            <option>Hen Layers</option>
                            <option>Broiler Duck</option>
                            <option>Duck Layers</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Default Flock Size
                          </label>
                          <input
                            type="number"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g. 850"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="auto-flock-id"
                            className="w-4 h-4 text-green-600 focus:ring-green-500 dark:focus:ring-green-600"
                          />
                          <label
                            htmlFor="auto-flock-id"
                            className="text-sm dark:text-gray-300"
                          >
                            Auto-generate Flock IDs
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Health Monitoring Section */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <h3 className="font-semibold mb-4 dark:text-light">
                        Health Monitoring
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Mortality Rate Alert Threshold (%)
                          </label>
                          <input
                            type="number"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g. 5"
                            step="0.1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Default Vaccination Reminder
                          </label>
                          <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option>7 days before due</option>
                            <option>3 days before due</option>
                            <option>1 day before due</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="auto-health-records"
                            className="w-4 h-4 text-green-600 focus:ring-green-500 dark:focus:ring-green-600"
                            checked
                          />
                          <label
                            htmlFor="auto-health-records"
                            className="text-sm dark:text-gray-300"
                          >
                            Automatically record health metrics
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Environmental Controls Section */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <h3 className="font-semibold mb-4 dark:text-light">
                        Environmental Controls
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Ideal Temperature Range (°C)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Min"
                            />
                            <input
                              type="number"
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Max"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Light Hours Schedule
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Hours"
                            />
                            <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                              <option>Fixed Schedule</option>
                              <option>Seasonal Adjustment</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="temp-alerts"
                            className="w-4 h-4 text-green-600 focus:ring-green-500 dark:focus:ring-green-600"
                            checked
                          />
                          <label
                            htmlFor="temp-alerts"
                            className="text-sm dark:text-gray-300"
                          >
                            Enable temperature alerts
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Feed & Production Section */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <h3 className="font-semibold mb-4 dark:text-light">
                        Feed & Production
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Daily Feed Consumption (kg)
                          </label>
                          <input
                            type="number"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g. 150"
                            step="0.1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Low Feed Inventory Alert
                          </label>
                          <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option>3 days supply remaining</option>
                            <option>2 days supply remaining</option>
                            <option>1 day supply remaining</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Expected Egg Production
                          </label>
                          <input
                            type="number"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g. 1000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="mt-6 flex justify-end">
                    <Button
                      style="primary"
                      text="Save Poultry Settings"
                      onClick={() => {
                        // TODO: Implement save functionality
                        console.log("Saving poultry settings");
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Fishery View */}
              {currentView === "fishery" && (
                <div className="rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-light">
                    Fishery Settings
                  </h2>
                  {/* TODO: Add Fishery specific settings form */}
                </div>
              )}

              {/* Animal Husbandry View */}
              {currentView === "animal_husbandry" && (
                <div className="rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-light">
                    Animal Husbandry Settings
                  </h2>
                  {/* TODO: Add Animal Husbandry specific settings form */}
                </div>
              )}
            </section>
          </main>
        </div>
      </PlatformLayout>
    </>
  );
};

export default GeneralPage;
