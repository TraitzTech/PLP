import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient from "@/lib/apiClient";
import { authService } from "@/services/authService";
import { getToken, clearToken } from "@/lib/authToken";

let mock: MockAdapter;

describe("authService", () => {
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    clearToken();
  });

  it("login stores token and returns data", async () => {
    mock.onPost("/login").reply(200, { user: "user-json", token: "t123" });
    const res = await authService.login({ email: "a@b.com", password: "pass" });
    expect(res.token).toBe("t123");
    expect(getToken()).toBe("t123");
  });

  it("logout clears token and returns message", async () => {
    mock.onPost("/logout").reply(200, { message: "Logged out successfully" });
    const res = await authService.logout();
    expect(res.message).toBe("Logged out successfully");
    expect(getToken()).toBeNull();
  });

  it("register stores token and returns data", async () => {
    mock.onPost("/register").reply(201, { user: "user-json", token: "r123", token_type: "Bearer" });
    const res = await authService.register({
      name: "John",
      email: "john@example.com",
      phone: "123",
      password: "secret",
      password_confirmation: "secret",
    });
    expect(res.token).toBe("r123");
    expect(res.token_type).toBe("Bearer");
    expect(getToken()).toBe("r123");
  });

  it("send email verification notification returns status", async () => {
    mock.onPost("/email/verification-notification").reply(200, { status: "verification-link-sent" });
    const res = await authService.sendVerificationEmail();
    expect(res.status).toBe("verification-link-sent");
  });

  it("verifyEmail returns success message", async () => {
    mock.onGet("/verify-email/1/abc").reply(200, { message: "email verified successfully" });
    const res = await authService.verifyEmail({ id: "1", hash: "abc" });
    expect(res.message).toBe("email verified successfully");
  });

  it("forgotPassword returns status", async () => {
    mock.onPost("/forgot-password").reply(200, { status: "ok" });
    const res = await authService.forgotPassword({ email: "a@b.com" });
    expect(res.status).toBe("ok");
  });

  it("resetPassword returns status", async () => {
    mock.onPost("/reset-password").reply(200, { status: "password-reset" });
    const res = await authService.resetPassword({
      token: "tok",
      email: "a@b.com",
      password: "p1",
      password_confirmation: "p1",
    });
    expect(res.status).toBe("password-reset");
  });
});
