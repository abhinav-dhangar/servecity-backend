// src/controllers/worker/workerAssignedTasks.controller.ts

import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const workerAssignedTasksController = async (
  req: Request,
  res: Response
) => {
  try {
    const workerUserId = req.user?.id;

    if (!workerUserId) {
      return res.status(401).json({ message: "Unauthorized worker" });
    }

    // -----------------------------------------
    // 1️⃣ Get worker record to obtain worker.id
    // -----------------------------------------
    const { data: worker, error: workerErr } = await supabase
      .from("workers")
      .select("id, userId, fullName, subCategoryId")
      .eq("userId", workerUserId)
      .single();

    if (workerErr || !worker) {
      return res.status(404).json({
        message: "Worker profile not found",
        error: workerErr,
      });
    }

    // -----------------------------------------
    // 2️⃣ Get tasks assigned to this worker
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

        services (
          title,
          image,
          totalDuration,
          categoryId,
          subCategoryId
        ),

        orders (
          id,
          userId,
          addressId,
          addresses (
            fullName,
            phone,
            city,
            state,
            roadStreet
          )
        )
      `
      )
      .eq("workerId", worker.id)
      .order("date", { ascending: true })
      .order("timeSlot", { ascending: true });

    if (tasksErr) {
      return res.status(500).json({
        message: "Failed to fetch assigned tasks",
        error: tasksErr,
      });
    }

    return res.status(200).json({
      message: "Assigned tasks fetched successfully",
      worker: {
        id: worker.id,
        name: worker.fullName,
        subCategoryId: worker.subCategoryId,
      },
      tasks: tasks || [],
    });
  } catch (error) {
    console.error("Worker Assigned Tasks Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
