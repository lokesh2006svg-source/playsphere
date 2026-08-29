import React, { useState, useRef, useEffect } from "react";
import { TN_DISTRICTS } from "../constants/tnDistricts";
import { MapPin, ChevronDown, Search, X, Check } from "lucide-react";

/**
 * Reusable & Searchable 38-District Selector for Tamil Nadu
 *
 * @param {Object} props
 * @param {string} props.value - Currently selected district
 * @param {Function} props.onChange - Event or value change handler
 * @param {boolean} [props.includeAll=false] - Whether to include "All Districts" option
 * @param {string} [props.allLabel="All Tamil Nadu"] - Label for the all option
 * @param {string} [props.name="city"] - Input name attribute
 * @param {string} [props.placeholder="Select District..."]
 * @param {string} [props.className=""] - Custom extra styling classes
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.required=false]
 */
const DistrictSelector = ({
  value = "",
  onChange,
  includeAll = false,
  allLabel = "All Tamil Nadu",
  name = "city",
  placeholder = "Select District...",
  className = "",
  disabled = false,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  const filteredDistricts = TN_DISTRICTS.filter((district) =>
    district.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleSelect = (selectedDistrict) => {
    if (onChange) {
      // Simulate standard event object for compatibility with (e) => setFormData(...)
      const syntheticEvent = {
        target: {
          name,
          value: selectedDistrict,
        },
      };
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  const displayLabel = () => {
    if (!value || value === "All" || value === "All Districts") {
      return includeAll ? allLabel : placeholder;
    }
    return value;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Hidden native input for form validation */}
      <input
        type="hidden"
        name={name}
        value={value || ""}
        required={required}
      />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-court-950 border border-court-700 hover:border-gold/40 text-[#F5F0E6] rounded-xl px-3.5 py-2.5 text-xs transition-colors focus:ring-2 focus:ring-gold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen ? "ring-2 ring-gold border-gold" : ""
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
          <span className={`truncate font-medium ${!value ? "text-[#656C7D]" : "text-[#F5F0E6]"}`}>
            {displayLabel()}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#9B9691] shrink-0 transition-transform ${isOpen ? "rotate-180 text-gold" : ""}`} />
      </button>

      {/* Searchable Dropdown Popup */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[220px] bg-court-900 border border-court-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Search Header */}
          <div className="p-2 border-b border-court-750 bg-court-950/80 sticky top-0 z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gold absolute left-3 top-2.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search 38 districts..."
                className="w-full bg-court-900 border border-court-700 text-[#F5F0E6] rounded-lg pl-8 pr-7 py-1.5 text-xs focus:ring-1 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-[#9B9691] hover:text-[#F5F0E6]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* List of Districts */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {includeAll && !searchTerm && (
              <button
                type="button"
                onClick={() => handleSelect("All")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  value === "All" || !value
                    ? "bg-gold/15 text-gold font-bold"
                    : "text-[#F5F0E6] hover:bg-court-800"
                }`}
              >
                <span>{allLabel}</span>
                {(value === "All" || !value) && <Check className="w-3.5 h-3.5 text-gold" />}
              </button>
            )}

            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((district) => {
                const isSelected = value === district;
                return (
                  <button
                    key={district}
                    type="button"
                    onClick={() => handleSelect(district)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-gold/15 text-gold font-bold"
                        : "text-[#F5F0E6] hover:bg-court-800"
                    }`}
                  >
                    <span>{district}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-gold" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-[#9B9691]">
                No districts matching "{searchTerm}"
              </div>
            )}
          </div>

          <div className="px-3 py-1.5 bg-court-950/60 border-t border-court-800 text-[10px] text-[#656C7D] text-center font-medium">
            38 Tamil Nadu Districts
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictSelector;
