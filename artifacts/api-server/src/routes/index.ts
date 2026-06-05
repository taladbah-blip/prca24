import { Router, type IRouter } from "express";
import healthRouter from "./health";
import responsesRouter from "./responses";

const router: IRouter = Router();

router.use(healthRouter);
router.use(responsesRouter);

export default router;
