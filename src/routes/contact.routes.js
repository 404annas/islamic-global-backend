import { Router } from "express";
import { submitContactMessage, submitTrialRequest } from "../controllers/contact.controller.js";

const router = Router();

// Public routes for contact forms
router.post("/contact", submitContactMessage);
router.post("/trial-request", submitTrialRequest);

export default router;