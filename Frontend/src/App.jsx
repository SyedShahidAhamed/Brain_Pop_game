import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Toast from "./components/Toast";
import { APP_NAME } from "./components/Logo";
import { getCurrentUser, logoutUser } from "./utils/authStorage";

const LOGIN_ROUTE = "/login";
const SIGNUP_ROUTE = "/signup";
const GAME_ROUTE = "/";

function App() {
  // Read the saved session once when the app starts.
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const isAuthPage = currentPath === LOGIN_ROUTE || currentPath === SIGNUP_ROUTE;

    // Route protection: logged-out users cannot open the game or dashboard URLs.
    if (!currentUser && !isAuthPage) {
      navigateTo(LOGIN_ROUTE, true);
      return;
    }

    // Logged-in users should go straight to the protected game page.
    if (currentUser && currentPath !== GAME_ROUTE) {
      navigateTo(GAME_ROUTE, true);
    }
  }, [currentUser, currentPath]);

  function navigateTo(path, replace = false) {
    if (replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }

    setCurrentPath(path);
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 2600);
  }

  function handleAuthenticated(user) {
    setCurrentUser(user);
    showToast(`Welcome, ${user.username}!`, "success");
    navigateTo(GAME_ROUTE, true);
  }

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    showToast("Logged out successfully.", "success");
    navigateTo(LOGIN_ROUTE, true);
  }

  function renderPage() {
    // Public auth pages.
    if (!currentUser && currentPath === SIGNUP_ROUTE) {
      return (
        <Signup
          onSignup={handleAuthenticated}
          onNavigate={navigateTo}
          showToast={showToast}
        />
      );
    }

    if (!currentUser) {
      return (
        <Login
          onLogin={handleAuthenticated}
          onNavigate={navigateTo}
          showToast={showToast}
        />
      );
    }

    // Protected page: this renders only after a valid localStorage session exists.
    return (
      <Home
        key={currentUser.email}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="app">
      <Toast message={toast.message} type={toast.type} />
      {renderPage()}
    </div>
  );
}

export default App;
