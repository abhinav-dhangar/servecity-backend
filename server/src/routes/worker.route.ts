import { getWorkerProfileController } from "@src/controllers/workers/get.controller";
import { getWorkerStatusController } from "@src/controllers/workers/status.controller";
import { getWorkerTaskDetailsController } from "@src/controllers/workers/taskDetails.controller";
import { updateWorkerTaskStatusController } from "@src/controllers/workers/updateWorkerTask.controller";
import { submitVerificationController } from "@src/controllers/workers/verify.submit.controller";
import { workerAssignedTasksController } from "@src/controllers/workers/workerAssignedTask.controller";
import { workerClaimTaskController } from "@src/controllers/workers/workerClaimTask.controller";
import { workerAvailableTasksController } from "@src/controllers/workers/workerTaskAvailable.controller";
import { isAuthenticated } from "@src/middlewares/isAuth.middleware";
import { upload } from "@src/middlewares/multer.middleware";
import { verificationSchema } from "@src/schema/worker.verification.zod";
import { validate } from "@utils/validate.zod";
import { Router } from "express";

const workerRouter = Router();

workerRouter.post(
  "/verification/submit",
  isAuthenticated,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "aadhaar", maxCount: 1 },
  ]),
  validate(verificationSchema),
  submitVerificationController
);

workerRouter.get("/profile", isAuthenticated, getWorkerProfileController);
workerRouter.get("/status", isAuthenticated, getWorkerStatusController);
workerRouter.post(
  "/tasks/available",
  isAuthenticated,
  workerAvailableTasksController
);
workerRouter.post(
  "/tasks/update-status",
  isAuthenticated,
  updateWorkerTaskStatusController
);
workerRouter.post("/tasks/my", isAuthenticated, workerAssignedTasksController);
workerRouter.post(
  "/tasks/claim/:taskId",
  isAuthenticated,
  workerClaimTaskController
);
workerRouter.get(
  "/tasks/assigned",
  isAuthenticated,
  workerAssignedTasksController
);
workerRouter.post(
  "/tasks/:taskId",
  isAuthenticated,
  getWorkerTaskDetailsController
);
export { workerRouter };
