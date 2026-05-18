import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";
import sharp from "sharp";
import employees from "@/data/employee.json";

const client = new vision.ImageAnnotatorClient({
  credentials: JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  ),
});

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
    ) continue;

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

      return result;
    }
  }

  return result;
}

export async function POST(req) {
  try {
    const { image } = await req.json();

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

    const rawText = result.fullTextAnnotation?.text || "";

    return NextResponse.json({
      success: true,
      text: rawText,
      cleanedText: cleanOCRText(rawText),
      attendance: parseAttendance(rawText),
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}