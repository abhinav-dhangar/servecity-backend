// controllers/orders/buyNow.controller.ts

import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";
import { buyNowSchema, BuyNowDto } from "@src/schema/buyNow.zod";

export const buyNowController = async (req: Request, res: Response) => {
  try {
    // ===============================
    // STEP A: Zod Validation
    // ===============================
    const parsed = buyNowSchema.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid buy now data",
        errors: parsed.error.flatten(),
      });
    }

    const { productId, quantity, variant, addressId, paymentMethod } = parsed
      .data.body as BuyNowDto;

    const userId = req.user.id;

    // ===============================
    // STEP 1: Validate Address
    // ===============================
    const { data: address } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("userId", userId)
      .maybeSingle();

    if (!address) {
      return res.status(404).json({ message: "Invalid address" });
    }

    // ===============================
    // STEP 2: Fetch Product
    // ===============================
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ===============================
    // STEP 3: Smart Variant Logic
    // ===============================
    const productHasVariants =
      Array.isArray(product.variant) && product.variant.length > 0;

    if (productHasVariants && !variant) {
      return res.status(400).json({
        message: "Variant is required for this product",
      });
    }

    if (!productHasVariants && variant) {
      return res.status(400).json({
        message: "This product has no variants; remove variant from request",
      });
    }

    let matchedOption = null;

    if (productHasVariants) {
      const matchedVariantGroup = product.variant.find(
        (v: any) => v.type === variant?.type
      );

      if (!matchedVariantGroup) {
        return res.status(400).json({ message: "Invalid variant type" });
      }

      matchedOption = matchedVariantGroup.options.find(
        (opt: any) => opt.value === variant?.value
      );

      if (!matchedOption) {
        return res.status(400).json({
          message: `Variant value '${variant?.value}' not available`,
        });
      }

      if (matchedOption.stock < quantity) {
        return res.status(400).json({
          message: "Insufficient stock for this variant",
        });
      }
    }

    // ===============================
    // STEP 4: Calculate total cost
    // ===============================
    const totalAmount = product.productSellingCost * quantity;

    // ===============================
    // STEP 5: Insert Order
    // ===============================
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert([
        {
          userId,
          vendorId: product.vendorId,
          addressId,
          paymentMethod,
          paymentStatus: "pending",
          totalAmount,
        },
      ])
      .select()
      .single();

    if (orderErr) {
      return res.status(500).json({
        message: "Order creation failed",
        error: orderErr,
      });
    }

    // ===============================
    // STEP 6: Insert Order Item
    // ===============================
    await supabase.from("orderItems").insert([
      {
        orderId: order.id,
        productId,
        quantity,
        sellingPrice: product.productSellingCost,
        variant: productHasVariants ? variant : null,
      },
    ]);

    // ===============================
    // STEP 7: Deduct Stock (if variant)
    // ===============================
    if (productHasVariants) {
      const updatedVariants = product.variant.map((v: any) => {
        if (v.type !== variant?.type) return v;

        return {
          ...v,
          options: v.options.map((opt: any) => {
            if (opt.value !== variant?.value) return opt;
            return { ...opt, stock: opt.stock - quantity };
          }),
        };
      });

      await supabase
        .from("products")
        .update({ variant: updatedVariants })
        .eq("id", productId);
    }

    return res.status(201).json({
      message: "Order placed successfully",
      orderId: order.id,
      totalAmount,
    });
  } catch (error) {
    console.error("Buy Now Error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
