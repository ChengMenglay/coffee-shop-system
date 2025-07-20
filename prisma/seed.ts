import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
async function main() {
  const user = {
    name: "ChengMenglay",
    password: await bcrypt.hash("123123123", 10),
    roleId: "cmcvim1jt00007k8c8ifmmsez",
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
