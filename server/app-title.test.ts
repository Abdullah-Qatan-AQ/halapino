import { describe, expect, it } from "vitest";

describe("هوية التطبيق", () => {
  it("تستخدم اسم HALAPINO في الإعدادات", () => {
    expect(process.env.VITE_APP_TITLE).toBe("HALAPINO");
  });
});
