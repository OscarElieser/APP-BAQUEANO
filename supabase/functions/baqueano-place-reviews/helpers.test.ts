// Pruebas de utilidades puras de baqueano-place-reviews (sin red ni base de datos).
// deno test supabase/functions/baqueano-place-reviews/helpers.test.ts
import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { assertPublicSafe, cleanTargetKey, cleanText, HttpError, publicName, spamFlags } from "./helpers.ts";

Deno.test("cleanText normaliza y limita", () => {
  assertEquals(cleanText("  Hola​   mundo \n\n\n\nbien  ", 100, { label: "x", code: "x" }), "Hola mundo \n\nbien");
  assertEquals(cleanText("", 100, { label: "x", code: "x" }), null);
  assertThrows(() => cleanText("corto", 100, { min: 10, label: "x", code: "x" }), HttpError);
  assertThrows(() => cleanText("a".repeat(101), 100, { label: "x", code: "x" }), HttpError);
  assertThrows(() => cleanText(42, 100, { label: "x", code: "x" }), HttpError);
});

Deno.test("assertPublicSafe bloquea enlaces, correos, teléfonos y spam", () => {
  for (const bad of ["mirá https://x.com", "entrá a www.ejemplo.org", "escribime a ana@correo.com", "llamá al +505 8888 7777", "buenoooooooooooo"]) {
    assertThrows(() => assertPublicSafe(bad, "el comentario", "comment"), HttpError, undefined, bad);
  }
  assertPublicSafe("El sendero estuvo duro pero valió la pena; llevá 2 litros de agua.", "el comentario", "comment");
});

Deno.test("una opinión crítica no se marca por ser crítica", () => {
  assertEquals(spamFlags("El acceso estaba cerrado y nadie nos avisó. Muy mala experiencia."), []);
  assertEquals(spamFlags("Esto es una mierda"), ["lenguaje"]);
  assertEquals(spamFlags("NO VAYAN NUNCA A ESTE LUGAR HORRIBLE"), ["mayusculas"]);
});

Deno.test("cleanTargetKey solo acepta destinos válidos", () => {
  assertEquals(cleanTargetKey("place:isletas-de-granada"), "place:isletas-de-granada");
  assertEquals(cleanTargetKey("destination:ometepe"), "destination:ometepe");
  for (const bad of ["isletas", "place:", "user:abc", "place:../x", "place:a b", "place:" + "a".repeat(130)]) {
    assertThrows(() => cleanTargetKey(bad), HttpError, undefined, bad);
  }
});

Deno.test("publicName respeta la elección de privacidad", () => {
  assertEquals(publicName("Ana María Pérez", "full"), "Ana María Pérez");
  assertEquals(publicName("Ana María Pérez", "short"), "Ana P.");
  assertEquals(publicName("Ana", "short"), "Ana");
  assertEquals(publicName("   ", "full"), null);
});
