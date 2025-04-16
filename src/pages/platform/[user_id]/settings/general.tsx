import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavPanel from "@/components/layout/NavPanel";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";
import TextField from "@/components/ui/TextField";
import DropdownSmall from "@/components/ui/Dropdown/DropdownSmall";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/components/ui/Button";
import { LANGUAGES, TIME_FORMAT } from "@/constants/options";
import axios from "axios";
import Loader from "@/components/ui/Loader";
import { API_BASE_URL } from "@/constants/constants";
import { fetchCsrfToken } from "@/lib/utils/loadCsrf";

const GeneralPage = () => {
  const router = useRouter();
  const { view, user_id } = router.query;
  const currentView = (view as string) || "profile";
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const [userType, setUserType] = useState<string | null>(null);
  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [isUserTypeLoading, setIsUserTypeLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchUserType = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
          credentials: "include",
        });
        const json = await res.json();

        const type = json?.user?.type || "Producer";
        const rawSubTypes = json?.user?.sub_type;

        const parsedSubTypes = Array.isArray(rawSubTypes)
          ? rawSubTypes
          : typeof rawSubTypes === "string"
          ? rawSubTypes.replace(/[{}"]/g, "").split(",").filter(Boolean)
          : [];

        setUserType(type);
        setSubTypes(parsedSubTypes);
      } catch (err) {
        console.error("Error fetching user type", err);
        setUserType("Producer");
        setSubTypes([]);
      } finally {
        setIsUserTypeLoading(false);
      }
    };

    fetchUserType();
  }, [userId]);

  // Use useMemo to conditionally build the navigation buttons based on userType.
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

  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [selectedTimeFormat, setSelectedTimeFormat] = useState(TIME_FORMAT[0]);

  // User state
  const [user, setUser] = useState({
    profilePicture: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    language: "English",
    timeFormat: "24-hour",
  });

  const [weatherSettings, setWeatherSettings] = useState({
    location: "",
    scale: "Celsius",
    aiSuggestions: false,
  });

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSuccessMessage("");

    try {
      const csrfToken = await fetchCsrfToken();
      await axios.put(
        `${API_BASE_URL}/user/${userId}`,
        {
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phoneNumber,
          language: user.language,
          time_format: user.timeFormat,
        },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      setSuccessMessage("Profile updated successfully!");
    } catch (error: any) {
      console.error(
        "Error updating profile:",
        error.response?.data?.error || error.message
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch the user data (profile details)
  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
          withCredentials: true,
        });

        const data = response.data;

        setUser({
          profilePicture: data.user.profile_picture || "",
          firstName: data.user.first_name || "",
          lastName: data.user.last_name || "",
          phoneNumber: data.user.phone_number || "",
          language: data.user.language || "English",
          timeFormat: data.user.time_format || "24-hour",
        });
      } catch (error: any) {
        console.error(
          "Error fetching user data:",
          error.response?.data?.error || error.message
        );
      }
    };

    fetchUserData();
  }, [userId]);

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
                      <img
                        src={
                          user.profilePicture ||
                          `https://eu.ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&size=250`
                        }
                        alt="Profile Picture"
                        className="w-24 h-24 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                      />

                      {user.profilePicture && (
                        <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              setUser((prev) => ({
                                ...prev,
                                profilePicture: "",
                              }))
                            }
                            className="rounded-full p-2"
                            aria-label="Remove profile picture"
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="size-12 text-red-200"
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* File Upload Section */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-dark dark:text-light">
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
                        className="cursor-pointer bg-green-200 text-white px-3 py-1 rounded text-sm mt-1 text-center w-fit hover:bg-green-100"
                      >
                        Choose File
                      </label>
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
                      isDisabled={true}
                    />
                    <TextField
                      label="Last Name"
                      placeholder="Enter your last name"
                      value={user.lastName}
                      onChange={(val) =>
                        setUser((prev) => ({ ...prev, lastName: val }))
                      }
                      width="large"
                      isDisabled={true}
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
                      This applies across your account.
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
                      <input
                        type="checkbox"
                        id="ai-suggestions"
                        checked={weatherSettings.aiSuggestions}
                        onChange={() =>
                          setWeatherSettings((prev) => ({
                            ...prev,
                            aiSuggestions: !prev.aiSuggestions,
                          }))
                        }
                        className="w-5 h-5"
                      />
                      <label
                        htmlFor="ai-suggestions"
                        className="text-sm dark:text-light"
                      >
                        Enable AI Suggestions
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Poultry View */}
              {currentView === "poultry" && (
                <div className="rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-light">
                    Poultry Settings
                  </h2>
                </div>
              )}

              {/* Fishery View */}
              {currentView === "fishery" && (
                <div className="rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-light">
                    Fishery Settings
                  </h2>
                </div>
              )}

              {/* Animal Husbandry View */}
              {currentView === "animal_husbandry" && (
                <div className="rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-light">
                    Animal Husbandry Settings
                  </h2>
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
