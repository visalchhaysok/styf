import { uuid, z } from "zod"

export const CheckOutSchema = z.object({
    cartId: z.uuid({ error: "Unable to verify cart" })
})