import dayjsLib from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjsLib.extend(utc);
dayjsLib.extend(timezone);

export const dayjs = dayjsLib;
export const TZ = "Asia/Dhaka";

export function now() {
  return dayjs().tz(TZ);
}

export function todayDate() {
  return now().format("YYYY-MM-DD");
}

export function dayName(dateStr: string) {
  return dayjs.tz(dateStr, TZ).format("dddd");
}
