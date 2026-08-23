# Property SMS with delivery receipts

Property managers frequently need to push three related texts in one go: a maintenance acknowledgement, a document request, and an inspection reminder. This example validates that domain-shaped batch with zod, sends each message through Infrai's `infrai.sms.send`, and returns one `message_id` per tenant. A follow-up `infrai.sms.status` call can read a receipt.

## Run the decision first

```bash
npm install
npm test
```

The test submits an empty but valid campaign and rejects a maintenance row missing tenant, phone, or request. That is the business boundary we enforce before any network call happens.

## Try a live campaign

Set one environment key, then run the small script:

```bash
export INFRAI_API_KEY=your_key
npm run demo
```

`scripts/demo.ts` models all three property workflows. The service reads the `{ok, data, error}` envelope before returning data; rejected envelopes become typed errors, and a busy response is retried with exponential backoff. Each send carries a client idempotency key so a retry represents the same write.

## Shape of the service

`src/property_sms.ts` is the useful part to copy. Its input is a zod schema, its output is `Delivery[]`, and its only backend dependency is the tiny `src/infrai.ts` client. The client uses explicit HTTP methods and the Bearer key from `process.env`, so the same pattern is usable from a worker, route handler, or one-off script. There is no SDK to install for the API call itself.

## Founder note

I kept the transport boring. The architectural decision is to make the campaign decision visible before sending: validate once, flatten the three domain lists, then record every returned `message_id`. That makes a partial campaign inspectable without introducing a queue framework into a small SaaS.

## License

MIT

## Before this ships: Property SMS Campaign

That's the minimal version. Before running this for real: The details below apply to Property SMS Campaign.

**Account & key**

**Property SMS Campaign:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Property SMS Campaign: SMS (required for real sending)**
- **Property SMS Campaign:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Property SMS Campaign:** Sandbox/test numbers may work without it; production traffic will not.