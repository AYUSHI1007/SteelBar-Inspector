"use client";
import { useState } from "react";

export default function AttendancePage() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [cleanedText, setCleanedText] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);

  // 🔥 Fetch employee from JSON file
  const getEmployee = async (name) => {
    try {
      const res = await fetch("/data/employee.json");
      const data = await res.json();

      const emp = data.find(
        (e) => e.name.toLowerCase() === name.toLowerCase()
      );

      setEmployeeData(emp || null);
    } catch (err) {
      console.log("Employee fetch error:", err);
    }
  };

  const handleUpload = async (e) => {
    console.log("UPLOAD TRIGGERED");

    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];

      setLoading(true);
      setText("");

      console.log("BEFORE FETCH");

      const res = await fetch("/api/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64 }),
      });

      console.log("AFTER FETCH");

      const data = await res.json();

      setLoading(false);

      if (!data.success) {
        setText("Error: " + data.error);
        return;
      }

      setText(data.text);
      setCleanedText(data.cleanedText);
      setAttendance(data.attendance);

      console.log("ATTENDANCE:", data.attendance);

      // 🔥 Load employee from JSON using first detected name
      if (data.attendance?.length > 0) {
        getEmployee(data.attendance[0].name);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-green-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Attendance + Wage System
      </h1>

      <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">

        {/* IMAGE UPLOAD */}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
        />

        {/* IMAGE PREVIEW */}
        {image && (
          <img
            src={image}
            className="mt-4 w-full border rounded"
          />
        )}

        {/* LOADING */}
        {loading && (
          <p className="mt-4 text-blue-600 font-semibold">
            Processing...
          </p>
        )}

        {/* RAW TEXT */}
        {text && (
          <div className="mt-6">
            <h2 className="font-bold text-lg mb-2">
              Extracted Text
            </h2>

            <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
              {text}
            </pre>
          </div>
        )}

        {/* CLEANED TEXT */}
        {cleanedText && (
          <div className="mt-6">
            <h2 className="font-bold text-lg mb-2">
              Cleaned Text
            </h2>

            <pre className="bg-blue-50 p-3 rounded whitespace-pre-wrap">
              {cleanedText}
            </pre>
          </div>
        )}

        {/* ATTENDANCE RESULT */}
        {attendance.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">
              Attendance Result
            </h2>

            {attendance.map((person, index) => (
              <div
                key={index}
                className="bg-gray-100 p-4 rounded mb-3 shadow"
              >
                <p><strong>Name:</strong> {person.name}</p>
                <p><strong>Present Days:</strong> {person.present}</p>
                <p><strong>Absent Days:</strong> {person.absent}</p>
                <p><strong>Department:</strong> {person.department}</p>
                <p><strong>Qualification:</strong> {person.qualification}</p>
                <p><strong>Experience:</strong> {person.experience} years</p>
                <p><strong>Daily Wage:</strong> ₹{person.dailyWage}</p>
                <p><strong>Total Salary:</strong> ₹{person.totalSalary}</p>
              </div>
            ))}
          </div>
        )}

        {/* EMPLOYEE DETAILS FROM JSON */}
        {employeeData && (
          <div className="mt-6 bg-blue-100 p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2">
              Employee Details (From JSON)
            </h2>

            <p><strong>Name:</strong> {employeeData.name}</p>
            <p><strong>Department:</strong> {employeeData.department}</p>
            <p><strong>Qualification:</strong> {employeeData.qualification}</p>
            <p><strong>Experience:</strong> {employeeData.experience} years</p>
            <p><strong>Daily Wage:</strong> ₹{employeeData.dailyWage}</p>
          </div>
        )}

      </div>
    </div>
  );
}