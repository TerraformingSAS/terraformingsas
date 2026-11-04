import assert from "node:assert/strict";
import { test } from "node:test";
import {
  attributionFormFields,
  captureCampaignFromLocation,
  mergeAttribution,
  parseUtmSearch,
} from "./campaign.ts";

test("parsea UTM reales y recorta valores largos", () => {
  const parsed = parseUtmSearch(
    "?utm_source=instagram&utm_medium=paid&utm_campaign=terra-etapa-i&utm_content=anuncio-humedal&other=x",
  );
  assert.equal(parsed.utm_source, "instagram");
  assert.equal(parsed.utm_medium, "paid");
  assert.equal(parsed.utm_campaign, "terra-etapa-i");
  assert.equal(parsed.utm_content, "anuncio-humedal");
  assert.equal(parsed.utm_term, undefined);
});

test("conserva el primer origen y actualiza el último", () => {
  const merged = mergeAttribution(
    { utm_source: "instagram", utm_campaign: "ads-octubre" },
    { utm_source: "whatsapp", utm_campaign: "organic" },
  );
  assert.equal(merged.first.utm_source, "instagram");
  assert.equal(merged.last.utm_source, "whatsapp");
});

test("persiste first-touch en storage y completa campos del formulario", () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
  captureCampaignFromLocation(
    "?utm_source=instagram&utm_medium=paid&utm_campaign=terra&utm_content=c12",
    "/terra",
    storage,
  );
  captureCampaignFromLocation("?utm_source=google", "/terra/estado", storage);
  const second = captureCampaignFromLocation("", "/terra", storage);
  assert.equal(second.first.utm_source, "instagram");
  assert.equal(second.last.utm_source, "google");
  const fields = attributionFormFields(second);
  assert.equal(fields.origen_campana, "terra");
  assert.equal(fields.anuncio, "c12");
  assert.equal(fields.utm_source_last, "google");
});
