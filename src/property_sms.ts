import { z } from "zod";
import { infrai } from "./infrai.js";

export const campaignRequest = z.object({
  maintenance: z.array(z.object({ tenant: z.string().min(1), phone: z.string().min(7), request: z.string().min(1) })),
  documents: z.array(z.object({ tenant: z.string().min(1), phone: z.string().min(7), document: z.string().min(1) })),
  inspections: z.array(z.object({ tenant: z.string().min(1), phone: z.string().min(7), date: z.string().min(1) })),
});
export type CampaignRequest = z.infer<typeof campaignRequest>;
export type Delivery = { tenant: string; message_id: string };

function textFor(item: CampaignRequest["maintenance"][number] | CampaignRequest["documents"][number] | CampaignRequest["inspections"][number]): string {
  if ("request" in item) return `Maintenance request received: ${item.request}`;
  if ("document" in item) return `Please send your ${item.document} document.`;
  return `Inspection reminder for ${item.date}.`;
}

export async function sendPropertyCampaign(input: unknown): Promise<Delivery[]> {
  const body = campaignRequest.parse(input);
  const items = [...body.maintenance, ...body.documents, ...body.inspections];
  const deliveries: Delivery[] = [];
  for (const item of items) {
    const payload = { to: item.phone, body: textFor(item) };
    const result = await infrai.sms.send(payload);
    deliveries.push({ tenant: item.tenant, message_id: result.message_id });
  }
  return deliveries;
}
