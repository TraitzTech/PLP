import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient from "@/lib/apiClient";
import { newsletterService } from "@/services/newsletterService";

let mock: MockAdapter;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Define window and localStorage for Node environment
const originalWindow = global.window;

describe("newsletterService", () => {
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    localStorageMock.clear();
    
    // Setup window with localStorage
    global.window = {
      localStorage: localStorageMock,
    } as any;
  });

  afterEach(() => {
    mock.restore();
    global.window = originalWindow;
  });

  describe("subscribe", () => {
    it("successfully subscribes with email only", async () => {
      mock.onPost("/newsletter/subscribe").reply(201, {
        status: "success",
        message: "Thank you for subscribing! Check your email for a welcome message.",
        data: {
          email: "test@example.com",
          subscribed_at: "2026-02-06T10:00:00.000Z",
        },
      });

      const response = await newsletterService.subscribe({ email: "test@example.com" });
      
      expect(response.status).toBe("success");
      expect(response.message).toContain("Thank you for subscribing");
      expect(response.data?.email).toBe("test@example.com");
    });

    it("successfully subscribes with email and name", async () => {
      mock.onPost("/newsletter/subscribe").reply(201, {
        status: "success",
        message: "Thank you for subscribing! Check your email for a welcome message.",
        data: {
          email: "john@example.com",
          subscribed_at: "2026-02-06T10:00:00.000Z",
        },
      });

      const response = await newsletterService.subscribe({ 
        email: "john@example.com",
        name: "John Doe" 
      });
      
      expect(response.status).toBe("success");
    });

    it("returns info when already subscribed", async () => {
      mock.onPost("/newsletter/subscribe").reply(200, {
        status: "info",
        message: "You are already subscribed to our newsletter.",
      });

      const response = await newsletterService.subscribe({ email: "existing@example.com" });
      
      expect(response.status).toBe("info");
      expect(response.message).toContain("already subscribed");
    });

    it("handles resubscription", async () => {
      mock.onPost("/newsletter/subscribe").reply(200, {
        status: "success",
        message: "Welcome back! You have been resubscribed to our newsletter.",
      });

      const response = await newsletterService.subscribe({ email: "returning@example.com" });
      
      expect(response.status).toBe("success");
      expect(response.message).toContain("Welcome back");
    });
  });

  describe("checkStatus", () => {
    it("returns subscribed true for active subscriber", async () => {
      mock.onPost("/newsletter/status").reply(200, {
        status: "success",
        subscribed: true,
        subscribed_at: "2026-02-06T10:00:00.000Z",
      });

      const response = await newsletterService.checkStatus("active@example.com");
      
      expect(response.subscribed).toBe(true);
      expect(response.subscribed_at).toBeDefined();
    });

    it("returns subscribed false for non-subscriber", async () => {
      mock.onPost("/newsletter/status").reply(200, {
        status: "success",
        subscribed: false,
      });

      const response = await newsletterService.checkStatus("new@example.com");
      
      expect(response.subscribed).toBe(false);
    });
  });

  describe("localStorage helpers", () => {
    it("hasSeenPopup returns false when not set", () => {
      expect(newsletterService.hasSeenPopup()).toBe(false);
    });

    it("markPopupAsSeen sets localStorage value", () => {
      newsletterService.markPopupAsSeen();
      expect(localStorageMock.getItem("plp_newsletter_popup_seen")).toBe("true");
    });

    it("hasSeenPopup returns true after marking as seen", () => {
      newsletterService.markPopupAsSeen();
      expect(newsletterService.hasSeenPopup()).toBe(true);
    });

    it("isSubscribedLocally returns false when not set", () => {
      expect(newsletterService.isSubscribedLocally()).toBe(false);
    });

    it("markAsSubscribed sets localStorage value", () => {
      newsletterService.markAsSubscribed();
      expect(localStorageMock.getItem("plp_newsletter_subscribed")).toBe("true");
    });

    it("isSubscribedLocally returns true after marking as subscribed", () => {
      newsletterService.markAsSubscribed();
      expect(newsletterService.isSubscribedLocally()).toBe(true);
    });

    it("getVisitCount returns 0 initially", () => {
      expect(newsletterService.getVisitCount()).toBe(0);
    });

    it("incrementVisitCount increments and returns count", () => {
      expect(newsletterService.incrementVisitCount()).toBe(1);
      expect(newsletterService.incrementVisitCount()).toBe(2);
      expect(newsletterService.incrementVisitCount()).toBe(3);
    });

    it("getVisitCount returns correct count after increments", () => {
      newsletterService.incrementVisitCount();
      newsletterService.incrementVisitCount();
      expect(newsletterService.getVisitCount()).toBe(2);
    });
  });

  describe("shouldShowPopup", () => {
    it("returns false on first visit", () => {
      newsletterService.incrementVisitCount(); // First visit
      expect(newsletterService.shouldShowPopup()).toBe(false);
    });

    it("returns true on second visit if not seen and not subscribed", () => {
      newsletterService.incrementVisitCount(); // First visit
      newsletterService.incrementVisitCount(); // Second visit
      expect(newsletterService.shouldShowPopup()).toBe(true);
    });

    it("returns false if popup was already seen", () => {
      newsletterService.incrementVisitCount();
      newsletterService.incrementVisitCount();
      newsletterService.markPopupAsSeen();
      expect(newsletterService.shouldShowPopup()).toBe(false);
    });

    it("returns false if user is already subscribed", () => {
      newsletterService.incrementVisitCount();
      newsletterService.incrementVisitCount();
      newsletterService.markAsSubscribed();
      expect(newsletterService.shouldShowPopup()).toBe(false);
    });

    it("returns true on third visit if conditions are met", () => {
      newsletterService.incrementVisitCount();
      newsletterService.incrementVisitCount();
      newsletterService.incrementVisitCount();
      expect(newsletterService.shouldShowPopup()).toBe(true);
    });
  });
});
