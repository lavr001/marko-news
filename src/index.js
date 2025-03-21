import { Router } from "express";
import indexPage from "./pages/index";

export const router = Router().get("/", indexPage);
