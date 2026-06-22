export const DEVICE_LIMIT = 8;

export function normalizeDevices(state = {}) {
  if (Array.isArray(state.deviceTypes) && state.deviceTypes.length) {
    return state.deviceTypes.slice(0, DEVICE_LIMIT).map((device) => (
      typeof device === "string"
        ? { type: device, power: device === "thunder" ? 6 : 2 }
        : { type: device.type, power: device.power ?? (device.type === "thunder" ? 6 : 2) }
    ));
  }
  return Array.from({ length: Math.min(DEVICE_LIMIT, state.devices || 0) }, () => ({ type: "thunder", power: 6 }));
}

export function withDevices(state, devices) {
  const deviceTypes = devices.slice(0, DEVICE_LIMIT);
  return { ...state, devices: deviceTypes.length, deviceTypes };
}

export function addDevices(state, additions) {
  return withDevices(state, [...normalizeDevices(state), ...additions]);
}

export function removeDevice(state) {
  const devices = normalizeDevices(state);
  const removed = devices.shift() || null;
  return { state: withDevices(state, devices), removed };
}

export function deviceDamage(device, cunning = 0) {
  if (!device) return 0;
  if (device.type === "copper") return device.power ?? 2;
  return (device.power ?? 6) + Math.floor(Math.max(0, cunning) / 2) * 2;
}

export function triggerDevices(devices, cunning = 0, repeat = 1) {
  return devices.reduce((total, device) => total + deviceDamage(device, cunning), 0) * Math.max(1, repeat);
}

export function upgradeDevices(devices) {
  return devices.map((device) => ({ ...device, power: (device.power ?? (device.type === "thunder" ? 6 : 2)) + 2 }));
}
