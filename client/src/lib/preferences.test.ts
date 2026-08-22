import { describe, expect, it } from "vitest";
import { parsePreferences, serializePreferences } from "./preferences";

describe("تفضيلات واجهة HALAPINO", () => {
  it("تستعيد اللغة والثيم الصحيحين وتحمي من القيم غير الصالحة", () => {
    expect(parsePreferences('{"language":"en","theme":"ocean"}')).toEqual({ language: "en", theme: "ocean" });
    expect(parsePreferences('{"language":"unknown","theme":"wrong"}')).toEqual({ language: "ar", theme: "gold" });
    expect(parsePreferences("invalid")).toEqual({ language: "ar", theme: "gold" });
    expect(serializePreferences({ language: "ar", theme: "plum" })).toBe('{"language":"ar","theme":"plum"}');
  });
});

