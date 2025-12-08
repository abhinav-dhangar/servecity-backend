// src/services/cart/cart.helper.ts

import { supabase } from "@utils/supa.conn";
import { redisClient } from "@utils/redis.conn";
import crypto from "crypto";
import { CartArray, CartItem } from "@src/schema/cart.schema";

// Prefix for Redis cart keys
const CART_PREFIX = "cart:";

// ------------------------------------------------------
// 1️⃣ Get OR Create cartId for user
// ------------------------------------------------------
export const getOrCreateCartIdForUser = async (userId: string): Promise<string> => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("cartId")
    .eq("userId", userId)
    .maybeSingle();

  if (error) throw error;

  if (profile?.cartId) return profile.cartId;

  // Generate new unique cartId
  const newCartId = `${CART_PREFIX}${crypto.randomUUID()}`;

  // Save cartId to profile
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ cartId: newCartId })
    .eq("userId", userId);

  if (updateErr) throw updateErr;

  // Initialize empty cart in Redis
  await redisClient.set(newCartId, JSON.stringify([]));

  return newCartId;
};

// ------------------------------------------------------
// 2️⃣ Read cart from Redis
// ------------------------------------------------------
export const getCartFromRedis = async (cartId: string): Promise<CartArray> => {
  const raw = await redisClient.get(cartId);
  console.log("raw raw ",raw)
  if (!raw) {
    const empty: CartArray = [];
    await redisClient.set(cartId, JSON.stringify(empty));
    return empty;
  }

  try {
    return raw
  } catch (err) {
    console.error("Cart JSON parse error:", err);
    return [];
  }
};

// ------------------------------------------------------
// 3️⃣ Save updated cart to Redis
// ------------------------------------------------------
export const saveCartToRedis = async (cartId: string, cart: CartArray) => {
  await redisClient.set(cartId, JSON.stringify(cart));
};
