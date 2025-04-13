import React, { useState, useEffect } from "react";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal";
import { useRouter } from "next/router";
import axios from "axios";
import { API_BASE_URL } from "@/constants/constants";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

type ModalType = "confirmDelete" | "password" | "info" | null;
type InfoModalContent = {
  title: string;
  message: string;
  type: "success" | "error";
};

const AccountPage = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [infoModalContent, setInfoModalContent] = useState<InfoModalContent>({
    title: "",
    message: "",
    type: "success",
  });

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (router.isReady && router.query.user_id) {
      setUserId(router.query.user_id as string);
    }
  }, [router.isReady, router.query.user_id]);

  const openModal = (type: ModalType, infoContent?: InfoModalContent) => {
    setPassword("");
    setPasswordError("");
    if (type === "info" && infoContent) {
      setInfoModalContent(infoContent);
    }
    setActiveModal(type);
  };

  const closeModal = () => {
    const wasSuccess = infoModalContent.type === "success";
    setActiveModal(null);
    setInfoModalContent({ title: "", message: "", type: "success" }); 

    if (wasSuccess) {
      sessionStorage.setItem("accountJustDeleted", "true");
      router.push("/");
    }
   
  };

  const handleInitiateDelete = () => {
    if (!userId) return;
    openModal("confirmDelete");
  };

  const handleConfirmDeletion = () => {
    setActiveModal(null);
    setTimeout(() => openModal("password"), 50);
  };

  const handlePasswordVerification = async () => {
    if (!userId || !password) {
      setPasswordError("Password is required");
      return;
    }
    setIsVerifying(true);
    setPasswordError("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/verify-password/${userId}`,
        { password },
        { withCredentials: true }
      );
      if (response.data.valid) {
        setActiveModal(null);
        await performAccountDeletion();
      } else {
        setPasswordError("Incorrect password");
      }
    } catch (error) {
      console.error("Password verification failed", error);
      setPasswordError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const performAccountDeletion = async () => {
    if (!userId) return;
    setIsDeleting(true);
    try {
      const deleteResponse = await axios.delete(
        `${API_BASE_URL}/user/delete/${userId}`,
        { withCredentials: true }
      );
      if (deleteResponse.status === 200) {
        openModal("info", {
          title: "Deleted!",
          message: "Your account has been deleted.",
          type: "success",
        });
      } else {
        throw new Error(
          "Deletion request failed with status: " + deleteResponse.status
        );
      }
    } catch (err) {
      console.error("Failed to delete account", err);
      openModal("info", {
        title: "Error",
        message: "Something went wrong. Could not delete account.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalHeaderClose = () => {
    setActiveModal(null);
    setPassword("");
    setPasswordError("");
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case "confirmDelete":
        return (
          <DeleteAccountModal
            isOpen={true}
            onClose={handleModalHeaderClose}
            onHeaderClose={handleModalHeaderClose}
            title="Are you sure?"
            footerContent={
              <>
                <Button
                  text="Cancel"
                  style="secondary"
                  onClick={handleModalHeaderClose}
                />
                <Button
                  text="Delete"
                  style="primary"
                  onClick={handleConfirmDeletion}
                />
              </>
            }
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You won't be able to revert this! Deleting your account will
              permanently remove all your data.
            </p>
          </DeleteAccountModal>
        );

      case "password":
        return (
          <DeleteAccountModal
            isOpen={true}
            onClose={() => !isVerifying && handleModalHeaderClose()}
            onHeaderClose={handleModalHeaderClose}
            title="Enter your password"
            footerContent={
              <>
                <Button
                  text="Cancel"
                  style="secondary"
                  onClick={handleModalHeaderClose}
                  isDisabled={isVerifying}
                />
                <Button
                  text="Confirm"
                  style="primary"
                  onClick={handlePasswordVerification}
                  isDisabled={isVerifying || !password}
                />
              </>
            }
          >
            <TextField
              label="Password"
              placeholder="Enter your password to confirm"
              value={password}
              onChange={(val) => {
                setPassword(val);
                setPasswordError("");
              }}
              password={true}
              type={passwordError ? "error" : ""}
              errorMessage={passwordError}
              isDisabled={isVerifying}
              width="large"
            />
          </DeleteAccountModal>
        );

      case "info":
        return (
          <DeleteAccountModal
            isOpen={true}
            onClose={closeModal}
            onHeaderClose={closeModal}
            title={infoModalContent.title}
            footerContent={
              <Button text="OK" style="primary" onClick={closeModal} />
            }
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {infoModalContent.message}
            </p>
          </DeleteAccountModal>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Settings - Account</title>
      </Head>
      {/* Assuming PlatformLayout handles its own auth check */}
      <PlatformLayout>
        <div className="flex min-h-screen">
          <SettingsBar />

          <main className="flex-1 px-6 md:px-12 py-6">
            <section>
              <h1 className="pb-4 font-bold text-xl md:text-2xl text-dark dark:text-light">
                Account Settings
              </h1>
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-grow">
                    <p className="font-semibold text-dark dark:text-light">
                      Delete Account
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Once you delete your account, you will lose all access and
                      data. This action cannot be undone. Please be certain.
                    </p>
                  </div>

                  <button
                    onClick={handleInitiateDelete}
                    disabled={!userId || isDeleting}
                    className="px-4 py-2 text-sm font-medium shadow-sm text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </PlatformLayout>
      {/* Pass children to PlatformLayout */}
      {renderModalContent()}
    </>
  );
};

export default AccountPage;
