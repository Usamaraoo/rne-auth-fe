import { Router } from "express";
import { googleAuth, googleCallback } from "./google/auth.google.controller";
import { loginHandler, signupHandler } from "./auth.controller";
import { linkedInAuth, linkedInCallback } from "./linkedin/auth.linkedin.controller";
const router = Router();

router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/linkedin", linkedInAuth);
router.get("/linkedin/callback", linkedInCallback);
export default router;
