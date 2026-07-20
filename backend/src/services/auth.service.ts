import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../middlewares/error-handler.js";
import {
  passwordResetRepository,
  sessionRepository,
  toPublicUser,
  userRepository,
} from "../repositories/user.repository.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../validators/auth.validators.js";
import {
  createRawToken,
  hashPassword,
  hashToken,
  passwordResetExpiryDate,
  refreshExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken,
} from "../utils/crypto.js";

const REFRESH_COOKIE = "refreshToken";

function clientMeta(req: Request) {
  return {
    userAgent: req.get("user-agent") ?? undefined,
    ipAddress: req.ip,
  };
}

function setRefreshCookie(res: Response, token: string, rememberMe: boolean) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });
}

async function issueTokens(
  user: { id: string; email: string; name: string },
  req: Request,
  res: Response,
  rememberMe: boolean,
) {
  const session = await sessionRepository.create({
    userId: user.id,
    refreshTokenHash: "pending",
    expiresAt: refreshExpiryDate(rememberMe),
    ...clientMeta(req),
  });

  const refreshToken = signRefreshToken({ sub: user.id, sid: session.id }, rememberMe);
  await sessionRepository.updateTokenHash(
    session.id,
    hashToken(refreshToken),
    refreshExpiryDate(rememberMe),
  );

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  });

  setRefreshCookie(res, refreshToken, rememberMe);

  return { accessToken, sessionId: session.id };
}

export const authService = {
  async register(input: RegisterInput, req: Request, res: Response) {
    const email = input.email.toLowerCase();
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(409, "E-mail já cadastrado");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email,
      passwordHash,
    });

    const { accessToken } = await issueTokens(user, req, res, false);

    return {
      user: toPublicUser(user),
      accessToken,
    };
  },

  async login(input: LoginInput, req: Request, res: Response) {
    const email = input.email.toLowerCase();
    const user = await userRepository.findByEmail(email);

    if (!user || user.status === "INACTIVE") {
      throw new AppError(401, "Credenciais inválidas");
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "Credenciais inválidas");
    }

    const { accessToken } = await issueTokens(user, req, res, input.rememberMe);

    return {
      user: toPublicUser(user),
      accessToken,
    };
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) {
      throw new AppError(401, "Refresh token ausente");
    }

    let payload: { sub: string; sid: string };
    try {
      payload = verifyRefreshToken(token);
    } catch {
      clearRefreshCookie(res);
      throw new AppError(401, "Refresh token inválido");
    }

    const session = await sessionRepository.findById(payload.sid);
    if (!session || session.userId !== payload.sub) {
      clearRefreshCookie(res);
      throw new AppError(401, "Sessão inválida");
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await sessionRepository.deleteById(session.id);
      clearRefreshCookie(res);
      throw new AppError(401, "Sessão expirada");
    }

    if (session.refreshTokenHash !== hashToken(token)) {
      await sessionRepository.deleteById(session.id);
      clearRefreshCookie(res);
      throw new AppError(401, "Refresh token revogado");
    }

    const rememberMe =
      session.expiresAt.getTime() - Date.now() > 14 * 24 * 60 * 60 * 1000;

    const refreshToken = signRefreshToken(
      { sub: session.user.id, sid: session.id },
      rememberMe,
    );
    await sessionRepository.updateTokenHash(
      session.id,
      hashToken(refreshToken),
      refreshExpiryDate(rememberMe),
    );
    setRefreshCookie(res, refreshToken, rememberMe);

    const accessToken = signAccessToken({
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });

    return {
      user: toPublicUser(session.user),
      accessToken,
    };
  },

  async logout(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        await sessionRepository.deleteById(payload.sid);
      } catch {
        // ignore invalid token on logout
      }
    }
    clearRefreshCookie(res);
    return { ok: true };
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "Usuário não encontrado");
    }
    return { user: toPublicUser(user) };
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const email = input.email.toLowerCase();
    const user = await userRepository.findByEmail(email);

    // Always return the same shape to avoid email enumeration
    const base = {
      message: "Se o e-mail existir, enviaremos instruções de recuperação.",
    };

    if (!user) {
      return base;
    }

    await passwordResetRepository.invalidateAllForUser(user.id);

    const rawToken = createRawToken();
    await passwordResetRepository.create({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: passwordResetExpiryDate(),
    });

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    if (env.NODE_ENV === "development") {
      console.log(`[password-reset] ${user.email}: ${resetUrl}`);
      return {
        ...base,
        resetToken: rawToken,
        resetUrl,
      };
    }

    return base;
  },

  async resetPassword(input: ResetPasswordInput) {
    const record = await passwordResetRepository.findValidByHash(
      hashToken(input.token),
    );
    if (!record) {
      throw new AppError(400, "Token de recuperação inválido ou expirado");
    }

    const passwordHash = await hashPassword(input.password);
    await userRepository.updatePassword(record.userId, passwordHash);
    await passwordResetRepository.markUsed(record.id);
    await sessionRepository.deleteByUserId(record.userId);

    return { message: "Senha atualizada com sucesso" };
  },
};
