export type DBCartItem = {
    id: string
    cart_id: string
    size: string
    quantity: number
    product_id: string
    products: {
        id: string
        name: string
        price: number
        image_url?: string
        description?: string
    }
}

export type DBOrderItem = {
    id?: string
    order_id?: string
    product_id: string
    product_name: string
    size: string
    quantity: number
    price: number
    sub_total: number
}

export type DBProduct = {
    id: string
    name: string
    price: number
    sizes: string
    description?: string
    image_url?: string
    in_stock: boolean
}
