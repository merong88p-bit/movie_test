import fs from "fs/promises";
import path from "path";
import { User } from "../context/AuthContext";
import { Booking } from "../store/bookingStore";

interface PointHistory {
  id: string;
  userId: string;
  amount: number;
  type: "CHARGE" | "DEDUCT" | "REFUND";
  description: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  bookings: Booking[];
  pointHistories: PointHistory[];
}

const dbPath = path.join(process.cwd(), "src/lib/db.json");

// 동시 쓰기 충돌 방지를 위한 매우 가벼운 큐 락(Promise Chain Lock)
let writeLockChain = Promise.resolve();

export async function readDB(): Promise<DatabaseSchema> {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(data) as DatabaseSchema;
  } catch (e) {
    console.error("Read DB failed, initializing default schema", e);
    const defaultSchema: DatabaseSchema = { users: [], bookings: [], pointHistories: [] };
    await fs.writeFile(dbPath, JSON.stringify(defaultSchema, null, 2));
    return defaultSchema;
  }
}

export async function writeDB(data: DatabaseSchema): Promise<void> {
  // 쓰기 작업 직렬화(Serialization)를 통한 동시성 보장
  writeLockChain = writeLockChain.then(async () => {
    try {
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Write DB failed", e);
    }
  });
  return writeLockChain;
}
