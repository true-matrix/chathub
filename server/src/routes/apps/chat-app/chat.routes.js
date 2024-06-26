import { Router } from "express";
import {
  addAlpha,
  addNewParticipantInGroupChat,
  addOmega,
  addUser,
  blockUser,
  createAGroupChat,
  createOrGetAOneOnOneChat,
  deleteAlpha,
  deleteGroupChat,
  deleteOmega,
  deleteOneOnOneChat,
  deleteUser,
  getAllAlpha,
  getAllChats,
  getAllContacts,
  getAllGroups,
  getAllOTPs,
  getAllOmega,
  getAllSupremeAlpha,
  getChatIdByParticipants,
  getGroupChatDetails,
  getPROTPs,
  getUserById,
  leaveGroupChat,
  removeParticipantFromGroupChat,
  renameGroupChat,
  searchAvailableUsers,
  toggleAnonymous,
  updateAlpha,
  updateGroupImage,
  updateOmega,
  updateProfile,
  updateProfileImage,
  updateUser,
} from "../../../controllers/apps/chat-app/chat.controllers.js";
import { verifyJWT } from "../../../middlewares/auth.middlewares.js";
import { upload } from "../../../middlewares/multer.middlewares.js";

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

router.route("/allgroups").get(getAllGroups);
// ****************************************************Block / unblock routes********************************************************************************//
router.route('/block').patch(blockUser);

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

// ****************************************************Alpha routes********************************************************************************//
router.route("/addomega").post(validate,addOmega);
router.route("/updateomega/:userId").patch(validate,updateOmega);
router.route("/deleteomega/:userId").delete(validate,deleteOmega);
router.route("/all-omegas").get(getAllOmega);

// ****************************************************OTP routes********************************************************************************//
router.route("/otps").get(getAllOTPs);
router.route("/pr-otps").get(getPROTPs);

// ****************************************************All Contacts********************************************************************************//
router.route("/contacts").get(getAllContacts);

// ****************************************************User Profile routes********************************************************************************//
router.route("/updateprofile/:userId").patch(validate, updateProfile);
router
  .route("/profileimage/:userId")
  .patch(upload.single("avatar"), updateProfileImage);

// *****************************************************getChatIdByParticipants***********************************************************************************//
router.route("/getChatId/:participant1Id/:participant2Id").get(getChatIdByParticipants);

  
// ****************************************************************************************************************************************//
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
  .route("/group/updatepack/:chatId")
  .patch(upload.single("avatar"), updateGroupImage);

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

router
  .route("/group/toggleAnonymous")
  .post(toggleAnonymous);  

export default router;
