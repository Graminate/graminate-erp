import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faXTwitter,
  faLinkedin,
  faGithub,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { faPhone } from "@fortawesome/free-solid-svg-icons";

const navigation = {
  services: [
    { key: "Software Development", href: "/company/services#consultation" },
    { key: "Design Solutions", href: "/company/services#design" },
    { key: "IT Operations", href: "/company/services#ops" },
    { key: "Quality Assurance", href: "/company/services#qa" },
  ],
  industries: [
    { key: "Logistics", href: "/company/industries#logistics" },
    { key: "Healthcare", href: "/company/" },
    { key: "Finance", href: "http://localhost:5174/become-partner" },
    { key: "B2B Solution", href: "http://localhost:5174/support" },
    { key: "Education", href: "http://localhost:5174/support" },
    { key: "Public Sector", href: "http://localhost:5174/support" },
  ],
  ourProducts: [
    { key: "Get Started", href: "/products/graminate" },
    { key: "Pricing", href: "/pricing" },
    { key: "Downloads", href: "/company/downloads" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-4 sm:pt-12 sm:pb-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-2">
            <h2 className="text-left text-3xl font-semibold text-white">
              Graminate <sup className="text-sm">ERP</sup>
            </h2>
            <p className="text-sm text-gray-300">
              Graminate is a suite of business apps that cover all your
              agricultural company needs: CRM, eCommerce, accounting, inventory,
              project management, etc.
            </p>
            <div className="flex gap-x-8 pt-6">
              <a
                href="https://facebook.com"
                target="_blank"
                aria-label="Facebook"
              >
                <FontAwesomeIcon
                  icon={faFacebookF}
                  className="h-5 w-5 text-gray-300 hover:text-white"
                />
              </a>
              <a href="https://x.com" target="_blank" aria-label="X">
                <FontAwesomeIcon
                  icon={faXTwitter}
                  className="h-5 w-5 text-gray-300 hover:text-white"
                />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon
                  icon={faLinkedin}
                  className="h-5 w-5 text-gray-300 hover:text-white"
                />
              </a>
              <a href="https://github.com" target="_blank" aria-label="GitHub">
                <FontAwesomeIcon
                  icon={faGithub}
                  className="h-5 w-5 text-gray-300 hover:text-white"
                />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                aria-label="Instagram"
              >
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="h-5 w-5 text-gray-300 hover:text-white"
                />
              </a>
              <a href="tel:+4917671259396" aria-label="Phone">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="h-5 w-5 text-gray-300 hover:text-white"
                />
              </a>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 xl:grid-cols-3">
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-white">Services</h3>
              <ul role="list" className="mt-2 space-y-2">
                {navigation.services.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      {item.key}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-white">Industries</h3>
              <ul role="list" className="mt-2 space-y-2">
                {navigation.industries.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      {item.key}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 xl:col-span-1">
              <h3 className="text-sm font-semibold text-white">
                Graminate AgroERP
              </h3>
              <ul role="list" className="mt-2 space-y-2">
                {navigation.ourProducts.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      {item.key}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
