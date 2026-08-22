import { describe, expect, it } from "vitest";
import { toggleFavorite, type FavoriteItem } from "./favorites";

const sample: FavoriteItem = {
  id: 12,
  mediaType: "movie",
  title: "فيلم تجريبي",
  overview: "ملخص",
  posterPath: "/poster.jpg",
  voteAverage: 7.5,
  releaseDate: "2025-01-01",
};

describe("قائمة المفضلة المحلية", () => {
  it("تضيف العمل ثم تزيله بالمفتاح المركب للنوع والمعرف", () => {
    const added = toggleFavorite([], sample);
    const removed = toggleFavorite(added, sample);

    expect(added).toEqual([sample]);
    expect(removed).toEqual([]);
  });
});

