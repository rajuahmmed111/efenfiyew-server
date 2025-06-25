import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { InvoiceController } from "./invoice.controller";

const router = express.Router();

// get all invoice
router.get("/", auth(UserRole.FARMER),InvoiceController.getInvoice);

// create invoice
router.post("/", auth(UserRole.FARMER),InvoiceController.createInvoice);

export const invoiceRoute = router;
