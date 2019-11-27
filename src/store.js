import { createStore } from "redux";

let reducer = (state, action) => {
  if (action.type === "login-success") {
    return { ...state, isLoggedIn: true, userData: action.user };
  }
  if (action.type === "logout") {
    return { ...state, isLoggedIn: false, userData: {} };
  }

  return state;
};

let initialState = { isLoggedIn: false, userData: {} };

let store = createStore(
  reducer,
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
