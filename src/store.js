import { createStore } from "redux";

let reducer = (state, action) => {
  if (action.type === "login-success") {
    return { ...state, isLoggedIn: true, userData: action.user };
  }
  if (action.type === "logout") {
    return { ...state, isLoggedIn: false, userData: {} };
  }
  if (action.type === "search") {
    return { ...state, searchQuery: action.query };
  }
  if (action.type === "start-project") {
    return { ...state, userData: action.newUserData };
  }

  return state;
};

let initialState = { isLoggedIn: false, userData: {}, searchQuery: "" };

let store = createStore(
  reducer,
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
