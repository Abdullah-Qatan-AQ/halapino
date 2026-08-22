import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("مكتبة الملكية العامة", () => {
  it("تعيد أعمالاً بعلامة ملكية عامة بعد ترشيح النتائج الحساسة", async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => new Response(JSON.stringify({
      response: {
        docs: [
          { identifier: "safe-film", title: "عمل آمن", year: "1940", creator: "مؤلف", description: "وصف مناسب", licenseurl: "https://creativecommons.org/publicdomain/mark/1.0/" },
          { identifier: "blocked-film", title: "Bloody Movie", description: "محتوى غير مناسب", licenseurl: "https://creativecommons.org/publicdomain/mark/1.0/" },
          { identifier: "unlicensed-film", title: "عمل آخر", description: "وصف مناسب", licenseurl: "https://creativecommons.org/licenses/by/4.0/" },
        ],
      },
    }));

    try {
      const caller = appRouter.createCaller({} as never);
      const results = await caller.publicDomain.list();

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({ identifier: "safe-film", title: "عمل آمن" });
      expect(results.every((item) => item.licenseUrl.toLowerCase().includes("publicdomain"))).toBe(true);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
