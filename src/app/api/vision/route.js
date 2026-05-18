import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";
import sharp from "sharp";
import employees from "@/data/employee.json";
import fs from "fs";
// import vision from "@google-cloud/vision";
// import fs from "fs";

const credentialsPath = "/etc/secrets/vision.json";

if (!fs.existsSync(credentialsPath)) {
  throw new Error("Vision credentials file not found on server");
}

const client = new vision.ImageAnnotatorClient({
  keyFilename: credentialsPath,
});
// // ✅ Debug (optional - remove later)
// console.log(
//   "VISION FILE EXISTS:",
//   fs.existsSync("/etc/secrets/vision.json")
// );

// // ✅ Use ONLY default Google auth (Render will pick credentials file automatically)
// const client = new vision.ImageAnnotatorClient();

function cleanOCRText(text) {
  return text
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function parseAttendance(text) {
  const lines = text.split("\n");
  let result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (
      line.includes("Total Days") ||
      line.includes("Employee") ||
      line.includes("Month") ||
      line.includes("WAGE")
    ) {
      continue;
    }

    const nameMatch = line.match(/[A-Z][a-z]+ [A-Z][a-z]+/);

    if (nameMatch) {
      const name = nameMatch[0];
      let combinedText = "";

      for (let j = i; j < i + 20 && j < lines.length; j++) {
        combinedText += lines[j];
      }

      const absentCount = (combinedText.match(/x/gi) || []).length;
      const totalDays = 30;
      const presentCount = totalDays - absentCount;

      const employee = employees.find(emp => emp.name === name);

      const dailyWage = employee?.dailyWage || 500;
      const totalSalary = presentCount * dailyWage;

      result.push({
        name,
        present: presentCount,
        absent: absentCount,
        dailyWage,
        totalSalary,
        department: employee?.department,
        qualification: employee?.qualification,
        experience: employee?.experience,
      });
    }
  }

  return result;
}

export async function POST(req) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({
        success: false,
        error: "No image provided",
      });
    }

    const originalBuffer = Buffer.from(image, "base64");

    const buffer = await sharp(originalBuffer)
      .grayscale()
      .normalize()
      .sharpen()
      .png()
      .toBuffer();

    const [result] = await client.textDetection({
      image: { content: buffer },
    });

    const rawText = result?.fullTextAnnotation?.text || "";

    return NextResponse.json({
      success: true,
      text: rawText,
      cleanedText: cleanOCRText(rawText),
      attendance: parseAttendance(rawText),
    });

  } catch (error) {
    console.error("VISION ERROR:", error);

    return NextResponse.json({
      success: false,
      error: error?.message || "Vision API failed",
    });
  }
}