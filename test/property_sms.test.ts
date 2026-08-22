import assert from "node:assert/strict";
import { campaignRequest } from "../src/property_sms.js";
assert.equal(campaignRequest.safeParse({ maintenance: [], documents: [], inspections: [] }).success, true);
assert.equal(campaignRequest.safeParse({ maintenance: [{ tenant: "", phone: "1", request: "" }], documents: [], inspections: [] }).success, false);
console.log("campaign boundary test passed");
