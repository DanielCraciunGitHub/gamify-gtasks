const fs = require("fs").promises;
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

// Scopes for Google Tasks
const SCOPES = ["https://www.googleapis.com/auth/tasks"];
// Path to your credentials and the token you will generate
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");

/**
 * Reads previously authorized credentials from the save file.
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to derive user credentials.
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  // This helper triggers the "Loopback" flow:
  // 1. Opens browser 2. Starts local server 3. Gets Code 4. Exchanges for Token
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

// Example usage to test the connection
async function listTaskLists() {
  const auth = await authorize();
  const service = google.tasks({ version: "v1", auth });
  const res = await service.tasklists.list({
    maxResults: 10,
  });
  const taskLists = res.data.items;
  if (taskLists && taskLists.length > 0) {
    console.log("Task Lists:");
    taskLists.forEach((list) => {
      console.log(`${list.title} (${list.id})`);
    });
  } else {
    console.log("No task lists found.");
  }
}

listTaskLists().catch(console.error);
