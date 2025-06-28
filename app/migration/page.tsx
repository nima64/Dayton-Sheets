'use client';

import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/firebase/firebase-client";
import { doc, setDoc } from "firebase/firestore";

export default function MigrationPage() {
  useEffect(() => {
    const writeStructure = async () => {
      const testBuyerId = "testbuyers";
      const testSellerId = "testsellers";
      const templateId = "template123";

      const templateRows = [
        {
          rowId: "r1",
          make: "Bixolon",
          model: "Srp-F310II",
          config: "SRP-F310IICOSK",
          description: "Thermal receipt printer"
        },
        {
          rowId: "r2",
          make: "Brady",
          model: "BMP51",
          config: "139814",
          description: "Portable label printer"
        }
      ];

      const sellerCopyRows = [
        {
          rowId: "r1",
          price: 199.99,
          qty: 5,
          note: "In stock"
        },
        {
          rowId: "r2",
          price: 239.50,
          qty: 2,
          note: "Ships in 3 days"
        }
      ];

      const now = new Date().toISOString();

      // Buyer sheet reference
      const buyerTemplateRef = doc(
        db,
        "buyers",
        testBuyerId,
        "template-sheets",
        templateId
      );

      // Seller copy reference
      const sellerCopyRef = doc(
        db,
        "sellers",
        testSellerId,
        "copies",
        templateId
      );

      // Metadata reference
      const metadataRef = doc(db, "sheets-metadata", templateId);

      try {
        // 1. Buyer template
        await setDoc(buyerTemplateRef, {
          title: "June RFQ",
          createdAt: now,
          rows: templateRows
        });

        // 2. Seller copy
        await setDoc(sellerCopyRef, {
          templateId: templateId,
          buyerId: testBuyerId,
          lastSynced: now,
          rows: sellerCopyRows
        });

        // 3. Global metadata entry
        await setDoc(metadataRef, {
          templateId: templateId,
          buyerId: testBuyerId,
          title: "June RFQ",
          createdAt: now,
          status: "open",
          sellerIds: ["sellerA", "sellerB"],
          category: "Printers"
        });

        console.log("✅ Test buyer, seller, and metadata written to Firestore.");
      } catch (error) {
        console.error("❌ Failed to write structure:", error);
      }
    };

    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        writeStructure();
      } else {
        console.warn("User not logged in for migration write.");
      }
    });
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-bold">Writing Test Firestore Structure...</h1>
    </div>
  );
}
