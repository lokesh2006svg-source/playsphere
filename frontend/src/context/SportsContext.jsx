import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchSportsList } from "../api";

const SportsContext = createContext();

export const SportsProvider = ({ children }) => {
  const [sports, setSports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groupedSports, setGroupedSports] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSports = async () => {
      try {
        const res = await fetchSportsList();
        if (res.data.success) {
          setSports(res.data.sports || []);
          setCategories(res.data.categories || []);
          setGroupedSports(res.data.grouped || {});
        }
      } catch (err) {
        console.warn("Failed to load sports list:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSports();
  }, []);

  return (
    <SportsContext.Provider
      value={{
        sports,
        categories,
        groupedSports,
        loading,
      }}
    >
      {children}
    </SportsContext.Provider>
  );
};

export const useSports = () => useContext(SportsContext);
export default SportsContext;
