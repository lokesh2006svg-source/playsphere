import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, fetchCurrentUser, saveProfile, logoutUser, logoutAllDevices } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("playsphere_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("playsphere_token") || null);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("playsphere_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await fetchCurrentUser();
          if (res.data.success) {
            setUser(res.data.user);
            setProfile(res.data.profile);
            localStorage.setItem("playsphere_user", JSON.stringify(res.data.user));
            if (res.data.profile) {
              localStorage.setItem("playsphere_profile", JSON.stringify(res.data.profile));
            }
          }
        } catch (err) {
          console.warn("Session check failed:", err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const setAuthSession = ({ token: newToken, refreshToken: newRefreshToken, user: newUser, profile: newProfile }) => {
    setToken(newToken);
    setUser(newUser);
    setProfile(newProfile || null);
    localStorage.setItem("playsphere_token", newToken);
    if (newRefreshToken) {
      localStorage.setItem("playsphere_refresh_token", newRefreshToken);
    }
    localStorage.setItem("playsphere_user", JSON.stringify(newUser));
    if (newProfile) {
      localStorage.setItem("playsphere_profile", JSON.stringify(newProfile));
    } else {
      localStorage.removeItem("playsphere_profile");
    }
  };

  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      if (res.data.success) {
        const { token: newToken, refreshToken: newRefreshToken, user: newUser, profile: newProfile } = res.data;
        setAuthSession({ token: newToken, refreshToken: newRefreshToken, user: newUser, profile: newProfile });
        return { success: true, user: newUser, hasCompletedProfile: newUser.hasCompletedProfile };
      }
    } catch (error) {
      const errorData = error.response?.data;
      return {
        success: false,
        requiresVerification: errorData?.requiresVerification || false,
        email: errorData?.email || email,
        devCode: errorData?.devCode || errorData?.devOtp,
        message: errorData?.message || "Login failed. Please check credentials.",
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await registerUser(userData);
      if (res.data.success) {
        const { token: newToken, refreshToken: newRefreshToken, user: newUser, profile: newProfile } = res.data;
        if (newToken && newUser) {
          setAuthSession({ token: newToken, refreshToken: newRefreshToken, user: newUser, profile: newProfile });
        }
        return {
          success: true,
          user: newUser,
          hasCompletedProfile: newUser?.hasCompletedProfile || false,
          message: res.data.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed.",
      };
    }
  };

  const updateProfileData = async (profileData) => {
    try {
      const res = await saveProfile(profileData);
      if (res.data.success) {
        const updatedProfile = res.data.profile;
        const updatedUser = res.data.user || {
          ...user,
          name: profileData.name || user?.name,
          hasCompletedProfile: true,
          city: updatedProfile.city,
        };
        setProfile(updatedProfile);
        setUser(updatedUser);
        localStorage.setItem("playsphere_profile", JSON.stringify(updatedProfile));
        localStorage.setItem("playsphere_user", JSON.stringify(updatedUser));

        return { success: true, profile: updatedProfile, user: updatedUser };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update profile.",
      };
    }
  };

  const updateProfilePhotoState = (photoUrl) => {
    const updatedProfile = profile ? { ...profile, profilePhoto: photoUrl } : { profilePhoto: photoUrl };
    setProfile(updatedProfile);
    localStorage.setItem("playsphere_profile", JSON.stringify(updatedProfile));

    if (user) {
      const updatedUser = { ...user, profilePhoto: photoUrl };
      setUser(updatedUser);
      localStorage.setItem("playsphere_user", JSON.stringify(updatedUser));
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn("Logout API notice:", err.message);
    } finally {
      setUser(null);
      setToken(null);
      setProfile(null);
      localStorage.removeItem("playsphere_token");
      localStorage.removeItem("playsphere_refresh_token");
      localStorage.removeItem("playsphere_user");
      localStorage.removeItem("playsphere_profile");
    }
  };

  const logoutFromAllDevices = async () => {
    try {
      await logoutAllDevices();
    } catch (err) {
      console.warn("Logout all API notice:", err.message);
    } finally {
      setUser(null);
      setToken(null);
      setProfile(null);
      localStorage.removeItem("playsphere_token");
      localStorage.removeItem("playsphere_refresh_token");
      localStorage.removeItem("playsphere_user");
      localStorage.removeItem("playsphere_profile");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        profile,
        loading,
        isAuthenticated: !!token,
        hasCompletedProfile: user?.hasCompletedProfile || false,
        login,
        register,
        setAuthSession,
        logout,
        logoutFromAllDevices,
        updateProfileData,
        updateProfilePhotoState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
