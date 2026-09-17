import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { NavigationProvider } from "./context/NavigationContext.jsx";
import { DiagnosticProvider } from "./context/DiagnosticContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <ThemeProvider>
        <NavigationProvider>
          <DiagnosticProvider>
            <App />
          </DiagnosticProvider>
        </NavigationProvider>
      </ThemeProvider>
    </Provider>
  </BrowserRouter>,
);

