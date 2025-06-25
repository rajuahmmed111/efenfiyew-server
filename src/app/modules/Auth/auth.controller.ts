import { Request, Response } from "express";
import httpStatus from "http-status";
import { string } from "zod";
import config from "../../../config";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";
import ApiError from "../../../errors/ApiErrors";

// login user
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);

  res.cookie("token", result.accessToken, {
    secure: config.env === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

// refresh token
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return sendResponse(res, {
      statusCode: 403,
      success: false,
      message: "Refresh token not found",
      data: undefined,
    });
  }

  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged In successfully",
    data: result,
  });
});

// logout user
const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Successfully logged out",
    data: null,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields");
  }

  const result = await AuthServices.changePassword(
    userId,
    oldPassword,
    newPassword
  );

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Password changed successfully",
    data: result,
  });
});


export const AuthController = {
  loginUser,
  refreshToken,
  logoutUser,
  changePassword,
};
