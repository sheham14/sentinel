// src/lib/unit-convert.ts

export const TO_BASE: Record<string, number> = {
  // Weight → grams
  g: 1,
  kg: 1000,
  lbs: 453.592,
  oz: 28.3495,
  // Volume → ml
  ml: 1,
  L: 1000,
  "fl oz": 29.5735,
};

export type UnitType = "count" | "weight" | "volume";

export function isBulkProduct(unitSize: string | null | undefined): boolean {
  return unitSize?.toLowerCase().includes("per") ?? false;
}

export function getUnitType(unit: string): UnitType {
  if (["each", "pack"].includes(unit)) return "count";
  if (["g", "kg", "lbs", "oz"].includes(unit)) return "weight";
  if (["ml", "L", "fl oz"].includes(unit)) return "volume";
  return "count";
}

export function getMeasureType(
  unitMeasure: string | null | undefined,
): UnitType {
  if (!unitMeasure) return "count";
  if (["g", "kg", "oz", "lbs"].includes(unitMeasure)) return "weight";
  if (["ml", "L", "fl_oz"].includes(unitMeasure)) return "volume";
  return "count";
}

export const UNIT_GROUPS = {
  count: ["each", "pack"],
  weight: ["g", "kg", "lbs", "oz"],
  volume: ["ml", "L", "fl oz"],
};

export function getAllowedUnits(
  unitMeasure: string | null | undefined,
  unitSize: string | null | undefined,
): string[] {
  // Packaged product — no "per" in unitSize → count only
  if (!isBulkProduct(unitSize)) return UNIT_GROUPS.count;

  // Bulk — derive from unitMeasure
  const type = getMeasureType(unitMeasure);
  if (type === "weight") return UNIT_GROUPS.weight;
  if (type === "volume") return UNIT_GROUPS.volume;
  // Fallback for bulk with unknown measure — show weight as default
  return UNIT_GROUPS.weight;
}

/**
 * Calculate the effective price for a given quantity and unit.
 *
 * Packaged products (no "per" in unitSize): price × quantity
 * Bulk products ("per" in unitSize): convert requested amount to base units,
 * divide by package base units, multiply by package price
 */
export function calculateEffectivePrice(
  packagePrice: number,
  packageQuantity: number | null,
  packageMeasure: string | null,
  packageUnitSize: string | null,
  requestedQty: number,
  requestedUnit: string,
): number | null {
  // Packaged — simple multiplication
  if (!isBulkProduct(packageUnitSize)) {
    return packagePrice * requestedQty;
  }

  const measureType = getMeasureType(packageMeasure);
  const requestedType = getUnitType(requestedUnit);

  // Mismatched or count units — fall back to simple multiplication
  if (
    measureType === "count" ||
    requestedType === "count" ||
    measureType !== requestedType
  ) {
    return packagePrice * requestedQty;
  }

  // Need packageQuantity to do unit math
  if (!packageQuantity || packageQuantity === 0) {
    return packagePrice * requestedQty;
  }

  const packageBaseUnits = packageQuantity * (TO_BASE[packageMeasure!] ?? 1);
  const requestedBaseUnits = requestedQty * (TO_BASE[requestedUnit] ?? 1);

  return (requestedBaseUnits / packageBaseUnits) * packagePrice;
}
