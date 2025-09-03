export const initialState = {
  selectedServices: {},
  currentCard: 0,
  error: "",
  intervalValues: {},
};

export function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_SERVICE":
      return {
        ...state,
        selectedServices: {
          ...state.selectedServices,
          [action.title]: !state.selectedServices[action.title],
        },
      };
    case "SET_CURRENT_CARD":
      return { ...state, currentCard: action.step };
    case "SET_ERROR":
      return { ...state, error: action.value };
    case "SET_INTERVAL_VALUE":
      const { id, field, value } = action.payload;
      return {
        ...state,
        intervalValues: {
          ...state.intervalValues,
          [id]: {
            ...state.intervalValues[id],
            [field]: value,
          },
        },
      };
    default:
      return state;
  }
}
