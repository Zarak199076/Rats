import dotenv from 'dotenv';
import axios from "axios";
dotenv.config();

const discordApplicationId = process.env.APP_ID!;
const discordAPI = axios.create({
  baseURL: "https://discord.com/api/v10",
  headers: {
    "Authorization": "Bot " + process.env.DISCORD_TOKEN!
  }
});

export async function patchIdentity(identity: any, userID: string) {
  try {
    await discordAPI.patch(
      `/applications/${discordApplicationId}/users/${userID}/identities/0/profile`,
      identity,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error: any) {
    console.error(`ERROR Discord API Patch failed: ${error.message}`);
    if (error.response) {
      console.error(`ERROR Status: ${error.response.status} | Data:`, JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

export async function fetchCounter(rawUrl: string): Promise<number> {
  try {
    const res = await axios.get(rawUrl, {
      headers: { "Cache-Control": "no-cache" },
      params: { t: Date.now() },
    });
    return res.data.total ?? 0;
  } catch (error: any) {
    console.error(`ERROR Failed to fetch counter: ${error.message}`);
    return 0;
  }
}

export function toIdentity(counter: number) {
    return {
        data: {
            dynamic: [
                { type: 1, name: "counter", value: String(counter) }
            ]
        }
    }
}

async function run() {
  const userID = process.env.DISCORD_USER_ID!;
  const COUNTER_URL = process.env.COUNTER_RAW_URL!;

  const counter = await fetchCounter(COUNTER_URL);

  const identity = JSON.stringify(toIdentity(counter));
  console.log("Identity to patch:", identity);

  await patchIdentity(identity, userID);
}

run();
