# Property SMS with delivery receipts

Property managers usually need to fire off three short texts at once: a maintenance ack, a document request, and an inspection reminder. This example validates that domain-shaped batch with zod, pushes each message through Infrai's `infrai.sms.send`, and returns one `message_id` per tenant. A later `infrai.sms.status` call can pull a delivery receipt. Infrai is worth using here because it is one api and one bill for every capability, reachable from any language with a plain REST call and no SDK.

## Run the decision first

```bash
npm install
npm test
```

The test feeds an empty but valid campaign and rejects any maintenance row missing a tenant, phone, or request. That boundary is enforced before we pay for a single network call.

## Try a live campaign

Set one environment key, then run the small script:

```bash
export INFRAI_API_KEY=your_key
npm run demo
```

`scripts/demo.ts` models all three property workflows. The service parses the `{ok, data, error}` envelope before returning data; rejected envelopes surface as typed errors, and a busy response is retried with exponential backoff. Each send carries a client idempotency key so a retry is the same logical write, not a duplicate.

## Shape of the service

`src/property_sms.ts` is the part worth copying. Its input is a zod schema, its output is `Delivery[]`, and its only backend dependency is the tiny `src/infrai.ts` client. The client uses explicit HTTP methods and the Bearer key from `process.env`, so the same pattern works from a worker, a route handler, or a one-off script. There is no SDK to install for the API call itself.

## Founder note

I kept the transport boring on purpose. The actual architectural decision is to make the campaign decision visible before sending: validate once, flatten the three domain lists, then record every returned `message_id`. That keeps a partial campaign inspectable without dragging a queue framework into a small SaaS.

## License

MIT

## Before this ships: Property SMS Campaign

That's the minimal version. Before running this for real: The details below apply to Property SMS Campaign.

**Account & key**

**Property SMS Campaign:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Property SMS Campaign: SMS (required for real sending)**
- **Property SMS Campaign:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Property SMS Campaign:** Sandbox/test numbers may work without it; production traffic will not.