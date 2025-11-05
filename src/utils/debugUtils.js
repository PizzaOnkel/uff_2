// Debug-Utility für gezielte Namensanalyse
export function debugIfMissingName(label, name, data) {
  const missing = ["derkleine73", "heinrich der lowe", "lã­nfir 2", "mikl"];
  if (missing.includes((name||"").toLowerCase())) {
    // eslint-disable-next-line no-console
    console.log(`[DEBUG][${label}]`, name, data || "");
  }
}
