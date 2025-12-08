import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const getWorkerTaskDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const workerId = req.user?.id;
    const { taskId } = req.params;

    if (!workerId) {
      return res.status(401).json({ message: "Unauthorized worker" });
    }

    // ---------------------------------------------
    // 1) Fetch the task only
    // ---------------------------------------------
    const { data: task, error: taskErr } = await supabase
      .from("orderItems")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskErr || !task) {
      return res
        .status(404)
        .json({ message: "Task not found", error: taskErr });
    }

    // ---------------------------------------------
    // 2) Fetch service
    // ---------------------------------------------
    const { data: service } = await supabase
      .from("services")
      .select("id, title, image, description, totalDuration, subCategoryId")
      .eq("id", task.serviceId)
      .single();

    // ---------------------------------------------
    // 3) Fetch order
    // ---------------------------------------------
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", task.orderId)
      .single();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ---------------------------------------------
    // 4) Fetch address
    // ---------------------------------------------
    let address = null;
    if (order.addressId) {
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", order.addressId)
        .single();

      address = data || null;
    }

    // ---------------------------------------------
    // 5) Fetch customer profile
    // ---------------------------------------------
    let customer = null;
    if (order.userId) {
      const { data } = await supabase
        .from("profiles")
        .select("id, fullName, phone, avatar")
        .eq("userId", order.userId)
        .maybeSingle();

      customer = data || null;
    }

    // ---------------------------------------------
    // 6) ACL Enforcement
    // ---------------------------------------------
    const { data: worker } = await supabase
      .from("workers")
      .select("id, subCategoryId")
      .eq("userId", workerId)
      .single();

    if (!worker)
      return res.status(404).json({ message: "Worker record missing" });

    const isUnassigned = task.workerId === null;
    const isMine = task.workerId === workerId;

    // Worker trying to view someone else's assigned task
    if (!isUnassigned && !isMine) {
      return res.status(403).json({
        message: "This task is assigned to another worker",
      });
    }

    // Worker can access unassigned ONLY if category matches
    if (isUnassigned && worker.subCategoryId !== service?.subCategoryId) {
      return res.status(403).json({
        message: "This task is not in your service niche",
      });
    }

    // ---------------------------------------------
    // 7) FINAL CLEAN RESPONSE
    // ---------------------------------------------
    return res.status(200).json({
      message: "Task details fetched successfully",
      task: {
        ...task,
        service,
        order,
        customer,
        address,
      },
    });
  } catch (error) {
    console.error("Worker Task Details Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
