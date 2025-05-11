import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { getTranslator, translations } from "@/translations";
import axiosInstance from "@/lib/utils/axiosInstance";

type TranslationKey = keyof typeof translations.English;

interface PoultrySettingsState {
  mortalityRateThreshold: string;
  defaultVaccinationReminder: string;
  autoHealthRecords: boolean;
  idealTempMin: string;
  idealTempMax: string;
  lightHours: string;
  lightScheduleType: string;
  enableTempAlerts: boolean;
  dailyFeedConsumption: string;
  lowFeedInventoryAlert: string;
  expectedEggProduction: string;
}

const PoultrySettingsPage = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const { language: currentLanguage } = useUserPreferences();
  const t = useMemo(() => getTranslator(currentLanguage), [currentLanguage]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [poultrySettings, setPoultrySettings] = useState<PoultrySettingsState>({
    mortalityRateThreshold: "",
    defaultVaccinationReminder: "7 days before due",
    autoHealthRecords: true,
    idealTempMin: "",
    idealTempMax: "",
    lightHours: "",
    lightScheduleType: "Fixed Schedule",
    enableTempAlerts: true,
    dailyFeedConsumption: "",
    lowFeedInventoryAlert: "3 days supply remaining",
    expectedEggProduction: "",
  });

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    const fetchPoultryData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          `/user/${userId}/poultry-settings`
        );
        if (response.data) {
          setPoultrySettings(response.data);
        }
      } catch (error) {
        console.error("Error fetching poultry settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    setIsLoading(false);
  }, [userId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setPoultrySettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSavePoultrySettings = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      await axiosInstance.put(
        `/user/${userId}/poultry-settings`,
        poultrySettings
      );
      setSuccessMessage(t("settingsUpdateSuccess" as TranslationKey));
    } catch (error) {
      console.error("Error saving poultry settings:", error);
      setErrorMessage(t("settingsUpdateError" as TranslationKey));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t("poultrySettings" as TranslationKey)}</title>
      </Head>
      <PlatformLayout>
        <div className="flex min-h-screen">
          <SettingsBar />
          <main className="flex-1 px-4 sm:px-6 md:px-12">
            <div className="py-6">
              <div className="pb-4 font-bold text-lg text-dark dark:text-light">
                {t("poultrySettings" as TranslationKey)}
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader />
                </div>
              ) : (
                <section>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Manage how you receive notifications for your operations
                    </p>
                    <Button text="Save Changes" style="primary" />
                  </div>
                  <div className="rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="font-semibold mb-4 dark:text-light">
                          Poultry Health Monitoring
                        </h3>
                        <div className="space-y-4">
                          <div></div>
                          <div></div>
                          <div className="flex items-center gap-2"></div>
                        </div>
                      </div>
                      {/* Environmental Controls */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="font-semibold mb-4 dark:text-light">
                          Environment Controls
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex gap-2"></div>
                          </div>
                          <div>
                            <div className="flex gap-2"></div>
                          </div>
                          <div className="flex items-center gap-2"></div>
                        </div>
                      </div>
                      {/* Feed & Production */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="font-semibold mb-4 dark:text-light">
                          Feed & Production
                        </h3>
                        <div className="space-y-4">
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                      </div>
                    </div>

                    {successMessage && (
                      <p className="text-green-500 mt-2 text-right">
                        {successMessage}
                      </p>
                    )}
                    {errorMessage && (
                      <p className="text-red-500 mt-2 text-right">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </PlatformLayout>
    </>
  );
};

export default PoultrySettingsPage;
