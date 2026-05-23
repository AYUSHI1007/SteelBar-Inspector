import { NextResponse } from "next/server";
import sharp from "sharp";
import employees from "@/data/employee.json";

export const runtime = "nodejs";

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
      line.includes("WAGE") ||
      line.includes("DAY")
    ) {
      continue;
    }

    const nameMatch =
      line.match(
        /([A-Z][a-z]+)\s([A-Z][a-z]+)/
      );
    if (
      !nameMatch ||
      line.includes("BOOK") ||
      line.includes("Days") ||
      line.includes("Month")
    ) {
      continue;
    }
    if (nameMatch) {

      const name =
        `${nameMatch[1]} ${nameMatch[2]}`;

      let combinedText = "";

      for (
        let j = i;
        j < i + 20 && j < lines.length;
        j++
      ) {
        combinedText += lines[j];
      }

      const absentCount =
        (combinedText.match(/x/gi) || []).length;

      const totalDays =
        text.includes("29 30 31") ? 31 : 30;

      const presentCount =
        totalDays - absentCount;

      const employee = employees.find(
        (emp) =>
          emp.name.toLowerCase() ===
          name.toLowerCase()
      );

      const dailyWage =
        employee?.dailyWage || 500;

      const totalSalary =
        presentCount * dailyWage;

      result.push({
        name,
        present: presentCount,
        absent: absentCount,
        dailyWage,
        totalSalary,
        department:
          employee?.department || "N/A",
        qualification:
          employee?.qualification || "N/A",
        experience:
          employee?.experience || "N/A",
      });

      break;
    }
  }

  return result;
}

export async function POST(req) {

  try {

    const { image } = await req.json();

    const base64Data =
      image.replace(
        /^data:image\/\w+;base64,/,
        ""
      );

    const originalBuffer =
      Buffer.from(base64Data, "base64");

    const buffer = await sharp(originalBuffer)
  .resize(2200)
  .grayscale()
  .normalise()
  .sharpen({
    sigma: 2,
    m1: 1,
    m2: 2,
  })
  .threshold(150)
  .png()
  .toBuffer();

    const formData = new FormData();

    formData.append(
      "base64Image",
      `data:image/jpeg;base64,${buffer.toString("base64")}`
    );

    formData.append("language", "eng");
formData.append("apikey", "helloworld");
formData.append("OCREngine", "2");
formData.append("scale", "true");
formData.append("isTable", "true");
    const response = await fetch(
      "https://api.ocr.space/parse/image",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    const rawText =
      data?.ParsedResults?.[0]?.ParsedText || "";

    return NextResponse.json({
      success: true,
      text: rawText,
      cleanedText: cleanOCRText(rawText),
      attendance: parseAttendance(rawText),
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}