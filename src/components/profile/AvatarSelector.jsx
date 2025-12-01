import { useState } from "react";
import { FiX, FiUpload } from "react-icons/fi";
import Button from "../common/Button";
import { getAvatarUrl } from "../../utils/avatarUtils";

const AvatarSelector = ({
  isOpen,
  onClose,
  presets = [],
  onSelectPreset,
  onUpload,
  isSelectingPreset = false,
  isUploading = false,
}) => {
  const [preview, setPreview] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);

      try {
        onUpload?.(file);
      } catch (err) {
        console.error("Avatar upload handler failed", err);
      }
    };
    reader.onerror = () => {
      console.error("Failed to read file for preview");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Update Avatar
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose a preset or upload your own image
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close avatar selector"
          >
            <FiX className="text-lg text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Preset Avatars
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Array.isArray(presets) &&
                presets.map((preset) => {
                  const resolvedUrl = getAvatarUrl(preset) || preset;
                  return (
                    <button
                      key={preset}
                      onClick={() => onSelectPreset(preset)}
                      disabled={isSelectingPreset}
                      className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-sky-400 focus:border-sky-500 focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <img
                        src={resolvedUrl}
                        alt="Preset avatar"
                        className="w-full h-full object-cover bg-gray-100 dark:bg-gray-700"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      {isSelectingPreset && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-medium">
                          Updating...
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Upload From Device
            </h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-4">
                <FiUpload className="text-2xl text-sky-500 dark:text-sky-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your image here, or click to browse
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                PNG, JPG, or SVG up to 2MB
              </p>
              <label className="inline-flex items-center justify-center px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                {isUploading ? "Uploading..." : "Choose File"}
              </label>
              {preview && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Preview
                  </span>
                  <img
                    src={preview}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
