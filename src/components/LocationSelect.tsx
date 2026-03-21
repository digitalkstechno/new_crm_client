import { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { api } from "@/utils/axiosInstance";
import { baseUrl } from "../../config";

type Option = { _id: string; name: string };

type Props = {
  countryId: string;
  stateId: string;
  cityId: string;
  countryName: string;
  stateName: string;
  cityName: string;
  onChange: (field: "countryId" | "stateId" | "cityId" | "countryName" | "stateName" | "cityName", value: string) => void;
};

function AutocompleteDropdown({
  label,
  options,
  value,
  displayValue,
  disabled,
  placeholder,
  onSelect,
}: {
  label: string;
  options: Option[];
  value: string;
  displayValue: string;
  disabled?: boolean;
  placeholder: string;
  onSelect: (id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <label className="text-sm text-gray-600">{label}</label>
      <div
        onClick={() => !disabled && setOpen((p) => !p)}
        className={`mt-1 flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition ${
          disabled ? "cursor-not-allowed opacity-50" : "hover:border-gray-300"
        }`}
      >
        <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
          {displayValue || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {displayValue && (
            <X
              className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600"
              onClick={(e) => { e.stopPropagation(); onSelect("", ""); }}
            />
          )}
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-gray-300"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto pb-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-gray-400">No results found</li>
            ) : (
              filtered.map((o) => (
                <li
                  key={o._id}
                  onClick={() => { onSelect(o._id, o.name); setOpen(false); }}
                  className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-50 ${
                    value === o._id ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-700"
                  }`}
                >
                  {o.name}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function LocationSelect({ countryId, stateId, cityId, countryName, stateName, cityName, onChange }: Props) {
  const [countries, setCountries] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);

  useEffect(() => {
    api.get(baseUrl.LOCATION_COUNTRIES).then((r) => setCountries(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!countryId) { setStates([]); setCities([]); return; }
    api.get(baseUrl.LOCATION_STATES(countryId)).then((r) => setStates(r.data.data || [])).catch(() => {});
  }, [countryId]);

  useEffect(() => {
    if (!stateId) { setCities([]); return; }
    api.get(baseUrl.LOCATION_CITIES(stateId)).then((r) => setCities(r.data.data || [])).catch(() => {});
  }, [stateId]);

  const handleCountrySelect = (id: string, name: string) => {
    onChange("countryId", id);
    onChange("countryName", name);
    onChange("stateId", "");
    onChange("stateName", "");
    onChange("cityId", "");
    onChange("cityName", "");
    setStates([]);
    setCities([]);
  };

  const handleStateSelect = (id: string, name: string) => {
    onChange("stateId", id);
    onChange("stateName", name);
    onChange("cityId", "");
    onChange("cityName", "");
    setCities([]);
  };

  const handleCitySelect = (id: string, name: string) => {
    onChange("cityId", id);
    onChange("cityName", name);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <AutocompleteDropdown
        label="Country"
        options={countries}
        value={countryId}
        displayValue={countryName}
        placeholder="Select Country"
        onSelect={handleCountrySelect}
      />
      <AutocompleteDropdown
        label="State"
        options={states}
        value={stateId}
        displayValue={stateName}
        disabled={!countryId}
        placeholder="Select State"
        onSelect={handleStateSelect}
      />
      <AutocompleteDropdown
        label="City"
        options={cities}
        value={cityId}
        displayValue={cityName}
        disabled={!stateId}
        placeholder="Select City"
        onSelect={handleCitySelect}
      />
    </div>
  );
}
