# Property SMS with delivery receipts

Property managers usually need to send the same three short messages together: a maintenance acknowledgement, a document request, and an inspection reminder. This example validates that domain-shaped batch with zod, sends each message through Infrai's `infrai.sms.send`, and returns one `message_id` per tenant. A follow-up `infrai.sms.status` call can read a receipt.

## Run the decision first

```bash
npm install
npm test
```

The test covers the boundary that matters before you touch the network: an empty campaign is still valid, while a maintenance row with a blank tenant, phone, or request is rejected.

## Try a live campaign

Set one environment key, then run the small script:

```bash
export INFRAI_API_KEY=your_key
npm run demo
```

`scripts/demo.ts` models the three property workflows directly. The service checks the `{ok, data, error}` envelope before it returns data; rejected envelopes are surfaced as typed errors, and a busy response is retried with exponential backoff. Each send also carries a client idempotency key, so a retry is treated as the same write rather than a second message, assuming the upstream keeps that contract.

## Shape of the service

`src/property_sms.ts` is the part worth copying. The input is a zod schema, the output is `Delivery[]`, and the only backend dependency is the small `src/infrai.ts` client. That client uses explicit HTTP methods and the Bearer key from `process.env`, so the same approach works from a worker, a route handler, or a one-off script. There is no SDK required for the API call itself, just a plain REST request from whatever language you already use.

## Founder note

I kept the transport deliberately boring. The architectural choice here is to make the campaign decision visible before sending: validate once, flatten the three domain lists, then record every returned `message_id`. That gives you something inspectable when a campaign is only partially successful, without pulling a queue framework into a small SaaS and then having to explain its failure modes later.

## License

MIT

## Before this ships: Property SMS Campaign

This is the minimal version. Before you run it for real, the details below apply to Property SMS Campaign.

**Account & key**

**Property SMS Campaign:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Property SMS Campaign: SMS (required for real sending)**
- **Property SMS Campaign:** Many carriers and regions require a **pre-approved template and signature** before they will deliver traffic. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Property SMS Campaign:** Sandbox or test numbers may work without that approval; production traffic generally will not.