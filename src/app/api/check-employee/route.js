import { NextResponse } from "next/server";

import employees from "@/data/employee.json";

export async function POST(req) {

  const { name } = await req.json();

  const employee = employees.find(
    (emp) =>
      emp.name.toLowerCase() ===
      name.toLowerCase()
  );

  if (employee) {

    return NextResponse.json({
      exists: true,
      employee,
    });
  }

  return NextResponse.json({
    exists: false,
  });
}