import { db } from '../db/index.ts';
import { teamTasks, organizations } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

async function testTaskPersistence() {
  console.log("Starting testTaskPersistence...");
  
  // 1. Create org
  const [org] = await db.insert(organizations).values({ name: "Test Org" }).returning();
  console.log("Org created:", org.id);

  // 2. Create task
  const [task] = await db.insert(teamTasks).values({
    orgId: org.id,
    title: "Test Task",
    description: "Test Description"
  }).returning();
  console.log("Task created:", task.id);

  // 3. Verify
  const [fetchedTask] = await db.select().from(teamTasks).where(eq(teamTasks.id, task.id));
  if (fetchedTask && fetchedTask.title === "Test Task") {
    console.log("Persistence test passed!");
  } else {
    throw new Error("Persistence test failed!");
  }
}

testTaskPersistence().catch(err => {
  console.error(err);
  process.exit(1);
});
