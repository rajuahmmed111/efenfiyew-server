import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

// create invoice
const createInvoice = async (data: any) => {

await prisma.invoice.create({
  data: {
    orderId: "DE124335",
    customerName: "Zubair Khan",
    customerEmail: "zubairkhan@gmail.com",
    product: "Lettuce",
    quantity: 3,
    status: "Delivered",
    closeDate: new Date("2024-06-11T00:00:00.000Z"),
    shippingAddress: "Mohakhali, Dhaka",
    preferredCourier: "DHL",
    deliveryNotes: "",
  },
});

}

const getInvoice = async () => {
  const invoices = await prisma.invoice.findMany();

  if (invoices.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No invoices found");
  }

  const randomInvoice = Math.floor(Math.random() * invoices.length);

  return invoices[randomInvoice];
};

export const InvoiceService = {
  createInvoice,
  getInvoice,
};
