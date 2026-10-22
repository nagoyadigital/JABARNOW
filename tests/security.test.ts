import { test } from "node:test";
import assert from "node:assert/strict";
import { jsonLdString } from "@/lib/seo";
import { sniffImageMime } from "@/lib/file-sniff";
import { hit, isBlocked, reset } from "@/lib/rate-limit";

test("jsonLdString tidak bisa menutup tag <script>", () => {
  const out = jsonLdString({ headline: "a</script><img src=x onerror=alert(1)>" });
  assert.ok(!out.includes("</script>"));
  assert.ok(!out.includes("<"));
  assert.equal(JSON.parse(out).headline, "a</script><img src=x onerror=alert(1)>");
});

test("sniffImageMime mengenali gambar dari isi, bukan nama/header", () => {
  assert.equal(sniffImageMime(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(sniffImageMime(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "image/png");
  assert.equal(sniffImageMime(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ")), "image/webp");
  assert.equal(sniffImageMime(new TextEncoder().encode("<svg onload=alert(1)>")), null);
  assert.equal(sniffImageMime(new TextEncoder().encode("<?php system($_GET['c']); ?>")), null);
});

test("rate limit: blokir setelah batas, reset membuka", () => {
  const key = `t:${Math.random()}`;
  for (let i = 0; i < 5; i++) assert.equal(hit(key, 5, 60_000).allowed, true);
  assert.equal(hit(key, 5, 60_000).allowed, false);
  assert.equal(isBlocked(key, 5), true);
  reset(key);
  assert.equal(isBlocked(key, 5), false);
});
