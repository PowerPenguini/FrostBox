const AREA_LABELS = {
  engine_and_lubrication_system: "Silnik i układ smarowania",
  braking_system: "Układ hamulcowy",
  drivetrain: "Układ napędowy",
  cabin_and_equipment: "Kabina i wyposażenie",
};

export function getAreaLabel(area) {
    return AREA_LABELS[area] || area
}