import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
async function main() {
  const user = {
    name: "ChengMenglay",
    password: await bcrypt.hash("123123123", 10),
    roleId: "cmdzdjb9n0000f8io75h7k0yb",
  };
  await prisma.user.create({ data: user });
  console.log("✅ User seeded successfully!");
}
main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
