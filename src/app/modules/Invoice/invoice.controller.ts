import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { InvoiceService } from "./invoice.service";

// create invoice
const createInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await InvoiceService.createInvoice(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice created successfully",
    data: result,
  });
});

// get invoice
const getInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await InvoiceService.getInvoice();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice fetched successfully",
    data: result,
  });
});

export const InvoiceController = {
  createInvoice,
  getInvoice,
};
