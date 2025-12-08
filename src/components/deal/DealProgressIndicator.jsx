import React from "react";

const DealProgressIndicator = ({ status, showLabel = true, size = "md" }) => {
  const stages = ["Contacted", "Ongoing", "Success/Fail", "Closed"];
  
  const getStageIndex = (currentStatus) => {
    if (currentStatus === "Contacted") return 0;
    if (currentStatus === "Ongoing") return 1;
    if (currentStatus === "Success" || currentStatus === "Fail") return 2;
    if (currentStatus === "Closed") return 3;
    return 0;
  };

  const currentIndex = getStageIndex(status);
  
  const sizeClasses = {
    sm: { dot: "w-2 h-2", line: "h-0.5", text: "text-xs" },
    md: { dot: "w-3 h-3", line: "h-1", text: "text-sm" },
    lg: { dot: "w-4 h-4", line: "h-1.5", text: "text-base" },
  };

  const sizes = sizeClasses[size];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center">
              <div
                className={`${sizes.dot} rounded-full ${
                  index <= currentIndex
                    ? index === currentIndex
                      ? "bg-blue-500 ring-2 ring-blue-200"
                      : "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              {showLabel && (
                <span
                  className={`mt-1 ${sizes.text} ${
                    index <= currentIndex ? "text-gray-700 font-medium" : "text-gray-400"
                  }`}
                >
                  {stage}
                </span>
              )}
            </div>
            {index < stages.length - 1 && (
              <div
                className={`flex-1 mx-2 ${sizes.line} rounded ${
                  index < currentIndex ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DealProgressIndicator;
