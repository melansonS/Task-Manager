import { createStore } from "redux";

let reducer = (state, action) => {
  if (action.type === "login-success") {
    return { ...state, isLoggedIn: true };
  }
  if (action.type === "logout") {
    return { ...state, isLoggedIn: false };
  }

  return state;
};

let initialState = { isLoggedIn: false };

let store = createStore(
  reducer,
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
