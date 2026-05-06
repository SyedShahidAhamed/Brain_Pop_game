import { useCallback, useEffect, useRef, useState } from "react";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Toast from "./components/Toast";
import { APP_NAME } from "./components/Logo";
import { getCurrentUser, logoutUser } from "./utils/authStorage";
import {
  initializeNotifications,
  registerMessagingServiceWorker,
  stopActiveSessionReminders,
  subscribeToForegroundMessages
} from "./utils/notificationMessaging";

const LOGIN_ROUTE = "/login";
const SIGNUP_ROUTE = "/signup";
const LEADERBOARD_ROUTE = "/leaderboard";
const PROFILE_ROUTE = "/profile";
const GAME_ROUTE = "/";

function App() {
  // Read the saved session once when the app starts.
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const toastTimerRef = useRef(null);

  const navigateTo = useCallback((path, replace = false) => {
    if (replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }

    setCurrentPath(path);
  }, []);

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ message: "", type: "success" });
      toastTimerRef.current = null;
    }, 2600);
  }, []);

  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  useEffect(() => {
    registerMessagingServiceWorker().catch((error) => {
      console.error("[BrainByte Notifications] Startup service worker registration failed.", error);
    });
  }, []);

  useEffect(() => {
    if (!currentUser?.email) return undefined;

    initializeNotifications(currentUser.email).catch((error) => {
      console.error("[BrainByte Notifications] Notification initialization failed.", error);
    });

    let unsubscribe = () => {};
    let isMounted = true;

    subscribeToForegroundMessages(({ title, body }) => {
      showToast(`${title} ${body}`, "success");
    }).then((listener) => {
      if (isMounted) {
        unsubscribe = listener;
      } else {
        listener();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
      stopActiveSessionReminders();
    };
  }, [currentUser?.email, showToast]);

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
    if (
      currentUser
      && currentPath !== GAME_ROUTE
      && currentPath !== LEADERBOARD_ROUTE
      && currentPath !== PROFILE_ROUTE
    ) {
      navigateTo(GAME_ROUTE, true);
    }
  }, [currentUser, currentPath, navigateTo]);

  useEffect(() => () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
  }, []);

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

    if (currentPath === LEADERBOARD_ROUTE) {
      return (
        <Leaderboard
          currentUser={currentUser}
          onBack={() => navigateTo(GAME_ROUTE)}
          showToast={showToast}
        />
      );
    }

    if (currentPath === PROFILE_ROUTE) {
      return (
        <Profile
          currentUser={currentUser}
          onBack={() => navigateTo(GAME_ROUTE)}
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
        onNavigate={navigateTo}
        showToast={showToast}
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
