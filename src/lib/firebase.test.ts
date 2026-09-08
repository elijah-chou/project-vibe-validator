import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInitializeApp = vi.fn().mockReturnValue({ name: "test-app" });
const mockGetApps = vi.fn().mockReturnValue([]);
const mockGetApp = vi.fn().mockReturnValue({ name: "existing-app" });
const mockGetFirestore = vi.fn().mockReturnValue({ type: "mock-db" });

vi.mock("firebase/app", () => ({
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: mockGetFirestore,
}));

describe("firebase client library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("initializes firebase app when no app exists", async () => {
    mockGetApps.mockReturnValue([]);
    const { app, db } = await import("./firebase");

    expect(mockInitializeApp).toHaveBeenCalled();
    expect(mockGetFirestore).toHaveBeenCalledWith(app);
    expect(db).toEqual({ type: "mock-db" });
  });

  it("uses existing firebase app when apps already exist", async () => {
    mockGetApps.mockReturnValue([{ name: "existing-app" }]);
    const { app } = await import("./firebase");

    expect(mockGetApp).toHaveBeenCalled();
    expect(app).toEqual({ name: "existing-app" });
  });
});
