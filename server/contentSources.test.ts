import { afterEach, describe, expect, it, vi } from "vitest";
import { getLegalFallbackCatalog, sourceStatus } from "./contentSources";

describe("سلسلة المصادر القانونية", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("تتخطى مزود الكتالوج غير المهيأ وتعيد نتيجة ملكية عامة من Internet Archive", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      response: {
        docs: [{ identifier: "safe-archive-film", title: "Safe Archive Film", year: 1940, creator: "Archive", description: "A suitable public-domain film", licenseurl: "https://creativecommons.org/publicdomain/mark/1.0/" }],
      },
    }))));

    const items = await getLegalFallbackCatalog();
    expect(sourceStatus().primaryConfigured).toBe(false);
    expect(items[0]).toMatchObject({ sourceId: "archive", sourceItemId: "safe-archive-film", providerName: "Internet Archive" });
    expect(items[0]?.playableUrl).toContain("archive.org/embed/");
  });

  it("تنتقل إلى Wikimedia Commons عند تعذر Internet Archive", async () => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn()
      .mockRejectedValueOnce(new Error("Archive unavailable"))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        query: {
          pages: {
            1: {
              title: "File:Open_film.webm",
              imageinfo: [{ url: "https://upload.wikimedia.org/example/Open_film.webm", thumburl: "https://upload.wikimedia.org/example/cover.jpg", descriptionurl: "https://commons.wikimedia.org/wiki/File:Open_film.webm", extmetadata: { LicenseUrl: { value: "https://creativecommons.org/publicdomain/zero/1.0/" } } }],
            },
          },
        },
      }))));

    const { getLegalFallbackCatalog: getThirdSourceCatalog } = await import("./contentSources");
    const items = await getThirdSourceCatalog();

    expect(items[0]).toMatchObject({ sourceId: "wikimedia", providerName: "Wikimedia Commons" });
    expect(items[0]?.playableUrl).toContain("upload.wikimedia.org");
  });
});
