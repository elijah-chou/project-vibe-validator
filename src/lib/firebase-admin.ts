import admin from "firebase-admin";

if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

const firestore = (admin.apps.length
  ? admin.firestore()
  : {
      collection: () => ({
        add: async () => {
          throw new Error("Firebase admin is not initialized");
        },
      }),
    }) as unknown as admin.firestore.Firestore;

export { firestore };
