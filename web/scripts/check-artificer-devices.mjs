import {
  addDevices,
  deviceDamage,
  normalizeDevices,
  removeDevice,
  triggerDevices,
  upgradeDevices,
  withDevices,
} from "../src/artificerDevices.js";

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const legacy = normalizeDevices({ devices: 2 });
expect(legacy.length === 2 && legacy.every((device) => device.type === "thunder"), "旧存档机关数量必须迁移为可执行雷枢阵列");

const deployed = addDevices({ devices: 0, deviceTypes: [] }, [
  { type: "copper", power: 2 },
  { type: "thunder", power: 6 },
]);
expect(deployed.devices === 2 && deployed.deviceTypes[0].type === "copper", "部署必须保留机关类型与总数");
expect(deviceDamage(deployed.deviceTypes[0], 6) === 2, "铜雀伤害不得随机巧成长");
expect(deviceDamage(deployed.deviceTypes[1], 6) === 12, "雷枢应每 2 点机巧增加 2 点伤害");
expect(triggerDevices(deployed.deviceTypes, 6) === 14, "混合阵列触发必须逐个按类型结算");

const upgraded = upgradeDevices(deployed.deviceTypes);
expect(triggerDevices(upgraded, 6, 2) === 36, "真解天工开物必须额外触发并永久升级机关");

const removed = removeDevice(withDevices({}, deployed.deviceTypes));
expect(removed.removed?.type === "copper" && removed.state.devices === 1, "拆解回收必须真实移除一个机关");

if (failures.length) {
  console.error(`Artificer device check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Artificer device check passed: typed devices migrate, trigger, upgrade, and dismantle correctly.");
