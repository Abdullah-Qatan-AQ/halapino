import { describe, expect, it } from "vitest";
import { getYear, normalizeMedia } from "./tmdb";

describe("TMDB media normalization", () => {
  it("يحوّل بيانات المسلسل إلى نموذج موحد", () => {
    const media = normalizeMedia({
      id: 42,
      name: "مسلسل تجريبي",
      original_name: "Example Series",
      first_air_date: "2026-05-11",
      vote_average: 8.4,
      genre_ids: [18, 10765],
      media_type: "tv",
    });

    expect(media).toMatchObject({
      id: 42,
      mediaType: "tv",
      title: "مسلسل تجريبي",
      releaseDate: "2026-05-11",
      voteAverage: 8.4,
      genreIds: [18, 10765],
    });
  });

  it("يوفر قيماً احتياطية للنصوص والسنوات الناقصة", () => {
    const media = normalizeMedia({ id: 7 });

    expect(media.title).toBe("عنوان غير متاح");
    expect(media.overview).toContain("لا يتوفر ملخص عربي");
    expect(getYear(null)).toBe("—");
    expect(getYear("1999-12-31")).toBe("1999");
  });
});
