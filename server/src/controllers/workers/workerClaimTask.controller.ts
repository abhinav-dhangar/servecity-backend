import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const workerClaimTaskController = async (req: Request, res: Response) => {
  try {
    const workerUserId = req.user?.id;
    const { taskId } = req.params;

    if (!workerUserId) {
      return res.status(401).json({ message: "Unauthorized worker" });
    }

    if (!taskId) {
      return res.status(400).json({ message: "taskId is required" });
    }

    // -----------------------------------------
    // 1️⃣ Fetch worker data (to know their skill)
    // -----------------------------------------
    const { data: worker, error: workerErr } = await supabase
      .from("workers")
      .select("id, userId, subCategoryId, city, pincode")
      .eq("userId", workerUserId)
      .single();

    if (workerErr || !worker) {
      return res.status(404).json({
        message: "Worker not found",
        error: workerErr,
      });
    }

    // -----------------------------------------
    // 2️⃣ Fetch the task (orderItem)
    // -----------------------------------------
    const { data: task, error: taskErr } = await supabase
      .from("orderItems")
      .select(
        `
        id,
        serviceId,
        workerId,
        status,
        date,
        timeSlot,
        services ( subCategoryId )
      `
      )
      .eq("id", taskId)
      .single();

    if (taskErr || !task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // -----------------------------------------
    // 3️⃣ Check if task is already assigned
    // -----------------------------------------
    if (task.workerId !== null) {
      return res.status(409).json({
        message: "Task already claimed by another worker",
      });
    }

    // -----------------------------------------
    // 4️⃣ Check if worker has the correct skill
    // -----------------------------------------
    if (task.services.subCategoryId !== worker.subCategoryId) {
      return res.status(403).json({
        message: "You are not allowed to claim this task (wrong subcategory)",
      });
    }

    // OPTIONAL: City/pincode matching
    // Uncomment if needed:
    //
    // if (task.orders.address.pincode !== worker.pincode) {
    //   return res.status(403).json({
    //     message: "This task is outside your service area",
    //   });
    // }

    // -----------------------------------------
    // 5️⃣ ATOMIC UPDATE (prevents double assignment)
    // -----------------------------------------
    const { data: updatedTask, error: claimErr } = await supabase
      .from("orderItems")
      .update({
        workerId: worker.id,
        status: "assigned",
      })
      .eq("id", taskId)
      .is("workerId", null) // VERY IMPORTANT — ensures atomic locking
      .select()
      .single();

    if (claimErr || !updatedTask) {
      return res.status(409).json({
        message: "Failed to claim task — someone else claimed it first",
        error: claimErr,
      });
    }

    return res.status(200).json({
      message: "Task successfully claimed",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Worker Claim Task Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
