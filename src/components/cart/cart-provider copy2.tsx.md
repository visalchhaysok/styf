"use client"

import type { Product } from "@/lib/products"
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase"

export type CartItem = {
    id: string
    size: string
    quantity: number
    productId: string
    name: string
    price: number
    image: string
}

const mapToCartItem = (dbCartItem: any): CartItem => {
    return {
        id: dbCartItem.id,
        size: dbCartItem.size,
        quantity: dbCartItem.quantity,
        productId: dbCartItem.product_id,
        name: dbCartItem.products.name || "Unknown",
        price: dbCartItem.products.price || 0,
        image: dbCartItem.products.image_url || "/placeholder.png",
    }
}

const mapToCartItemsList = (dbCartItemList: any): CartItem[] => {
    return dbCartItemList.map((item: any) => mapToCartItem(item))
}

type CartContextValue = {
    items: CartItem[]
    count: number
    subtotal: number
    isOpen: boolean
    isLoading: boolean
    error: string | null
    openCart: () => void
    closeCart: () => void
    addItem: (product: Product, size: string) => Promise<void>
    removeItem: (productId: string, size: string) => Promise<void>
    updateQuantity: (
        productId: string,
        size: string,
        newQuantity: number,
    ) => Promise<void>
    clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)
const SESSION_KEY = "styf-session-id"

const getSessionId = () => {
    if (typeof window === "undefined") return ""

    let id = localStorage.getItem(SESSION_KEY)

    if (!id) {
        id = uuidv4()
        localStorage.setItem(SESSION_KEY, id)
    }
    return id
}

