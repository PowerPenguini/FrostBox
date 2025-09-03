import { useState, useReducer } from "react";
import { useVehicleViewer } from "@/state/vehicle-viewer-context";
import { useAuthContext } from "@/state/auth-context";
import { VehicleServiceStepper } from "@/components/vehicle-viewer/vehicle-service-stepper";
import { SuccessScreen } from "@/components/vehicle-viewer/vehicle-success-screen";
import { Button } from "@/components/ui/button";
import {
  InfoStep,
  ServiceSelectionStep,
  CostsStep,
  SummaryStep,
} from "@/components/vehicle-viewer/service-wizard";
import {
  initialState,
  reducer,
} from "@/components/vehicle-viewer/service-wizard/reducer";
import { AddVehicleEvents } from "@/api/events";

import { motion, AnimatePresence } from "framer-motion";

function mapStateToApiPayload(state) {
  return Object.entries(state.selectedServices)
    .filter(([_, isSelected]) => isSelected)
    .map(([serviceTitle]) => ({
      event_type: serviceTitle,
      date: state.serviceDate,
      mileage: Number(state.serviceMileage),
      costs: (state.costs[serviceTitle] || []).map((c) => ({
        value: c.value,
        vat_rate: c.vat,
        quantity: c.quantity,
        currency: c.currency,
        country: c.country || "PL",
        category: c.type === "material" ? "service_material" : c.type === "service" ? "service_labour" : "other",
      })),
    }));
}

export function VehicleServiceEventWizard({ vehicleId, category }) {
  const { token } = useAuthContext();
  const steps = [
    "Informacje",
    "Zakres serwisu",
    "Koszty serwisu",
    "Podsumowanie",
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSuccess, setIsSuccess] = useState(false);
  const { pop } = useVehicleViewer();
  async function nextStep() {
    if (currentStep === 0) {
      if (!state.serviceDate) {
        dispatch({
          type: "SET_ERROR",
          value: "Należy podać datę wykonania serwisu.",
        });
        return;
      }
      const selectedDate = new Date(state.serviceDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        dispatch({
          type: "SET_ERROR",
          value: "Data wykonania serwisu nie może być w przyszłości.",
        });
        return;
      }
      if (!state.serviceMileage || Number(state.serviceMileage) <= 0) {
        dispatch({
          type: "SET_ERROR",
          value: "Przebieg pojazdu musi być większy od zera.",
        });
        return;
      }
    }

    if (currentStep === 1) {
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

    if (currentStep === 2 && state.editingCostRow) {
      dispatch({
        type: "SET_ERROR",
        value: "Należy zapisać wszystkie koszty przed przejściem dalej.",
      });
      return;
    }

    if (currentStep === 3) {
      try {
        const payload = mapStateToApiPayload(state);
        await AddVehicleEvents(payload, vehicleId, token);
        setIsSuccess(true);
        return;
      } catch (err) {
        dispatch({ type: "SET_ERROR", value: err.message });
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
                key={0}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.1 }}
              >
                <InfoStep
                  serviceDate={state.serviceDate}
                  setServiceDate={(val) =>
                    dispatch({ type: "SET_DATE", value: val })
                  }
                  serviceMileage={state.serviceMileage}
                  setServiceMileage={(val) =>
                    dispatch({ type: "SET_MILEAGE", value: val })
                  }
                  error={state.error}
                />
              </motion.div>
            )}
            {currentStep === 1 && (
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
            {currentStep === 2 && (
              <motion.div
                key={2}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.1 }}
              >
                <CostsStep
                  selectedServices={state.selectedServices}
                  costs={state.costs}
                  addCost={(serviceId, serviceTitle) =>
                    dispatch({ type: "ADD_COST", serviceTitle, serviceId })
                  }
                  updateCost={(serviceId, index, field, value) =>
                    dispatch({
                      type: "UPDATE_COST",
                      serviceId,
                      index,
                      field,
                      value,
                    })
                  }
                  startEditingCost={(serviceId, index) =>
                    dispatch({ type: "START_EDIT_COST", serviceId, index })
                  }
                  finalizeCost={(serviceId) =>
                    dispatch({ type: "FINALIZE_COST", serviceId })
                  }
                  cancelEdit={(serviceId, index) =>
                    dispatch({ type: "CANCEL_EDIT", serviceId, index })
                  }
                  deleteCost={(serviceId, index) =>
                    dispatch({ type: "DELETE_COST", serviceId, index })
                  }
                  editingCostRow={state.editingCostRow}
                  error={state.error}
                />
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div
                key={3}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.1 }}
              >
                <SummaryStep
                  selectedServices={state.selectedServices}
                  costs={state.costs}
                  serviceDate={state.serviceDate}
                  serviceMileage={state.serviceMileage}
                  error={state.error}
                />
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
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Wstecz
          </Button>
          <Button onClick={nextStep}>
            {currentStep === steps.length - 1 ? "Zapisz" : "Dalej"}
          </Button>
        </div>
      </div>
    </div>
  );
}
