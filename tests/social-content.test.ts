import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildRuleSlides,
  clipWords,
  parseSlides,
  stripDateline,
  tiptapParagraphs,
  toHashtag,
  uniqueHashtags,
} from "@/lib/social/content";

const p = (t: string) => ({ type: "paragraph", content: [{ type: "text", text: t }] });

test("tiptapParagraphs mengambil teks paragraf & list, melewati tabel", () => {
  const doc = {
    type: "doc",
    content: [p("Satu."), { type: "table", content: [p("abaikan")] }, { type: "bulletList", content: [{ type: "listItem", content: [p("Dua.")] }] }],
  };
  assert.deepEqual(tiptapParagraphs(doc), ["Satu.", "Dua."]);
});

test("stripDateline & clipWords", () => {
  assert.equal(stripDateline("BANDUNG, JabarNow! — Hujan deras."), "Hujan deras.");
  assert.equal(clipWords("satu dua tiga empat lima", 12), "satu dua…");
});

test("hashtag unik & rapi", () => {
  assert.equal(toHashtag("Kota Bandung"), "#KotaBandung");
  assert.deepEqual(uniqueHashtags(["#JabarNow", "jabarnow", "Kota Bandung", null]), ["#JabarNow", "#KotaBandung"]);
});

test("buildRuleSlides: cover + poin + CTA, poin terlalu pendek dilewati", () => {
  const slides = buildRuleSlides({
    headline: "Judul",
    paragraphs: [
      "BANDUNG, JabarNow! — Hujan deras sejak Kamis sore membuat Sungai Citarum meluap ke permukiman warga.",
      "Pendek.",
      "BPBD mencatat 1.240 warga mengungsi ke balai desa dan masjid terdekat di Baleendah.",
    ],
    points: 3,
    ctaTitle: "CTA",
    ctaText: "Teks",
  });
  assert.deepEqual(slides.map((s) => s.kind), ["cover", "point", "point", "cta"]);
  assert.ok(!slides[1].body?.startsWith("BANDUNG"));
});

test("parseSlides aman terhadap data rusak", () => {
  assert.deepEqual(parseSlides("bukan array"), []);
  assert.equal(parseSlides([{ kind: "cover", title: "x" }]).length, 1);
});
