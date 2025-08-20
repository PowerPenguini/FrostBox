import { IconCircleCheck } from "@tabler/icons-react";

export function VehicleServiceStepper({ steps, currentStep }) {
  return (
    <div className="flex gap-4 font-medium">
      {steps.map((label, index) => (
        <div key={index} className="flex flex-col flex-1 gap-2">
          <StepLine
            status={
              index < currentStep
                ? "done"
                : index === currentStep
                ? "active"
                : "pending"
            }
          />
          <div className="flex items-center gap-2 font-medium">
            {index < currentStep && (
              <IconCircleCheck className="text-green-600" />
            )}
            <div>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepLine({ status }) {
  if (status === "done") {
    return <div className="bg-green-500 rounded-xl w-full h-1" />;
  }

  if (status === "active") {
    return (
      <div className="relative bg-gray-200 rounded w-full h-1 overflow-hidden">
        <div className="absolute inset-0 bg-[length:200%_100%] bg-gradient-to-r from-blue-500 via-blue-200 to-blue-500 rounded animate-[progress_2s_linear_infinite]" />
      </div>
    );
  }

  // pending
  return <div className="bg-gray-200 rounded-xl w-full h-1" />;
}
