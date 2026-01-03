import { authCallbackController } from "@src/controllers/auth/callback.controller";
import { getCurrentUserController } from "@src/controllers/auth/getCurrentUser.controller";
import { githubAuthController } from "@src/controllers/auth/githubAuth.controller";
import { googleAuthController } from "@src/controllers/auth/googleAuth.controller";
import { loginController } from "@src/controllers/auth/login.controller";
import { logoutController } from "@src/controllers/auth/logout.controller";
import { editProfileController } from "@src/controllers/auth/profileEdit.controller";
import { refreshTokenController } from "@src/controllers/auth/refreshToken.controller";
import { resendConfirmationController } from "@src/controllers/auth/resendConfirmation.controller";
import { signupController } from "@src/controllers/auth/signup.controller";
import { signupControllerWorker } from "@src/controllers/auth/signup.worker.controller";
import { isDeviceFinger } from "@src/middlewares/fingerprinting.middleware";
import { isAuthenticated } from "@src/middlewares/isAuth.middleware";
import { upload } from "@src/middlewares/multer.middleware";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/login", isDeviceFinger, loginController);
authRouter.post("/signup", isDeviceFinger, signupController);
authRouter.post("/signup/worker", isDeviceFinger, signupControllerWorker);
authRouter.get("/callback", isDeviceFinger, authCallbackController);
authRouter.get("/google", isDeviceFinger, googleAuthController);
authRouter.get("/github", githubAuthController);
authRouter.get("/me", isAuthenticated, getCurrentUserController);
authRouter.post("/logout", isAuthenticated, logoutController);
authRouter.put(
  "/profile/edit",
  isAuthenticated,
  upload.single("avatar"),
  editProfileController
);
authRouter.post("/refresh-token", isDeviceFinger, refreshTokenController);
authRouter.post(
  "/resend-confirmation",
  isDeviceFinger,
  resendConfirmationController
);
export { authRouter };
