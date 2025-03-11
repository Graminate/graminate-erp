import { useState } from "react";

type Props = {
  label: string;
  onFileSelect?: (file: File | null) => void;
};

const Upload = ({ label, onFileSelect }: Props) => {
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const selectedFile = files[0];

      // Only allow PDF files
      if (selectedFile.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        event.target.value = "";
        return;
      }

      setFileName(selectedFile.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFile(e.target.result as string);
          if (onFileSelect) onFileSelect(selectedFile);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileName("");
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block mb-1 text-base font-medium text-gray-200 dark:text-gray-300">
        {label}
      </label>

      {/* Upload Box */}
      <label className="flex justify-center w-full h-24 px-4 transition bg-light border-2 border-gray-400 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
        <span className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 text-gray-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
            />
          </svg>
          <span className="font-medium text-gray-600">
            Drag your PDF file here or{" "}
            <span className="text-green-200 font-bold">browse</span>
          </span>
        </span>
        <input
          type="file"
          name="file_upload"
          className="hidden"
          accept="application/pdf"
          onChange={handleChange}
        />
      </label>

      {/* Display Selected File */}
      {file && (
        <div className="flex items-center justify-start w-full mt-2 p-3 border border-gray-400 rounded-md relative">
          <span className="ml-4">📄 {fileName}</span>

          {/* Remove File Button */}
          <button
            className="absolute right-0 p-1 m-3 bg-red-400 rounded-full"
            aria-label="remove file"
            onClick={removeFile}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6 text-red-200"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Upload;
