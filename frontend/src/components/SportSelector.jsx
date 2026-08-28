import React from "react";
import { useSports } from "../context/SportsContext";

const SportSelector = ({
  value,
  onChange,
  name = "sport",
  id = "sport-selector",
  includeAll = false,
  allLabel = "All Sports",
  className = "",
  required = false,
}) => {
  const { categories, groupedSports, sports, loading } = useSports();

  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-court-900 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all cursor-pointer ${className}`}
      >
        {includeAll && <option value="All">{allLabel}</option>}

        {categories && categories.length > 0
          ? categories.map((cat) => (
              <optgroup
                key={cat}
                label={`─── ${cat.toUpperCase()} ───`}
                className="bg-court-950 text-gold font-bold"
              >
                {(groupedSports[cat] || []).map((sport) => (
                  <option
                    key={sport.name}
                    value={sport.name}
                    className="bg-court-900 text-[#F5F0E6] font-normal py-1"
                  >
                    {sport.icon ? `${sport.icon} ` : ""}
                    {sport.name}
                  </option>
                ))}
              </optgroup>
            ))
          : (sports || []).map((sport) => (
              <option key={sport.name} value={sport.name} className="bg-court-900 text-[#F5F0E6]">
                {sport.icon ? `${sport.icon} ` : ""}
                {sport.name}
              </option>
            ))}
      </select>
    </div>
  );
};

export default SportSelector;
