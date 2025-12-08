// src/controllers/worker/updateWorkerTaskStatus.controller.ts

import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const updateWorkerTaskStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const workerUserId = req.user?.id;
    const { taskId, newStatus } = req.body;

    if (!workerUserId) {
      return res.status(401).json({ message: "Unauthorized worker" });
    }

    if (!taskId || !newStatus) {
      return res.status(400).json({
        message: "taskId and newStatus are required",
      });
    }

    // -----------------------------------------
    // 1️⃣ Get worker profile
    // -----------------------------------------
    const { data: worker, error: workerErr } = await supabase
      .from("workers")
      .select("id, userId")
      .eq("userId", workerUserId)
      .single();

    if (!worker || workerErr) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // -----------------------------------------
    // 2️⃣ Fetch task to validate ownership + status
    // -----------------------------------------
    const { data: task, error: taskErr } = await supabase
      .from("orderItems")
      .select("id, workerId, status")
      .eq("id", taskId)
      .single();

    if (!task || taskErr) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.workerId !== worker.id) {
      return res.status(403).json({
        message: "You are not assigned to this task",
      });
    }

    // -----------------------------------------
    // 3️⃣ Validate allowed transitions
    // -----------------------------------------
    const allowedTransitions: Record<string, string[]> = {
      assigned: ["in_progress"],
      in_progress: ["completed"],
      completed: [], // cannot change after completed
    };

    if (!allowedTransitions[task.status]?.includes(newStatus)) {
      return res.status(400).json({
        message: `Cannot change status from '${task.status}' to '${newStatus}'`,
      });
    }

    // -----------------------------------------
    // 4️⃣ Perform update
    // -----------------------------------------
    const { data: updatedTask, error: updateErr } = await supabase
      .from("orderItems")
      .update({ status: newStatus })
      .eq("id", taskId)
      .select()
      .single();

    if (updateErr) {
      return res.status(500).json({
        message: "Failed to update task status",
        error: updateErr,
      });
    }

    return res.status(200).json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Worker Update Task Status Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
