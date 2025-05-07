import Button from "@/components/ui/Button";
import PlatformLayout from "@/layout/PlatformLayout";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Loader from "@/components/ui/Loader";
import Head from "next/head";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image";

type PoultryHealthRecord = {
  poultry_health_id: string;
  date: string;
  created_at: string;
  bird_type: string;
  purpose: string;
  veterinary_name: string;
  birds_in?: number;
  birds_died?: number;
  deworming: boolean;
  vaccines: string[] | string;
  symptoms: string[] | string;
  medications?: string;
  actions_taken?: string;
  remarks?: string;
  mortality_rate?: number;
};

const PoultryHealthDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;
  const [record, setRecord] = useState<PoultryHealthRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data) {
      try {
        const parsed = JSON.parse(data as string) as PoultryHealthRecord;
        setRecord(parsed);
      } catch (error) {
        console.error("Error parsing poultry health data:", error);
      }
    }
  }, [data, user_id, router]);

  const handleDownloadPdf = async () => {
    const element = reportRef.current;
    if (!element || !record) return;

    const buttons = document.querySelectorAll(".exclude-from-pdf");
    buttons.forEach((btn) => ((btn as HTMLElement).style.display = "none"));

    setIsDownloading(true);

    try {
      const imgData = await domtoimage.toPng(element);

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = imgData;

      img.onload = () => {
        const scaleFactor = 0.75;
        const imgWidth = pageWidth * scaleFactor;
        const imgHeight = (img.height * imgWidth) / img.width;

        const xOffset = (pageWidth - imgWidth) / 2;
        let position = 0;
        let heightLeft = imgHeight;

        while (heightLeft > 0) {
          pdf.addImage(
            imgData,
            "PNG",
            xOffset,
            position,
            imgWidth,
            imgHeight,
            undefined,
            "FAST"
          );
          heightLeft -= pageHeight;
          if (heightLeft > 0) {
            pdf.addPage();
            position = -heightLeft;
          }
        }

        const dateString = record.date
          ? new Date(record.date).toISOString().split("T")[0]
          : "unknown-date";

        const filename = `Poultry-Health-Report-${record.poultry_health_id}-${dateString}.pdf`;
        pdf.save(filename);

        setIsDownloading(false);
        buttons.forEach((btn) => ((btn as HTMLElement).style.display = ""));
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
      setIsDownloading(false);
      buttons.forEach((btn) => ((btn as HTMLElement).style.display = ""));
    }
  };

  if (!record) return <Loader />;

  const formatList = (list: string[] | string): string => {
    if (Array.isArray(list)) {
      return list.filter(Boolean).join(", ");
    }
    return list || "—";
  };

  const formatDate = (dateString: string | Date): string => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <PlatformLayout>
      <Head>
        <title>Health Report | {formatDate(record.date)}</title>
      </Head>
      <div className="mb-4 flex justify-start exclude-from-pdf">
        <Button
          text="Back"
          style="ghost"
          arrow="left"
          onClick={() => router.push(`/platform/${user_id}/poultry_health`)}
          isDisabled={isDownloading}
        />
      </div>

      <div
        ref={reportRef}
        className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto"
      >
        <div className="text-center mb-6 pb-4">
          <h1 className="text-2xl font-bold text-dark mb-1">
            Poultry Health Report
          </h1>
          <p className="text-sm text-dark">{formatDate(record.created_at)}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-dark mb-3 border-b pb-1">
            Poultry Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-dark ">
            <p>
              <span className="font-semibold mr-2 text-dark">Record #:</span>
              {record.poultry_health_id}
            </p>
            <p>
              <span className="font-semibold mr-2 text-dark">Bird Type:</span>
              {record.bird_type || "N/A"}
            </p>
            <p>
              <span className="font-semibold mr-2 text-dark">Purpose:</span>
              {record.purpose || "N/A"}
            </p>
            <p>
              <span className="font-semibold mr-2 text-dark">
                Veterinarian:
              </span>
              {record.veterinary_name || "N/A"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-dark mb-3 border-b pb-1">
            Health Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-dark">
            <p>
              <span className="font-semibold mr-2 text-dark">Birds In:</span>
              {record.birds_in ?? "N/A"}
            </p>
            <p>
              <span className="font-semibold mr-2 text-dark">Birds Died:</span>
              {record.birds_died ?? "N/A"}
            </p>
            <p>
              <span className="font-semibold mr-2 text-dark">Deworming:</span>
              {record.deworming ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {/* Treatments & Observations Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-dark mb-3 border-b pb-1">
            Treatments & Observations
          </h2>
          <div className="space-y-4 text-sm text-dark">
            <div className="flex flex-wrap gap-x-8 lg:gap-x-16 xl:gap-x-20">
              <span className="font-semibold text-dark min-w-[220px]">
                Vaccines Administered:
              </span>
              <span>{formatList(record.vaccines)}</span>
            </div>

            <div className="flex flex-wrap gap-x-8 lg:gap-x-16 xl:gap-x-20">
              <span className="font-semibold text-dark min-w-[220px]">
                Observed Symptoms:
              </span>
              <span>{formatList(record.symptoms)}</span>
            </div>

            <div className="flex flex-wrap gap-x-8 lg:gap-x-16 xl:gap-x-20">
              <span className="font-semibold text-dark min-w-[220px]">
                Medications Given:
              </span>
              <span>{record.medications || "—"}</span>
            </div>

            <div className="flex flex-wrap gap-x-8 lg:gap-x-16 xl:gap-x-20">
              <span className="font-semibold text-dark min-w-[220px]">
                Actions Taken:
              </span>
              <span>{record.actions_taken || "—"}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-dark mb-3 border-b pb-1">
            Remarks
          </h2>
          <p className="text-sm text-dark whitespace-pre-wrap">
            {record.remarks || "No additional remarks."}
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center exclude-from-pdf">
        <Button
          text={isDownloading ? "Downloading..." : "Download Report (PDF)"}
          onClick={handleDownloadPdf}
          isDisabled={isDownloading}
          style="primary"
        />
      </div>
    </PlatformLayout>
  );
};

export default PoultryHealthDetails;
