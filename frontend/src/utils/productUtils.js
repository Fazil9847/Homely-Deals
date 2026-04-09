export const WOOD_TYPE_OPTIONS = ["Teak", "Aquashia", "Mahagani", "Other"];

export const normalizeWoodTypes = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const formatWoodTypes = (value) => {
  const woodTypes = normalizeWoodTypes(value);
  return woodTypes.length > 0 ? woodTypes.join(", ") : "Not specified";
};

