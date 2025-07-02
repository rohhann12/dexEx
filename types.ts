import z from "zod";
export const orderPlace = z.object({
  type: z.string(),       // limit or market
  kind: z.string(),       // buy or sell
  price: z.number(),
  quantity: z.number(),
  market: z.string()
});
export type Order = z.infer<typeof orderPlace>;
