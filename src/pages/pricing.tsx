import { useState } from "react";
import Head from "next/head";
import PriceCard from "@/components/cards/PriceCard";
import Footer from "@/components/layout/Footer";
import HomeNavbar from "@/components/layout/Navbar/HomeNavbar";

type Frequency = "monthly" | "annually";

type FrequencyOption = {
  value: Frequency;
  labelKey: string;
  priceSuffix: string;
};

type PricingTier = {
  nameKey: string;
  id: string;
  href: string;
  price: Record<Frequency, string>;
  descriptionKey: string;
  featuresKeys: string[];
  mostPopular: boolean;
};

type Pricing = {
  frequencies: FrequencyOption[];
  tiers: PricingTier[];
};

const pricing: Pricing = {
  frequencies: [
    {
      value: "monthly",
      labelKey: "Monthly",
      priceSuffix: "/month",
    },
    {
      value: "annually",
      labelKey: "Yearly",
      priceSuffix: "/year",
    },
  ],
  tiers: [
    {
      nameKey: "Mini Pack",
      id: "tier-mini",
      href: "#",
      price: { monthly: "₹75", annually: "₹900" },
      descriptionKey: "Mini Pack Description",
      featuresKeys: ["point1", "point2", "point3", "point4"],
      mostPopular: false,
    },
    {
      nameKey: "Regular Pack",
      id: "tier-regular",
      href: "#",
      price: { monthly: "₹120", annually: "₹1440" },
      descriptionKey: "Regular Pack Description",
      featuresKeys: ["point1", "point2", "point3", "point4", "point5"],
      mostPopular: true,
    },
    {
      nameKey: "Professional Pack",
      id: "tier-professional",
      href: "#",
      price: { monthly: "₹240", annually: "₹2880" },
      descriptionKey: "Professional Pack description",
      featuresKeys: [
        "point1",
        "point2",
        "point3",
        "point4",
        "point5",
        "point6",
      ],
      mostPopular: false,
    },
  ],
};

export default function PricingPage() {
  const [faqOpen, setFaqOpen] = useState<Set<number>>(new Set());
  const toggleFAQ = (index: number) => {
    setFaqOpen((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  const [frequency, setFrequency] = useState<FrequencyOption>(
    pricing.frequencies[0]
  );
  const [selectedTier, setSelectedTier] = useState<PricingTier>(
    pricing.tiers.find((tier) => tier.mostPopular) || pricing.tiers[0]
  );

  return (
    <>
      <Head>
        <title>Graminate ERP | Pricing</title>
      </Head>

      <HomeNavbar />
      <div className="pt-16 sm:pt-32">
        <main>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-dark text-base leading-7 font-semibold">
                Pricing
              </h1>
              <p className="mt-2 text-5xl font-semibold tracking-tight sm:text-6xl">
                Price Header
              </p>
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-gray-600 sm:text-xl">
              Price Subheader
            </p>

            <div className="mt-16 flex justify-center">
              <fieldset aria-label="Payment frequency" className="flex">
                {pricing.frequencies.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-full px-3 py-2 text-xs leading-5 font-semibold transition-colors ${
                      frequency.value === option.value ? "bg-gray-400" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      checked={frequency.value === option.value}
                      onChange={() => setFrequency(option)}
                      className="hidden"
                    />
                    {option.labelKey}
                  </label>
                ))}
              </fieldset>
            </div>

            <div className="isolate mx-auto mt-10 mb-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {pricing.tiers.map((tier) => (
                <PriceCard
                  key={tier.id}
                  label={tier.nameKey}
                  description={tier.descriptionKey}
                  price={tier.price[frequency.value]}
                  priceSuffix={frequency.priceSuffix}
                  points={tier.featuresKeys.map((key) => key)}
                  href={tier.href}
                  popular={tier.mostPopular}
                  isSelected={selectedTier.id === tier.id}
                  onClick={() => setSelectedTier(tier)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <dl className="mt-10 divide-y divide-gray-900/10">
              {/* Add number of questions */}
              {[1, 2, 3].map((index) => (
                <div key={index} className="py-6 first:pt-0 last:pb-0">
                  <dt>
                    <button
                      type="button"
                      className="flex w-full items-start justify-between text-left text-gray-900 focus:outline-none"
                      aria-controls={`faq-${index}`}
                      aria-expanded={faqOpen.has(index)}
                      onClick={() => toggleFAQ(index)}
                    >
                      <span className="text-base/7 font-semibold">
                        {`Question ${index}`}
                      </span>
                      <span className="ml-6 flex h-7 items-center">
                        {!faqOpen.has(index) ? (
                          <svg
                            className="size-6 transition-transform duration-200"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v12m6-6H6"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="size-6 transition-transform duration-200"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M18 12H6"
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  </dt>
                  {faqOpen.has(index) && (
                    <dd id={`faq-${index}`} className="mt-2 text-gray-600">
                      <p>{`Answer ${index}`}</p>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
