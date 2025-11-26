import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient from "@/lib/apiClient";
import { setToken, getToken, clearToken } from "@/lib/authToken";

describe("apiClient", () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(apiClient);
        clearToken();
    });

    it("attaches Authorization header when token is set", async () => {
        setToken("abc123");

        mock.onGet("/listings").reply((config: { headers: any; }) => {
            expect((config.headers as any)?.Authorization).toBe("Bearer abc123");
            return [200, { ok: true }];
        });

        const res = await apiClient.get("/listings");
        expect(res.status).toBe(200);
        expect(res.data).toEqual({ ok: true });
    });

    it("clears token on 401 responses", async () => {
        setToken("expiredToken");
        mock.onGet("/secure").reply(401, { message: "Unauthenticated" });

        await expect(apiClient.get("/secure")).rejects.toMatchObject({ status: 401, message: "Unauthenticated" });
        expect(getToken()).toBeNull();
    });
});
