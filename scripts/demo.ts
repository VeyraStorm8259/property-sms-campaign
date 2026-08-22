import { sendPropertyCampaign } from "../src/property_sms.js";
const result = await sendPropertyCampaign({ maintenance: [{ tenant: "Mina", phone: "+15551234567", request: "leaking tap" }], documents: [{ tenant: "Mina", phone: "+15551234567", document: "insurance" }], inspections: [{ tenant: "Mina", phone: "+15551234567", date: "2026-09-01" }] });
console.log(result);
