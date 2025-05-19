import { MongoClient, Collection } from "mongodb";

// Define the shape of a vital sign record
interface VitalSignRecord {
  heartRate: number;
  temperature: number;
  bloodOxygen: number;
  timestamp: Date;
}

// Define the shape of a user document, assuming vitalStats is an array of VitalSignRecord
interface UserDocument {
  _id: number; // Assuming _id is a number for user identification
  fullName: string; // Example existing property
  // ... other user properties
  vitalStats?: VitalSignRecord[]; // The property to be updated
}

// MongoDB Connection URI
const MONGODB_URI = "mongodb://localhost:27017"; // Replace with your MongoDB URI
const DB_NAME = "gpdb"; // The specified database name
const COLLECTION_NAME = "users"; // The specified collection name

// --- Helper function to generate a single data point with variety ---
const generateSingleDataPoint = (baseTime: Date): VitalSignRecord => {
  let heartRate: number;
  let bloodOxygen: number;
  let temperature: number;

  // Introduce some variability and occasional "unhealthy" values
  const diceRoll = Math.random();

  if (diceRoll < 0.05) {
    // 5% chance of critical values
    heartRate = Math.floor(Math.random() * (120 - 40 + 1)) + 40; // Very high or very low
    bloodOxygen = Math.floor(Math.random() * (94 - 85 + 1)) + 85; // Low SpO2
    temperature = parseFloat((Math.random() * (40.0 - 35.0) + 35.0).toFixed(1)); // Fever or hypothermia
  } else if (diceRoll < 0.25) {
    // 20% chance of warning values
    heartRate = Math.floor(Math.random() * (110 - 50 + 1)) + 50; // High or low
    bloodOxygen = Math.floor(Math.random() * (96 - 93 + 1)) + 93; // Mildly low SpO2
    temperature = parseFloat((Math.random() * (37.9 - 36.0) + 36.0).toFixed(1)); // Elevated or slightly low
  } else {
    // 75% chance of normal values
    heartRate = Math.floor(Math.random() * (95 - 65 + 1)) + 65; // Healthy range
    bloodOxygen = Math.floor(Math.random() * (100 - 97 + 1)) + 97; // Normal SpO2
    temperature = parseFloat((Math.random() * (37.2 - 36.5) + 36.5).toFixed(1)); // Normal temp
  }

  return {
    heartRate,
    temperature,
    bloodOxygen,
    timestamp: baseTime,
  };
};

// --- Function to generate a full dataset ---
const generateFakeVitalSignsData = (
  days: number = 7,
  readingsPerHour: number = 1
): VitalSignRecord[] => {
  const data: VitalSignRecord[] = [];
  const now = new Date();
  const totalHours = days * 24;

  for (let i = 0; i < totalHours; i++) {
    for (let j = 0; j < readingsPerHour; j++) {
      const timestamp = new Date(
        now.getTime() -
          (totalHours - 1 - i) * 60 * 60 * 1000 - // Hours ago
          j * (60 / readingsPerHour) * 60 * 1000 // Minutes within the hour
      );
      data.push(generateSingleDataPoint(timestamp));
    }
  }
  return data;
};

// --- Function to update a user document in MongoDB ---
async function updateUserData() {
  let client: MongoClient | undefined;
  const targetUserId = 2; // The specified user _id

  try {
    client = await MongoClient.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully!");
    const db = client.db(DB_NAME);
    const collection: Collection<UserDocument> = db.collection(COLLECTION_NAME);

    // Clear existing vitalStats for the target user
    const clearResult = await collection.updateOne(
      { _id: targetUserId },
      { $unset: { vitalStats: "" } } // Use $unset to remove the vitalStats field
    );

    if (clearResult.matchedCount > 0) {
      console.log(
        `Successfully cleared existing vitalStats for user with _id: ${targetUserId}.`
      );
    } else {
      console.log(
        `No user found with _id: ${targetUserId} to clear vitalStats.`
      );
    }
    
    // Generate the fake vital signs data
    const fakeVitalStats = generateFakeVitalSignsData(7, 1); // 7 days of hourly data
    console.log(
      `Generated ${fakeVitalStats.length} fake vital sign records for user ${targetUserId}.`
    );

    // Update the user document
    const result = await collection.updateOne(
      { _id: targetUserId },
      { $set: { vitalStats: fakeVitalStats } },
      { upsert: false } // Set to true if you want to create the user if _id:2 doesn't exist
    );

    if (result.matchedCount > 0) {
      console.log(`Successfully updated user with _id: ${targetUserId}.`);
    } else {
      console.log(
        `No user found with _id: ${targetUserId}. Data was not inserted.`
      );
    }
  } catch (err) {
    console.error("Error connecting to or updating data in MongoDB:", err);
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed.");
    }
  }
}

// --- Run the data update ---
updateUserData();
