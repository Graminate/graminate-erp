import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import Button from "../ui/Button";

type Props = {
  version: string;
  platformIcons: (string | IconDefinition)[];
  platforms: string[];
  mobile?: boolean;
};

const DownloadTable = ({
  version,
  platformIcons,
  platforms,
  mobile = false,
}: Props) => {
  return (
    <>
      <div className="w-full rounded-lg">
        <div className="border-b border-gray-300 py-4">
          <h2 className="text-xl font-semibold">{version}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] table-fixed text-left">
            {!mobile && (
              <thead>
                <tr className="  bg-gray-400">
                  <th className="p-3"></th>
                  <th className="p-3 text-left">Community</th>
                  <th className="p-3 text-left">Enterprise</th>
                </tr>
              </thead>
            )}
            <tbody>
              {platforms.map((platform, index) => (
                <tr key={platform} className="border-b border-gray-300">
                  <td className="flex items-center space-x-3 px-6 py-4">
                    {typeof platformIcons[index] === "string" ? (
                      <img
                        src={platformIcons[index] as string}
                        alt={platform}
                        className="h-5 w-5"
                      />
                    ) : (
                      <FontAwesomeIcon
                        className="h-5 w-5 text-gray-600"
                        icon={platformIcons[index] as IconDefinition}
                      />
                    )}
                    <span>{platform}</span>
                  </td>
                  {!mobile && (
                    <td className="px-6 py-4 text-center">
                      <Button style="primary" text="Download" />
                    </td>
                  )}
                  <td className="px-6 py-4 text-center">
                    <Button style="secondary" text="Download" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DownloadTable;
