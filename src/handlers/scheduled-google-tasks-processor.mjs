import { google } from "googleapis";

const tasksApi = google.tasks({
  version: "v1",
  auth: {
    apiKey: process.env.GOOGLE_TASKS_API_KEY,
  },
});

/**
 * A Lambda function triggered by a daily schedule.
 * Replace the placeholder logic with the Google Tasks -> Google Keep workflow.
 */
export const scheduledGoogleTasksProcessorHandler = async (event, context) => {
  console.info(
    JSON.stringify({
      message: "Scheduled Google Tasks processor triggered",
      event,
    }),
  );
};
