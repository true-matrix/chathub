import { Router } from "express";
import {
  addAlpha,
  addNewParticipantInGroupChat,
  addUser,
  createAGroupChat,
  createOrGetAOneOnOneChat,
  deleteAlpha,
  deleteGroupChat,
  deleteOneOnOneChat,
  deleteUser,
  getAllAlpha,
  getAllChats,
  getAllSupremeAlpha,
  getGroupChatDetails,
  getUserById,
  leaveGroupChat,
  removeParticipantFromGroupChat,
  renameGroupChat,
  searchAvailableUsers,
  updateAlpha,
  updateUser,
} from "../../../controllers/apps/chat-app/chat.controllers.js";
import { verifyJWT } from "../../../middlewares/auth.middlewares.js";
import {
  createAGroupChatValidator,
  updateGroupChatNameValidator,
} from "../../../validators/apps/chat-app/chat.validators.js";
import { mongoIdPathVariableValidator } from "../../../validators/common/mongodb.validators.js";
import { validate } from "../../../validators/validate.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllChats);

router.route("/users").get(searchAvailableUsers);
router.route("/users/:userId").get(getUserById);

// ****************************************************SupremeAlpha routes********************************************************************************//
router.route("/adduser").post(validate,addUser);
router.route("/updateuser/:userId").patch(validate,updateUser);
router.route("/deleteuser/:userId").delete(validate,deleteUser);
router.route("/all-supreme-alphas").get(getAllSupremeAlpha);

// ****************************************************Alpha routes********************************************************************************//
router.route("/addalpha").post(validate,addAlpha);
router.route("/updatealpha/:userId").patch(validate,updateAlpha);
router.route("/deletealpha/:userId").delete(validate,deleteAlpha);
router.route("/all-alphas").get(getAllAlpha);

router
  .route("/c/:receiverId")
  .post(
    mongoIdPathVariableValidator("receiverId"),
    validate,
    createOrGetAOneOnOneChat
  );

router
  .route("/group")
  .post(createAGroupChatValidator(), validate, createAGroupChat);

router
  .route("/group/:chatId")
  .get(mongoIdPathVariableValidator("chatId"), validate, getGroupChatDetails)
  .patch(
    mongoIdPathVariableValidator("chatId"),
    updateGroupChatNameValidator(),
    validate,
    renameGroupChat
  )
  .delete(mongoIdPathVariableValidator("chatId"), validate, deleteGroupChat);

router
  .route("/group/:chatId/:participantId")
  .post(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator("participantId"),
    validate,
    addNewParticipantInGroupChat
  )
  .delete(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator("participantId"),
    validate,
    removeParticipantFromGroupChat
  );

router
  .route("/leave/group/:chatId")
  .delete(mongoIdPathVariableValidator("chatId"), validate, leaveGroupChat);

router
  .route("/remove/:chatId")
  .delete(mongoIdPathVariableValidator("chatId"), validate, deleteOneOnOneChat);

export default router;
