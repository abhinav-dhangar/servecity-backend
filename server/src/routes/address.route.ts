import { createAddressController } from "@src/controllers/addresses/create.controller";
import { deleteAddressController } from "@src/controllers/addresses/delete.controller";
import { editAddressController } from "@src/controllers/addresses/edit.controller";
import { getAllAddressesOfSameUserController } from "@src/controllers/addresses/sameUser.controller";
import { isAuthenticated } from "@src/middlewares/isAuth.middleware";
import { updateAddressSchema } from "@src/schema/address.edit.zod";
import { addressSchema } from "@src/schema/address.zod";
import { validate } from "@utils/validate.zod";
import { Router } from "express";

const addressRouter = Router();

addressRouter.post(
  "/create",
  isAuthenticated,
  validate(addressSchema),
  createAddressController
);

addressRouter.post(
  "/edit",
  isAuthenticated,
  validate(updateAddressSchema),
  editAddressController
);

addressRouter.get(
  "/all-addresses",
  isAuthenticated,
  getAllAddressesOfSameUserController
);
addressRouter.post(
  "/delete/:addressId",
  isAuthenticated,
  deleteAddressController
);
export { addressRouter };
