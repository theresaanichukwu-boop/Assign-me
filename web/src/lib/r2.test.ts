import { describe, expect, it } from "vitest";
import { ALLOWED_MIME, MAX_FILE_BYTES, r2Key } from "./r2";

describe("r2Key", () => {
  it("builds the users/{u}/works/{w}/{f}-{name} pattern", () => {
    expect(r2Key("u1", "w2", "f3", "guide.pdf")).toBe("users/u1/works/w2/f3-guide.pdf");
  });
  it("sanitizes unsafe filename characters", () => {
    expect(r2Key("u", "w", "f", "a/b\\c:d?.pdf")).toBe("users/u/works/w/f-a_b_c_d_.pdf");
  });
});

describe("upload limits", () => {
  it("caps at 25 MB and allows PDF/DOCX/images", () => {
    expect(MAX_FILE_BYTES).toBe(25 * 1024 * 1024);
    expect(ALLOWED_MIME.has("application/pdf")).toBe(true);
    expect(ALLOWED_MIME.has("application/x-msdownload")).toBe(false);
  });
});
