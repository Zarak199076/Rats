import axios from "axios";

const discordApplicationId = process.env.APP_ID!;
const discordAPI = axios.create({
  baseURL: "https://discord.com/api/v10",
  headers: {
    "Authorization": "Bot " + process.env.DISCORD_TOKEN!
  }
});

async function patchIdentity(counter: number, userID: string) {
  const identity = {
    data: {
      dynamic: [
        { type: 1, name: "counter", value: String(counter) }
      ]
    }
  };

  try {
    await discordAPI.patch(
      `/applications/${discordApplicationId}/users/${userID}/identities/0/profile`,
      identity,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Success! Sent counter:", counter);
  } catch (error: any) {
    console.error("ERROR Discord API Patch failed:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status, "Data:", JSON.stringify(error.response.data));
    }
    throw error;
  }
}

async function fetchCounter(rawUrl: string): Promise<number> {
  const res = await axios.get(rawUrl, {
    headers: { "Cache-Control": "no-cache" },
    params: { t: Date.now() }
  });
  return res.data.total ?? 0;
}

async function run() {
  const userID = process.env.DISCORD_USER_ID!;
  const COUNTER_URL = process.env.COUNTER_RAW_URL!;

  const counter = await fetchCounter(COUNTER_URL);
  await patchIdentity(counter, userID);
}

run();
