import { UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import httpStatus from "http-status";
import { JwtPayload, Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpars/emailSender";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import { ILoginResponse } from "./auth.interface";

// login user
const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<ILoginResponse> => {
  const userData = await prisma.user.findUnique({
    where: { email: payload.email, status: UserStatus.ACTIVE },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (userData.status === UserStatus.INACTIVE) {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is inactive");
  }

  if (!payload.password || !userData.password) {
    throw new Error("Password is required");
  }

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password incorrect!");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  const result = {
    accessToken,
    refreshToken,
  };

  return result;
};

// refresh token
const refreshToken = async (token: string) => {
  let decodedData;

  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as string
    ) as JwtPayload;
    console.log(decodedData);
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your not authorized");
  }

  const isUserExist = await prisma.user.findUnique({
    where: {
      email: decodedData?.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const newAccessToken = jwtHelpers.generateToken(
    { id: isUserExist.id, email: isUserExist.email, role: isUserExist.role },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};
 
// change password
const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: userId,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const isPasswordMatch: boolean = await bcrypt.compare(
    oldPassword,
    userData.password
  );
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password changed successfully",
  };
};



export const AuthServices = {
  loginUser,
  refreshToken,
  changePassword,
};
