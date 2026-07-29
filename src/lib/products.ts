import { supabase } from "./supabase";
export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  sizes: string[];
  in_stock: boolean;
};

export async function getProducts(): Promise<Product[]> {

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price),
    image_url: row.image_url ? row.image_url : '/products/placeholder.png',
    description: row.description || '',
    sizes: row.sizes
      ? row.sizes.split(',').map((size: string) => size.trim())
      : [],
    in_stock: row.in_stock ?? true,
  }));

}

export async function getProduct(id: string): Promise<Product | null> {

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching products:', error);
    return null;
  };

  return {
    id: data.id,
    name: data.name,
    price: Number(data.price),
    image_url: data.image_url || '/products/placeholder.png',
    description: data.description || '',
    sizes: data.sizes
      ? data.sizes.split(',').map((size: string) => size.trim())
      : [],
    in_stock: data.in_stock ?? true,
  };
}