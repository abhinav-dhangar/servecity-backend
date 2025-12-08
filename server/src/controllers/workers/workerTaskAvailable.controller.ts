// src/controllers/worker/workerAvailableTasks.controller.ts

import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const workerAvailableTasksController = async (
  req: Request,
  res: Response
) => {
  try {
    const workerUserId = req.user?.id;
    if (!workerUserId) {
      return res.status(401).json({ message: "Unauthorized worker" });
    }

    // -----------------------------------------
    // 1️⃣ Fetch worker profile to get subCategoryId
    // -----------------------------------------
    const { data: worker, error: workerErr } = await supabase
      .from("workers")
      .select("id, userId, subCategoryId, city, pincode")
      .eq("userId", workerUserId)
      .single();

    if (workerErr || !worker) {
      return res.status(404).json({
        message: "Worker not found or not registered",
        error: workerErr,
      });
    }

    // -----------------------------------------
    // 2️⃣ Fetch tasks that match worker subCategory
    // -----------------------------------------
    const { data: tasks, error: tasksErr } = await supabase
      .from("orderItems")
      .select(
        `
        id,
        orderId,
        serviceId,
        date,
        timeSlot,
        price,
        status,
        workerId,
        orders ( userId, addressId ),
        services ( title, image, categoryId, subCategoryId )
      `
      )
      .is("workerId", null) // worker not assigned
      .eq("status", "unassigned") // only unassigned tasks
      .eq("services.subCategoryId", worker.subCategoryId); // match skill

    if (tasksErr) {
      return res.status(500).json({
        message: "Failed to fetch tasks",
        error: tasksErr,
      });
    }

    return res.status(200).json({
      message: "Available tasks for worker",
      worker: {
        id: worker.id,
        subCategoryId: worker.subCategoryId,
      },
      tasks,
    });
  } catch (error) {
    console.error("Worker tasks fetch error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
