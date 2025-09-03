import { useState, useReducer } from "react";
import { useVehicleViewer } from "@/state/vehicle-viewer-context";
import { useAuthContext } from "@/state/auth-context";
import { VehicleServiceStepper } from "@/components/vehicle-viewer/vehicle-service-stepper";
import { SuccessScreen } from "@/components/vehicle-viewer/vehicle-success-screen";
import { Button } from "@/components/ui/button";
import {ParametersStep} from "@/components/vehicle-viewer/interval-wizard/parameters-step"
import { ServiceSelectionStep } from "@/components/vehicle-viewer/interval-wizard";
import { SummaryStep } from "@/components/vehicle-viewer/interval-wizard";
import {
  initialState,
  reducer,
} from "@/components/vehicle-viewer/interval-wizard/reducer";

import { motion, AnimatePresence } from "framer-motion";

export function VehicleIntervalWizard({ vehicleId, category }) {
  const { token } = useAuthContext();
  const steps = [
    "Zdarzenia interwałowe",
    "Parametry interwałów",
    "Podsumowanie",
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSuccess, setIsSuccess] = useState(false);
  const { pop } = useVehicleViewer();

  async function nextStep() {
    if (currentStep === 0) {
      const selectedCount = Object.values(state.selectedServices).filter(
        Boolean
      ).length;
      if (selectedCount === 0) {
        dispatch({
          type: "SET_ERROR",
          value: "Należy wybrać przynajmniej jedną usługę.",
        });
        return;
      }
    }

    dispatch({ type: "SET_ERROR", value: "" });
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function prevStep() {
    dispatch({ type: "SET_ERROR", value: "" });
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  if (isSuccess) {
    return <SuccessScreen />;
  }

  return (
    <div className="flex flex-col flex-1 gap-4" style={{ minHeight: 0 }}>
      <div className="p-4">
        <VehicleServiceStepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="flex-1 min-h-0">
        <div className="px-4 w-full h-full overflow-x-hidden overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key={1}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.1 }}
              >
                <ServiceSelectionStep
                  selectedServices={state.selectedServices}
                  error={state.error}
                  category={category}
                  toggleService={(title) =>
                    dispatch({ type: "TOGGLE_SERVICE", title })
                  }
                />
              </motion.div>
            )}
            {currentStep === 1 && (
              <motion.div
                key={2}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.1 }}
                className="w-full h-full"
              >
                <ParametersStep
                  currentCard={state.currentCard || 0}
                  state={state}
                  setCurrentCard={(step) =>
                    dispatch({ type: "SET_CURRENT_CARD", step })
                  }
                  setMileage={(id, value) =>
                    dispatch({
                      type: "SET_INTERVAL_VALUE",
                      payload: { id, field: "mileage", value },
                    })
                  }
                  setDate={(id, value) =>
                    dispatch({
                      type: "SET_INTERVAL_VALUE",
                      payload: { id, field: "date", value },
                    })
                  }
                  setKm={(id, value) =>
                    dispatch({
                      type: "SET_INTERVAL_VALUE",
                      payload: { id, field: "km", value },
                    })
                  }
                  setTime={(id, value) =>
                    dispatch({
                      type: "SET_INTERVAL_VALUE",
                      payload: { id, field: "time", value },
                    })
                  }
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key={3}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.1 }}
                className="w-full h-full"
              >
                <SummaryStep state={state}/>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-between gap-2 mt-2 p-4">
        <Button variant="outline" onClick={pop}>
          Anuluj
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 1 && state.currentCard > 0) {
                dispatch({
                  type: "SET_CURRENT_CARD",
                  step: state.currentCard - 1,
                });
              } else {
                prevStep();
              }
            }}
            disabled={
              currentStep === 0 &&
              (!state.currentCard || state.currentCard === 0)
            }
          >
            Wstecz
          </Button>
          <Button
            onClick={() => {
              if (
                currentStep === 1 &&
                state.currentCard <
                  Object.values(state.selectedServices).filter(Boolean).length -
                    1
              ) {
                dispatch({
                  type: "SET_CURRENT_CARD",
                  step: state.currentCard + 1,
                });
              } else {
                nextStep();
              }
            }}
          >
            {currentStep === steps.length - 1 ? "Zapisz" : "Dalej"}
          </Button>
        </div>
      </div>
    </div>
  );
}
