import cron from "node-cron";
import Builder from "./models/Builder.js";
import Housing from "./models/Housing.js";
import Commercial from "./models/Commercial.js"

cron.schedule("0 0 * * *", async () => {
  console.log("Checking expired subscriptions...");

  const expiredBuilders = await Builder.find({
    "subscription.endDate": { $lt: new Date() },
    "subscription.plan": { $ne: "free" }
  });

  for (const builder of expiredBuilders) {
    await Builder.findByIdAndUpdate(builder._id, {
      subscription: {
        plan: "free",
        priority: 0,
        status: "expired",
        startDate: null,
        endDate: null
      }
    });

    await Housing.updateMany(
      { builderId: builder._id },
      {
        $set: {
          builderPlan: "free",
          builderPriority: 0
        }
      }
    );
    await Commercial.updateMany(
        { builderId:builder._id },
        {
        $set: {
            builderPlan: "free",
            builderPriority: 0
        }  
        }
    )

    console.log(`Builder ${builder._id} downgraded`);
  }
});
