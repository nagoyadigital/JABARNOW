import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalUrl, isFetchableUrl, titleKey } from "@/lib/ai/normalize";

test("canonicalUrl membuang pelacak, fragment, trailing slash", () => {
  assert.equal(canonicalUrl("https://EX.com/a/1/?utm_source=x&id=5&fbclid=1#y"), "https://ex.com/a/1?id=5");
});

test("titleKey: urutan kata & tanda baca tidak berpengaruh", () => {
  assert.equal(
    titleKey("Banjir Rendam Bandung, Warga Mengungsi!"),
    titleKey("Warga Mengungsi: Banjir Rendam Bandung"),
  );
});

test("isFetchableUrl menolak skema & host lokal/privat", () => {
  for (const bad of ["file:///etc/passwd", "http://127.0.0.1/x", "http://10.0.0.5", "http://192.168.1.1", "http://localhost:3000", "http://169.254.169.254/latest"]) {
    assert.equal(isFetchableUrl(bad), false, bad);
  }
  assert.equal(isFetchableUrl("https://jabar.antaranews.com/rss"), true);
});