export default function CartProvider({ children }: { children: ReactNode }) {
    const { user, isLoading: authLoading } = useAuth()
    const [items, setItems] = useState<CartItem[]>([])
    const [cartId, setCartId] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {

        let isMounted = true
        console.log('Reading Cart Info...')

        if (authLoading) {
            return
        }

        const loadCart = async () => {

            console.log(`Clearing old session...`)
            localStorage.removeItem(SESSION_KEY)

            if (user) {
                console.log(`Running User + Existing cart`)

                const { data: userCart, error: userCartError } = await supabase
                    .from('carts')
                    .select('id, session_id, cart_items(*, products(name, price, image_url))')
                    .eq('user_id', user.id)
                    .maybeSingle()

                console.log(`${user.email}'s Cart:`, JSON.stringify(userCart, null, 2))

                if (userCartError) throw userCartError

                if (userCart) {
                    if (isMounted) {
                        console.log(`Successfully fetched user + existing cart`)
                        localStorage.setItem(SESSION_KEY, userCart.session_id)
                        setCartId(userCart.id)
                        setItems(mapToCartItemsList(userCart.cart_items) || [])
                    }
                    return

                } else { // User + no Cart
                    console.log('User exists but no cart running')
                    const newSessionId = getSessionId()
                    // const { data: findUserCart, error: findUserCartError } = await supabase
                    //     .from('carts')
                    //     .select('id, cart_items(*, products(name, price, image_url))')
                    //     .eq('session_id', newSessionId)
                    //     .maybeSingle()

                    // console.log('Result user + no cart...: ', JSON.stringify(findUserCart, null, 2))

                    // if (findUserCartError) throw findUserCartError

                    // if (findUserCart) {
                    //     if (isMounted) {

                    console.log('Found User + No Cart, now attaching user to new cart')

                    const { data: claimedUserCart, error: claimedUserCartError } = await supabase
                        .from('carts')
                        .update({ user_id: user.id })
                        .eq('session_id', newSessionId)
                        .select('id, cart_items(*, products(name, price, image_url))')
                        .maybeSingle()

                    if (claimedUserCartError) throw claimedUserCartError

                    if (claimedUserCart) {
                        setCartId(claimedUserCart.id)
                        setItems(mapToCartItemsList(claimedUserCart.cart_items) || [])
                        return
                    }
                }
                // return
                // }
                // found no cart: null
                console.log('Unable to find cart. Creating new cart for user')

                const { data: newUserCart, error: newUserCartError } = await supabase
                    .from('carts')
                    .insert({ user_id: user.id, session_id: newSessionId })
                    .select('id, cart_items(*, products(name, price, image_url))')
                    .maybeSingle()

                if (newUserCartError) throw newUserCartError

                if (newUserCart) {
                    if (isMounted) {
                        setCartId(newUserCart.id)
                        setItems(mapToCartItemsList(newUserCart.cart_items) || [])
                    }
                    return
                }
            }
        }

        loadCart()

        return () => {
            isMounted = false
        }

    }, [user, authLoading, supabase])

    const addItem = useCallback(
        async (product: Product, size: string) => {
            if (!cartId) {
                console.warn("Warning: Cart not loaded")
                return
            }

            setError(null)

            try {
                const { data: existingItem, error: errorFetchItem } = await supabase
                    .from("cart_items")
                    .select("id, quantity")
                    .eq("cart_id", cartId)
                    .eq("product_id", product.id)
                    .eq("size", size)
                    .maybeSingle()

                if (errorFetchItem) throw errorFetchItem

                if (existingItem) {
                    const { data: updatedItem, error: updateError } = await supabase
                        .from("cart_items")
                        .update({ quantity: existingItem.quantity + 1 })
                        .eq("id", existingItem.id)
                        .select("*, products(name, price, image_url)")
                        .single()

                    if (updateError) throw updateError

                    const mappedUpdatedItem = mapToCartItem(updatedItem)
                    setItems((prev) =>
                        prev.map((item) =>
                            item.id === mappedUpdatedItem.id
                                ? { ...item, quantity: mappedUpdatedItem.quantity }
                                : item,
                        ),
                    )
                    return

                } else {
                    const { data: newCartItem, error: insertError } = await supabase
                        .from("cart_items")
                        .insert({
                            cart_id: cartId,
                            product_id: product.id,
                            size,
                            quantity: 1,
                        })
                        .select("*, products(name, price, image_url)")
                        .maybeSingle()

                    if (insertError) throw insertError

                    const mappedItem = mapToCartItem(newCartItem)

                    setItems((prev) => [...prev, mappedItem])
                    return
                }
            } catch (error) {
                console.error(`Line 204 Error: `, error)
                setError(`Failed to addItem: ${error}`)

                try {
                    const { data, error: refreshCartError } = await supabase
                        .from("carts")
                        .select("cart_items(*, products(name, price, image_url))")
                        .eq("id", cartId)
                        .maybeSingle()

                    if (refreshCartError) {
                        console.error("Cart failed to load:", refreshCartError.message)
                        throw refreshCartError
                    }

                    setItems(mapToCartItemsList(data?.cart_items) || [])
                    return
                } catch (refreshCartError) {
                    setError(`Failed to reload Cart, please retry: ${refreshCartError}`)
                    console.error("Line 223 error: ", refreshCartError)
                    return
                } finally {
                    console.log(`New Cart:`, items)
                    return
                }
            }
        },
        [cartId, supabase],
    )

    const removeItem = useCallback(
        async (productId: string, size: string) => {
            if (!cartId) {
                console.warn(`Unable to load cart, please refresh`)
            }

            setError(null)

            try {
                const { data: removedItem, error: errorRemove } = await supabase
                    .from("cart_items")
                    .delete()
                    .eq("cart_id", cartId)
                    .eq("product_id", productId)
                    .eq("size", size)
                    .select("id, size")
                    .single()

                if (errorRemove) {
                    console.error("Failed to removed item: ", errorRemove.message)
                    return
                }

                setItems((prev) =>
                    prev.filter(
                        (item) =>
                            !(item.id === removedItem.id && item.size === removedItem.size),
                    ),
                )
            } catch (caughtError) {
                setError(`Failed to remove item: ${caughtError}`)
                console.error(`Line 257, Failed to remove item: `, caughtError)
                return
            }
        },
        [cartId, supabase],
    )

    const updateQuantity = useCallback(
        async (productId: string, size: string, quantity: number) => {
            if (!cartId) {
                console.warn("Cart loading, please refresh...")
                return
            }

            setError(null)

            try {
                if (quantity <= 0) {
                    const { data: removedItem, error: removeError } = await supabase
                        .from("cart_items")
                        .delete()
                        .eq("cart_id", cartId)
                        .eq("product_id", productId)
                        .eq("size", size)
                        .select("id")
                        .single()

                    if (removeError) throw removeError

                    setItems((prev) =>
                        prev.filter((item) => !(item.id === removedItem.id)),
                    )
                    return
                }

                const { data: updatedItem, error: updateError } = await supabase
                    .from("cart_items")
                    .update({ quantity })
                    .eq("cart_id", cartId)
                    .eq("product_id", productId)
                    .eq("size", size)
                    .select("*")
                    .single()

                if (updateError) {
                    console.error(`Failed to update quantity: ${updateError.message}`)
                    return
                }

                setItems((prev) =>
                    prev.map((item) =>
                        item.id === updatedItem.id && item.size === updatedItem.size
                            ? { ...item, quantity: updatedItem.quantity }
                            : item,
                    ),
                )

                console.log(`Updated Cart:`, updatedItem)

                return
            } catch (caughtError) {
                setError(`Failed to update quantity: ${caughtError}`)
                console.error(`Line 278, Update Quantity failed: `, caughtError)
                return
            }
        },
        [cartId, supabase],
    )

    const clearCart = useCallback(async () => {
        if (!cartId) {
            console.warn(`Loading cart..., please wait or refresh`)
            return
        }

        setError(null)

        try {
            const { error: clearCartError } = await supabase
                .from("cart_items")
                .delete()
                .eq("cart_id", cartId)

            if (clearCartError) {
                console.error(`Line 322, Clear cart failed`)
                throw clearCartError
            }

            setItems([])
        } catch (caughtError) {
            setError(`Failed to clear your cart: ${caughtError}`)
            console.error(`Line 329. Clear cart failed: `, caughtError)
            return
        }
    }, [cartId, supabase])

    const openCart = useCallback(() => setIsOpen(true), [])
    const closeCart = useCallback(() => setIsOpen(false), [])

    const value = useMemo<CartContextValue>(() => {
        const count = items.reduce((sum, item) => sum + item.quantity, 0)
        const subtotal = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        )

        return {
            items,
            count,
            subtotal,
            isOpen,
            isLoading,
            error,
            openCart,
            closeCart,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
        }
    }, [
        items,
        isOpen,
        isLoading,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
    ])

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error(`Line 393, Failed to receieve cart info...`)
    return context
}
