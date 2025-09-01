export const initialState = {
  selectedServices: {},
  costs: {},
  serviceDate: null,
  serviceMileage: 0,
  editingCostRow: null,
  originalCostData: null,
  error: "",
};

export function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_SERVICE": {
      const updatedServices = {
        ...state.selectedServices,
        [action.title]: !state.selectedServices[action.title],
      };
      const updatedCosts = updatedServices[action.title]
        ? state.costs
        : Object.fromEntries(
            Object.entries(state.costs).filter(([k]) => k !== action.title)
          );
      return {
        ...state,
        selectedServices: updatedServices,
        costs: updatedCosts,
      };
    }
    
    case "SET_DATE": {
      const error = action.value ? "" : "Należy podać datę wykonania serwisu.";
      return { ...state, serviceDate: action.value, error };
    }

    case "SET_MILEAGE": {
      const mileageValue = Number(action.value);
      let error = "";
      if (!mileageValue || mileageValue <= 0) {
        error = "Przebieg pojazdu musi być większy od zera.";
      }
      return { ...state, serviceMileage: action.value, error };
    }

    case "ADD_COST": {
      const newIndex = (state.costs[action.serviceId]?.length || 0) + 1;
      const updatedCosts = {
        ...state.costs,
        [action.serviceId]: [
          ...(state.costs[action.serviceId] || []),
          {
            label: `${action.serviceTitle} #${newIndex}`,
            value: "",
            vat: "23",
            quantity: "1",
            currency: "PLN",
            type: "material",
          },
        ],
      };
      return {
        ...state,
        costs: updatedCosts,
        editingCostRow: `${action.serviceId}-${newIndex - 1}`,
        originalCostData: null,
      };
    }
    case "UPDATE_COST": {
      const updated = [...(state.costs[action.serviceId] || [])];
      updated[action.index][action.field] = action.value;
      return {
        ...state,
        costs: { ...state.costs, [action.serviceId]: updated },
      };
    }
    case "START_EDIT_COST": {
      const currentCost = state.costs[action.serviceId][action.index];
      return {
        ...state,
        editingCostRow: `${action.serviceId}-${action.index}`,
        originalCostData: { ...currentCost },
      };
    }

    case "FINALIZE_COST": {
      const updated = [...(state.costs[action.serviceId] || [])];
      const costRowIndex = updated.findIndex(
        (_, idx) => `${action.serviceId}-${idx}` === state.editingCostRow
      );

      if (costRowIndex === -1) return state;

      const costRow = updated[costRowIndex];

      if (!costRow.label.trim()) {
        return { ...state, error: "Należy podać tytuł kosztu." };
      }

      if (!costRow.value || isNaN(Number(costRow.value))) {
        return { ...state, error: "Wartość kosztu musi być większa od zera." };
      }

      if (Number(costRow.vat) < 0 || isNaN(Number(costRow.vat))) {
        return { ...state, error: "VAT nie może przyjmować wartości ujemnej." };
      }

      if (
        !costRow.quantity ||
        Number(costRow.quantity) <= 0 ||
        isNaN(Number(costRow.quantity))
      ) {
        return { ...state, error: "Ilość musi być większa od zera." };
      }

      return {
        ...state,
        costs: { ...state.costs, [action.serviceId]: updated },
        editingCostRow: null,
        originalCostData: null,
        error: "",
      };
    }

    case "CANCEL_EDIT": {
      const updated = [...(state.costs[action.serviceId] || [])];

      if (state.originalCostData === null) {
        updated.splice(action.index, 1);
      } else {
        updated[action.index] = { ...state.originalCostData };
      }

      return {
        ...state,
        costs: { ...state.costs, [action.serviceId]: updated },
        editingCostRow: null,
        originalCostData: null,
      };
    }

    case "DELETE_COST": {
      const updated = [...(state.costs[action.serviceId] || [])];
      updated.splice(action.index, 1);
      return {
        ...state,
        costs: { ...state.costs, [action.serviceId]: updated },
        editingCostRow: null,
        originalCostData: null,
      };
    }

    case "SET_ERROR":
      return { ...state, error: action.value };

    default:
      return state;
  }
}
