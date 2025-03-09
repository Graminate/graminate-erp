import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavPanel from "@/components/layout/NavPanel";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";
import TextField from "@/components/ui/TextField";
import DropdownSmall from "@/components/ui/Dropdown/DropdownSmall";
import Button from "@/components/ui/Button";

const SettingsPage = () => {
  const router = useRouter();
  const { view } = router.query;
  const currentView = (view as string) || "profile";

  const navButtons = [
    { name: "Profile", view: "profile" },
    { name: "Weather", view: "weather" },
    { name: "Occupation", view: "occupation" },
  ];

  const changeView = (newView: string) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, view: newView },
    });
  };

  const languageOptions = ["English", "Hindi", "Assamese"];
  const timeFormatOptions = ["12-hour", "24-hour"];
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [selectedTimeFormat, setSelectedTimeFormat] = useState(
    timeFormatOptions[0]
  );

  // User state
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    language: "English",
    timeFormat: "24-hour",
  });

  const { user_id } = router.query; // Get user ID from the URL
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();

        setUser({
          firstName: data.user.first_name || "",
          lastName: data.user.last_name || "",
          phoneNumber: data.user.phone_number || "",
          language: data.user.language || "English",
          timeFormat: data.user.time_format || "24-hour",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Save Profile
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phoneNumber,
          language: user.language,
          time_format: user.timeFormat,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      setSuccessMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
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
              General
            </div>

            {/* Navigation panel */}
            <NavPanel
              buttons={navButtons}
              activeView={currentView}
              onNavigate={(newView: string) => changeView(newView)}
            />

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

                  <div className="flex flex-col gap-4 max-w-lg">
                    <TextField
                      label="First Name"
                      placeholder="Enter your first name"
                      value={user.firstName}
                      onChange={(val) =>
                        setUser((prev) => ({ ...prev, firstName: val }))
                      }
                      width="large"
                    />
                    <TextField
                      label="Last Name"
                      placeholder="Enter your last name"
                      value={user.lastName}
                      onChange={(val) =>
                        setUser((prev) => ({ ...prev, lastName: val }))
                      }
                      width="large"
                    />

                    {/* Language & Time Format Selectors in the Same Row */}
                    <div className="flex gap-4">
                      <DropdownSmall
                        label="Language"
                        items={languageOptions}
                        selected={user.language}
                        onSelect={(val) =>
                          setUser((prev) => ({ ...prev, language: val }))
                        }
                      />

                      <DropdownSmall
                        label="Time Format"
                        items={timeFormatOptions}
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

                  {/* Save Changes Button */}
                  <div className="mt-6">
                    <Button
                      text="Save Changes"
                      style="primary"
                      onClick={handleSaveChanges}
                    />
                  </div>

                  {successMessage && (
                    <p className="text-green-200 mt-2">{successMessage}</p>
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
                </div>
              )}

              {/* Occupation View */}
              {currentView === "occupation" && (
                <div className="rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-light">
                    Occupation Settings
                  </h2>
                  <p className="text-gray-300 mb-6">
                    This applies across your account.
                  </p>
                </div>
              )}
            </section>
          </main>
        </div>
      </PlatformLayout>
    </>
  );
};

export default SettingsPage;
