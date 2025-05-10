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
import {
  useUserPreferences,
  TimeFormatOption,
  TemperatureScaleOption,
} from "@/contexts/UserPreferencesContext";
import { getTranslator, SupportedLanguage, translations } from "@/translations";

const GeneralPage = () => {
  const router = useRouter();
  const { view, user_id } = router.query;
  const currentView = (view as string) || "profile";
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const {
    setTimeFormat: setContextTimeFormat,
    setTemperatureScale: setContextTemperatureScale,
    temperatureScale: contextTemperatureScale,
    language: currentLanguage,
    setLanguage: setContextLanguage,
  } = useUserPreferences();

  const t = useMemo(() => getTranslator(currentLanguage), [currentLanguage]);

  const [userType, setUserType] = useState<string | null>(null);
  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [isUserTypeLoading, setIsUserTypeLoading] = useState(true);

  const [user, setUser] = useState({
    profilePicture: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    language: currentLanguage,
    timeFormat: "24-hour" as TimeFormatOption,
  });

  const [weatherSettings, setWeatherSettings] = useState<{
    location: string;
    scale: TemperatureScaleOption;
    aiSuggestions: boolean;
  }>({
    location: "",
    scale: contextTemperatureScale || "Celsius",
    aiSuggestions: false,
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

        const fetchedTimeFormat = (userData.time_format ||
          "24-hour") as TimeFormatOption;
        const fetchedTempScale = (userData.temperature_scale ||
          "Celsius") as TemperatureScaleOption;
        const fetchedLanguage = (userData.language ||
          "English") as SupportedLanguage;

        setUser({
          profilePicture: userData.profile_picture || "",
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          phoneNumber: userData.phone_number || "",
          language: fetchedLanguage,
          timeFormat: fetchedTimeFormat,
        });
        setContextTimeFormat(fetchedTimeFormat);
        setContextTemperatureScale(fetchedTempScale);
        setContextLanguage(fetchedLanguage);

        setWeatherSettings((prev) => ({
          ...prev,
          scale: fetchedTempScale,
        }));

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
        const defaultTimeFormat = "24-hour" as TimeFormatOption;
        const defaultTempScale = "Celsius" as TemperatureScaleOption;
        const defaultLanguage = "English" as SupportedLanguage;

        setUser({
          profilePicture: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          language: defaultLanguage,
          timeFormat: defaultTimeFormat,
        });
        setContextTimeFormat(defaultTimeFormat);
        setContextTemperatureScale(defaultTempScale);
        setContextLanguage(defaultLanguage);

        setWeatherSettings((prev) => ({
          ...prev,
          scale: defaultTempScale,
        }));
      } finally {
        setIsUserTypeLoading(false);
      }
    };
    fetchUserData();
  }, [
    userId,
    setContextTimeFormat,
    setContextTemperatureScale,
    setContextLanguage,
  ]);

  useEffect(() => {
    setUser((prevUser) => ({ ...prevUser, language: currentLanguage }));
  }, [currentLanguage]);

  const navButtons = useMemo(() => {
    const buttons = [{ nameKey: "profile", view: "profile" }];
    if (userType === "Producer") {
      buttons.push({ nameKey: "weather", view: "weather" });
      if (subTypes.includes("Poultry")) {
        buttons.push({ nameKey: "poultry", view: "poultry" });
      }
      if (subTypes.includes("Fishery")) {
        buttons.push({ nameKey: "fishery", view: "fishery" });
      }
      if (subTypes.includes("Animal Husbandry")) {
        buttons.push({ nameKey: "animalHusbandry", view: "animal_husbandry" });
      }
    }
    return buttons.map((btn) => ({
      ...btn,
      name: t(btn.nameKey as keyof typeof translations.English) || btn.nameKey,
    }));
  }, [userType, subTypes, t]);

  const changeView = (newView: string) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, view: newView },
    });
  };

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [profileErrorMessage, setProfileErrorMessage] = useState("");

  const [isSavingWeather, setIsSavingWeather] = useState(false);
  const [weatherSuccessMessage, setWeatherSuccessMessage] = useState("");
  const [weatherErrorMessage, setWeatherErrorMessage] = useState("");

  const handleSaveProfileChanges = async () => {
    if (!userId) return;
    setIsSavingProfile(true);
    setProfileSuccessMessage("");
    setProfileErrorMessage("");

    try {
      await axiosInstance.put(`/user/${userId}`, {
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phoneNumber,
        language: user.language,
        time_format: user.timeFormat,
      });

      setContextTimeFormat(user.timeFormat);
      setContextLanguage(user.language as SupportedLanguage);
      setProfileSuccessMessage(t("profileUpdateSuccess"));
    } catch (error: unknown) {
      let errorMessage = t("anUnknownErrorOccurred");
      if (axios.isAxiosError(error)) {
        const serverError =
          error.response?.data?.error || error.response?.data?.message;
        errorMessage = serverError || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setProfileErrorMessage(`${t("profileUpdateError")} ${errorMessage}`);
      console.error("Error updating profile:", errorMessage, error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveWeatherSettings = async () => {
    if (!userId) return;
    setIsSavingWeather(true);
    setWeatherSuccessMessage("");
    setWeatherErrorMessage("");

    try {
      await axiosInstance.put(`/user/${userId}`, {
        temperature_scale: weatherSettings.scale,
      });
      setContextTemperatureScale(weatherSettings.scale);
      setWeatherSuccessMessage(t("weatherUpdateSuccess"));
    } catch (error: unknown) {
      let errorMessage = t("anUnknownErrorOccurred");
      if (axios.isAxiosError(error)) {
        const serverError =
          error.response?.data?.error || error.response?.data?.message;
        errorMessage = serverError || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setWeatherErrorMessage(`${t("weatherUpdateError")} ${errorMessage}`);
      console.error("Error updating weather settings:", errorMessage, error);
    } finally {
      setIsSavingWeather(false);
    }
  };

  const languageOptions = useMemo(() => {
    return LANGUAGES.map((lang) => ({
      value:
        typeof lang === "object" && "value" in (lang as { value: string })
          ? (lang as { value: string }).value
          : lang,
      label:
        typeof lang === "object" && "label" in (lang as { label: string })
          ? (lang as { label: string }).label
          : lang,
    }));
  }, []);

  const languageDropdownDisplayItems = useMemo(() => {
    return languageOptions.map((option) => option.label);
  }, [languageOptions]);

  const selectedLanguageLabel = useMemo(() => {
    const found = languageOptions.find(
      (option) => option.value === user.language
    );
    return found ? found.label : user.language;
  }, [user.language, languageOptions]);

  const handleLanguageSelect = (selectedLabel: string) => {
    const found = languageOptions.find(
      (option) => option.label === selectedLabel
    );
    if (found) {
      setUser((prev) => ({
        ...prev,
        language: found.value as SupportedLanguage,
      }));
    }
  };

  return (
    <>
      <Head>
        <title>{t("settings")}</title>
      </Head>
      <PlatformLayout>
        <div className="flex min-h-screen">
          <SettingsBar />
          <main className="flex-1 px-12">
            <div className="pb-4 font-bold text-lg text-dark dark:text-light">
              {t("generalSettings")}
            </div>

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
              {currentView === "profile" && (
                <div>
                  <div className="rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4 dark:text-light">
                      {t("profileSettings")}
                    </h2>
                    <p className="text-gray-300 mb-6">
                      {t("profileSettingsDescription")}
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
                              setUser((prev) => ({
                                ...prev,
                                profilePicture: "",
                              }));
                            }}
                            className="rounded-full p-2 text-white hover:text-red-400"
                            aria-label={t("removeProfilePicture")}
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="size-6"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-dark dark:text-light mb-1">
                        {t("uploadProfilePicture")}
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
                        {t("chooseFile")}
                      </label>
                      <p className="text-xs text-dark dark:text-light mt-1">
                        {t("max2MB")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 max-w-lg">
                    <TextField
                      label={t("firstName")}
                      placeholder={t("enterFirstName")}
                      value={user.firstName}
                      onChange={(val) =>
                        setUser((prev) => ({ ...prev, firstName: val }))
                      }
                      width="large"
                      isDisabled={true}
                    />
                    <TextField
                      label={t("lastName")}
                      placeholder={t("enterLastName")}
                      value={user.lastName}
                      onChange={(val) =>
                        setUser((prev) => ({ ...prev, lastName: val }))
                      }
                      width="large"
                      isDisabled={true}
                    />
                    <div className="flex gap-4">
                      <DropdownSmall
                        label={t("language")}
                        items={languageDropdownDisplayItems}
                        selected={selectedLanguageLabel}
                        onSelect={handleLanguageSelect}
                      />
                      <DropdownSmall
                        label={t("timeFormat")}
                        items={TIME_FORMAT.map((tf) => String(tf))}
                        selected={user.timeFormat}
                        onSelect={(val) =>
                          setUser((prev) => ({
                            ...prev,
                            timeFormat: val as TimeFormatOption,
                          }))
                        }
                      />
                    </div>
                    <TextField
                      label={t("phoneNumber")}
                      placeholder={t("enterPhoneNumber")}
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
                      text={t("saveChanges")}
                      onClick={handleSaveProfileChanges}
                      isDisabled={isSavingProfile}
                    />
                  </div>
                  {profileSuccessMessage && (
                    <p className="text-green-500 mt-2">
                      {profileSuccessMessage}
                    </p>
                  )}
                  {profileErrorMessage && (
                    <p className="text-red-500 mt-2">{profileErrorMessage}</p>
                  )}
                </div>
              )}

              {currentView === "weather" && (
                <div>
                  <div className="rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4 dark:text-light">
                      {t("weatherSettings")}
                    </h2>
                    <p className="text-gray-300 mb-6">
                      {t("weatherSettingsDescription")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 max-w-lg">
                    <TextField
                      label={t("setLocation")}
                      placeholder={t("enterLocation")}
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
                      label={t("scale")}
                      items={["Celsius", "Fahrenheit"]}
                      selected={weatherSettings.scale}
                      onSelect={(val) =>
                        setWeatherSettings((prev) => ({
                          ...prev,
                          scale: val as TemperatureScaleOption,
                        }))
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
                        {t("enableAISuggestions")}
                      </label>
                    </div>
                    <div className="mt-6">
                      <Button
                        style="primary"
                        text={t("saveWeatherSettings")}
                        onClick={handleSaveWeatherSettings}
                        isDisabled={isSavingWeather}
                      />
                    </div>
                    {weatherSuccessMessage && (
                      <p className="text-green-500 mt-2">
                        {weatherSuccessMessage}
                      </p>
                    )}
                    {weatherErrorMessage && (
                      <p className="text-red-500 mt-2">{weatherErrorMessage}</p>
                    )}
                  </div>
                </div>
              )}

              {currentView === "poultry" && (
                <div className="rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-6 dark:text-light">
                    {t("poultrySettings")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="mt-6 flex justify-end">
                    <Button
                      style="primary"
                      text="Save Poultry Settings"
                      onClick={() => {
                        console.log("Saving poultry settings");
                      }}
                    />
                  </div>
                </div>
              )}

              {currentView === "fishery" && (
                <div className="rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-light">
                    {t("fisherySettings")}
                  </h2>
                </div>
              )}

              {currentView === "animal_husbandry" && (
                <div className="rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-light">
                    {t("animalHusbandrySettings")}
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
