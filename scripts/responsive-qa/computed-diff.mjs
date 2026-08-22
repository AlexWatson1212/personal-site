#!/usr/bin/env node
/** Diffs two computed-audit dumps and prints every changed property. */
import fs from "node:fs";
const [a, b] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(a, "utf8")).entries;
const B = JSON.parse(fs.readFileSync(b, "utf8")).entries;
const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
const changes = new Map();
let compared = 0;
for (const k of keys) {
  const ra = A[k] || [], rb = B[k] || [];
  if (ra.length !== rb.length) {
    const key = `${k} :: ELEMENT COUNT ${ra.length} -> ${rb.length}`;
    changes.set(key, (changes.get(key) || 0) + 1);
    continue;
  }
  for (let i = 0; i < ra.length; i++) {
    const x = ra[i], y = rb[i];
    for (const p of Object.keys(x)) {
      if (p === "i") continue;
      compared++;
      if (String(x[p]) !== String(y[p])) {
        const key = `${x.tag}${x.cls ? "." + x.cls.split(" ")[0] : ""} :: ${p} :: ${x[p]} -> ${y[p]}`;
        changes.set(key, (changes.get(key) || 0) + 1);
      }
    }
  }
}
const sorted = [...changes.entries()].sort((m, n) => n[1] - m[1]);
console.log(`compared ${compared} property values across ${keys.length} route/viewport pairs`);
console.log(`${sorted.length} distinct change(s)\n`);
for (const [k, v] of sorted.slice(0, 120)) console.log(`${String(v).padStart(6)}  ${k}`);
if (sorted.length > 120) console.log(`… ${sorted.length - 120} more`);
