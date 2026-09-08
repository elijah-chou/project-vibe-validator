import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInitializeApp = vi.fn();
const mockCert = vi.fn();
const mockFirestore = vi.fn().mockReturnValue({ collection: vi.fn() });
const mockApps: unknown[] = [];

vi.mock("firebase-admin", () => ({
  default: {
    apps: mockApps,
    initializeApp: mockInitializeApp,
    credential: {
      cert: mockCert,
    },
    firestore: mockFirestore,
  },
}));

describe("firebase-admin library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockApps.length = 0;
  });

  it("initializes firebase-admin when configured and no apps exist", async () => {
    process.env.FIREBASE_PROJECT_ID = "test-project";
    process.env.FIREBASE_CLIENT_EMAIL = "test@example.com";
    process.env.FIREBASE_PRIVATE_KEY = "test\\nkey";

    mockInitializeApp.mockImplementationOnce(() => {
      mockApps.push({ name: "app" });
    });

    await import("./firebase-admin");

    expect(mockCert).toHaveBeenCalledWith({
      projectId: "test-project",
      clientEmail: "test@example.com",
      privateKey: "test\nkey",
    });
    expect(mockInitializeApp).toHaveBeenCalled();
    expect(mockFirestore).toHaveBeenCalled();
  });

  it("falls back gracefully when not configured", async () => {
    delete process.env.FIREBASE_PROJECT_ID;

    const { firestore } = await import("./firebase-admin");

    expect(mockInitializeApp).not.toHaveBeenCalled();
    await expect(firestore.collection("test").add({})).rejects.toThrow(
      "Firebase admin is not initialized"
    );
  });

  it("handles initialization error gracefully", async () => {
    process.env.FIREBASE_PROJECT_ID = "test-project";
    mockInitializeApp.mockImplementationOnce(() => {
      throw new Error("Init failed");
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await import("./firebase-admin");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Firebase admin initialization error",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});
