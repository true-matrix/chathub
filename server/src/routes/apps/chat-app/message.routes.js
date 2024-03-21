import { Router } from "express";
import {
  editMessage,
  getAllMessages,
  sendMessage,
} from "../../../controllers/apps/chat-app/message.controllers.js";
import { verifyJWT } from "../../../middlewares/auth.middlewares.js";
import { upload } from "../../../middlewares/multer.middlewares.js";
import { sendMessageValidator } from "../../../validators/apps/chat-app/message.validators.js";
import { mongoIdPathVariableValidator } from "../../../validators/common/mongodb.validators.js";
import { validate } from "../../../validators/validate.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/:chatId")
  .get(mongoIdPathVariableValidator("chatId"), validate, getAllMessages)
  .post(
    upload.fields([{ name: "attachments", maxCount: 5 }]),
    mongoIdPathVariableValidator("chatId"),
    sendMessageValidator(),
    validate,
    sendMessage
);
  
router.put("/:chatId/:messageId",
  upload.fields([{ name: "attachments", maxCount: 5 }]), // If you need to handle attachments
  mongoIdPathVariableValidator("chatId"), // Validate the chat ID path variable
  mongoIdPathVariableValidator("messageId"), // Validate the message ID path variable
  sendMessageValidator(), // Validate the request body
  validate, // Validate the request
  editMessage// Handle message editing
);

export default router;
