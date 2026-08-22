import { describe, expect, it } from "vitest";
import { sourceStatus } from "./contentSources";
import { tmdbGet } from "./tmdb";

describe("مفتاح TMDB المعطّل", () => {
  it("يبقى فارغاً ولا يسمح بطلبات مباشرة، ليفسح المجال لسلسلة الاحتياط القانونية", async () => {
    expect(sourceStatus().primaryConfigured).toBe(false);
    expect(process.env.CATALOG_API_KEY || "").toBe("");
    await expect(tmdbGet("/configuration")).rejects.toThrow("مفتاح مزود الكتالوج غير مهيأ");
  });
});
