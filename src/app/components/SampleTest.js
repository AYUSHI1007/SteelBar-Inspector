"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { CgOpenCollective } from "react-icons/cg";
export default function SampleList() {
  Chart.register(...registerables, annotationPlugin);
  async function generatePDF(samples) {
    return new Promise((resolve) => {
    const doc = new jsPDF();
    const formData = JSON.parse(localStorage.getItem("formData")) || {};
    const {
      heatno = "N/A",
      grade = "N/A",
      base = "N/A",
      // side = "N/A",
      mailid=  "N/A",
      maxsize = "N/A",
      minsize = "N/A",
      ovality = "N/A",
      time = "N/A",
      shift = "N/A",
      rollingdate = "N/A",
    } = formData;

    const parsed = {
      base: parseFloat(base),
      minsize: parseFloat(minsize),
      maxsize: parseFloat(maxsize),
      mailid: mailid,
    };

    doc.setFontSize(18);
    doc.text("Sample Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date of Rolling: ${rollingdate}`, 14, 30);
    doc.text(`Shift: ${shift}`, 14, 36);
    doc.text(`Time: ${time}`, 14, 42);
    doc.text(`Heat No: ${heatno}`, 14, 48);
    doc.text(`Grade: ${grade}`, 14, 54);
    doc.text(`Base Size: ${base}`, 14, 60);
    doc.text(`Min Size: ${minsize}`, 14, 66);
    doc.text(`Max Size: ${maxsize}`, 14, 72);
    doc.text(`Ovality: ${ovality}`, 14, 78);

    const columns = [
      { header: "Top/Bottom", dataKey: "topbottom" },
      { header: "Status1", dataKey: "statusIcon1" },
      { header: "Side", dataKey: "side" },
      { header: "Status2", dataKey: "statusIcon2" },
      { header: "Shoulder1", dataKey: "shoulder1" },
      { header: "Status3", dataKey: "statusIcon3" },
      { header: "Shoulder2", dataKey: "shoulder2" },
      { header: "Status4", dataKey: "statusIcon4" },
      { header: "Ovality", dataKey: "ovality" },
      { header: "Inspection Summary", dataKey: "inspection" },
    ];

    const rows = samples.map((item) => {
      const sample = item.sample;
      const inspectionSummary = Object.entries(sample.inspection || {})
        .map(([key, val]) => `${key}: ${val}`)
        .join(", ");

      const inRangeCheck1 = isInRange(
        sample.topbottom,
        parsed.base,
        parsed.minsize,
        parsed.maxsize
      );
      const inRangeCheck2 = isInRange(
        sample.side,
        parsed.base,
        parsed.minsize,
        parsed.maxsize
      );
      const inRangeCheck3 = isInRange(
        sample.shoulder1,
        parsed.base,
        parsed.minsize,
        parsed.maxsize
      );
      const inRangeCheck4 = isInRange(
        sample.shoulder2,
        parsed.base,
        parsed.minsize,
        parsed.maxsize
      );
      const range2Check = isInRange2(
        sample.topbottom,
        sample.side,
        sample.shoulder1,
        sample.shoulder2,
        ovality
      );

      return {
        topbottom: sample.topbottom || "",
        side: sample.side || "",
        shoulder1: sample.shoulder1 || "",
        shoulder2: sample.shoulder2 || "",
        ovality: {
          content: range2Check.diff?.toFixed(2) || "N/A",
          styles: { textColor: range2Check.ok ? "green" : "red" },
        },
        inspection: inspectionSummary,
        statusIcon1: {
          content: inRangeCheck1 ? "Ok" : "Not Ok",
          styles: { textColor: inRangeCheck1 ? "green" : "red" },
        },
        statusIcon2: {
          content: inRangeCheck2 ? "Ok" : "Not Ok",
          styles: { textColor: inRangeCheck2 ? "green" : "red" },
        },
        statusIcon3: {
          content: inRangeCheck3 ? "Ok" : "Not Ok",
          styles: { textColor: inRangeCheck3 ? "green" : "red" },
        },
        statusIcon4: {
          content: inRangeCheck4 ? "Ok" : "Not Ok",
          styles: { textColor: inRangeCheck4 ? "green" : "red" },
        },
      };
    });
    autoTable(doc, {
      startY: 84,
      columns,
      body: rows,
      styles: { fontSize: 8 },
      margin: { left: 10, right: 10 },
      didDrawPage: function (data) {
        
        const finalY = data.cursor.y + 10;

        const canvas = document.createElement("canvas");
        canvas.id = "runChartCanvas";
        canvas.width = 600;
        
        const chartWidth = 500; // Increased width
        const chartHeight = 300; // Increased height
        canvas.width = chartWidth * 2; // Higher DPI
        canvas.height = chartHeight * 2; // Higher DPI
        canvas.style.width = `${chartWidth}px`;
        canvas.style.height = `${chartHeight}px`;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext("2d");

        const labels = samples.map((_, i) => `S${i + 1}`);
        const topbottomData = samples.map(
          (item) => item.sample?.topbottom || 0
        );
        const sideData = samples.map((item) => item.sample?.side || 0);
        const shoulder1Data = samples.map(
          (item) => item.sample?.shoulder1 || 0
        );
        const shoulder2Data = samples.map(
          (item) => item.sample?.shoulder2 || 0
        );
        const minsizeData = new Array(samples.length).fill(
          parsed.base - parsed.minsize
        );
        const maxsizeData = new Array(samples.length).fill(
          parsed.base + parsed.maxsize
        );

        new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Top/Bottom",
                data: topbottomData,
                borderColor: "blue",
                fill: false,
              },
              {
                label: "Side",
                data: sideData,
                borderColor: "orange",
                fill: false,
              },
              {
                label: "Shoulder1",
                data: shoulder1Data,
                borderColor: "green",
                fill: false,
              },
              {
                label: "Shoulder2",
                data: shoulder2Data,
                borderColor: "purple",
                fill: false,
              },
              {
                label: "Minsize",
                data: minsizeData,
                borderColor: "red",
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                borderDash: [5, 5],
              },
              {
                label: "Maxsize",
                data: maxsizeData,
                borderColor: "red",
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                borderDash: [5, 5],
              },
            ],
          },
          options: {
            responsive: false,
            plugins: {
              title: {
                display: true,
                text: "Run Chart",
              },
              annotation: {
                annotations: {
                  minLine: {
                    type: "line",
                    yMin: parsed.minsize,
                    yMax: parsed.minsize,
                    borderColor: "red",
                    borderWidth: 2,
                    label: {
                      content: `Min Size (${parsed.minsize})`,
                      enabled: true,
                      position: "start",
                    },
                  },
                  maxLine: {
                    type: "line",
                    yMin: parsed.maxsize,
                    yMax: parsed.maxsize,
                    borderColor: "red",
                    borderWidth: 2,
                    label: {
                      content: `Max Size (${parsed.maxsize})`,
                      enabled: true,
                      position: "start",
                    },
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: false,
                min: parsed.base - parsed.minsize - 0.5,
                max: parsed.base + parsed.maxsize + 1.0,
              },
            },
          },
        });

        setTimeout(() => {
          const imgData = canvas.toDataURL("image/png");
          
   let chartWidth = 180; // mm - now mutable
  let chartHeight = 100; // mm - now mutable
  
  console.log('New page size:', {
    width: doc.internal.pageSize.getWidth(),
    height: doc.internal.pageSize.getHeight()
  });
  
  if (chartWidth > doc.internal.pageSize.getWidth() - 30) {
    console.warn('Chart too wide for page! Reducing width...');
    chartWidth = doc.internal.pageSize.getWidth() - 30; // Now this will work
  }
  
  if (chartHeight > doc.internal.pageSize.getHeight() - 30) {
    console.warn('Chart too tall for page! Reducing height...');
    chartHeight = doc.internal.pageSize.getHeight() - 30; // Now this will work
  }
doc.addPage();
           doc.addImage({
            imageData: imgData,
            x: 15, // Adjusted position
            y: 0,
            width: chartWidth , // Convert px to mm (96dpi to mm)
            height: chartHeight // Convert px to mm
          });
          document.body.removeChild(canvas);
          resolve(doc);
          console.log("PDF Data:", rows);
        }, 1000); 
      }
    });
  });
}

  const initialSample = {
    topbottom: "",
    side: "",
    shoulder1: "",
    shoulder2: "",
    inspection: {
      liteScratch: "",
      deepScratch: "",
      overFilling: "",
      underFilling: "",
      seamsCrack: "",
      fireCrack: "",
      burntSurface: "",
      surfaceRoughness: "",
      lap: "",
      rollCross: "",
      rollguideMark: "",
      rollingChips: "",
      MechanicalMark: "",
    },
  };

  const [sample, setSample] = useState(initialSample);
  const [samples, setSamples] = useState([]);
  const [range, setRange] = useState({});
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const sampleString = localStorage.getItem("samples");
    if (sampleString) {
      setSamples(JSON.parse(sampleString));
    }

    const saved = localStorage.getItem("formData");
    if (saved) {
      try {
        setRange(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse range", err);
      }
    }
  }, []);

  const saveToLS = (data = samples) => {
    localStorage.setItem("samples", JSON.stringify(data));
  };

  const handleEdit = (e, id) => {
    const s = samples.find((i) => i.id === id);
    setSample(s.sample);
    const newSamples = samples.filter((item) => item.id !== id);
    setSamples(newSamples);
    saveToLS(newSamples);
  };

  const handleDelete = (e, id) => {
    const newSamples = samples.filter((item) => item.id !== id);
    setSamples(newSamples);
    saveToLS(newSamples);
  };

  const handleAdd = () => {
    const newSample = { id: uuidv4(), sample, isCompleted: false };
    const updated = [...samples, newSample];
    setSamples(updated);
    setSample(initialSample);
    saveToLS(updated);
  };

  const handleChange = (e) => {
    setSample({ ...sample, [e.target.name]: e.target.value });
  };

  const handleInspectionChange = (e) => {
    const { name, value } = e.target;
    setSample((prev) => ({
      ...prev,
      inspection: {
        ...prev.inspection,
        [name]: value,
      },
    }));
  };
  const handleSendEmail = async () => {
    const saved = localStorage.getItem("formData");
  const parsed = saved ? JSON.parse(saved) : {};
     console.log("FULL formData:", parsed);      // ✅ shows everything
     console.log("Email being used:", parsed.mailid);
    try {
      const pdf = await generatePDF(samples);
    const pdfBase64 = pdf.output("datauristring").split(",")[1];
      const saved = localStorage.getItem("formData");
      const parsed = JSON.parse(saved);
      console.log("Parsed Data:", parsed);
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: parsed.mailid,
          subject: "Sample Report",
          message: "Please find the attached report.",
          attachment: pdfBase64,
          
        }),
      });
      console.log("Email id", parsed.mailid);
      const data = await res.json();
      if (data.success) {
        alert("Email sent!");
      } else {
        alert("Email failed: " + data.error);
      }
    } catch (err) {
      console.error("Email error:", err);
    }
  };

  const isInRange = (value, base, min, max) => {
    const v = parseFloat(value);
    const b = parseFloat(base);
    const mi = parseFloat(min);
    const ma = parseFloat(max);
    if (isNaN(v) || isNaN(mi) || isNaN(ma)) return null;
    return v >= b + mi && v <= b + ma;
  };
  const isInRange2 = (a, b, c, d, ovality) => {
    const value = [parseFloat(a), parseFloat(b), parseFloat(c), parseFloat(d)];
    const numericValues = value
      .map((v) => parseFloat(v))
      .filter((v) => !isNaN(v));
    if (numericValues.length === 0) return { ok: false, diff: null };
    const mi = Math.min(...numericValues);
    const ma = Math.max(...numericValues);
    const diff = ma - mi;
    if (isNaN(diff)) return { ok: false, diff: null };
    return { ok: diff < ovality, diff };
  };

  const icon = (ok) => {
    if (ok === null) return null;
    return ok ? (
      <AiOutlineCheck className="text-green-500 ml-2 flex" size={18} />
    ) : (
      <AiOutlineClose className="text-red-500 ml-2 flex" size={18} />
    );
  };
  async function handleClearAndSend() {
    await handleSendEmail();
    // console.log("Clearing data and reloading...");
    // localStorage.removeItem("samples");
    // localStorage.removeItem("formData");
    // window.location.reload();
  }
  const inspectionFields = [
    "liteScratch",
    "deepScratch",
    "overFilling",
    "underFilling",
    "seamsCrack",
    "fireCrack",
    "burntSurface",
    "surfaceRoughness",
    "lap",
    "rollCross",
    "roll/guideMark",
    "rollingChips",
    "MechanicalMark",
  ];

  const formatLabel = (label) =>
    label.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  if (!hasMounted) return null; // Prevent SSR crash
  const saved = localStorage.getItem("formData");
  const parsed = JSON.parse(saved);

  return (
    <div className="md:container bg-cyan-100 md:mx-auto my-5 rounded-xl p-5 min-h-[80vh] md:w-1/2">
      <h1 className="font-bold text-center text-xl">Sample Manager</h1>

      {/* Sample Input Fields */}
      <div className="my-5 space-y-2">
        <h2 className="text-lg font-bold">Sample Details</h2>
        <label>Top/Bottom:</label>
        <input
          name="topbottom"
          value={sample.topbottom}
          onChange={handleChange}
          className="bg-white p-1.5 rounded-md w-full"
          placeholder="Top Bottom"
        />
        <label>Side:</label>
        <input
          name="side"
          value={sample.side}
          onChange={handleChange}
          className="bg-white p-1.5 rounded-md w-full"
          placeholder="Side"
        />
        <label>Shoulder1:</label>
        <input
          name="shoulder1"
          value={sample.shoulder1}
          onChange={handleChange}
          className="bg-white p-1.5 rounded-md w-full"
          placeholder="Shoulder 1"
        />
        <label>Shoulder2:</label>
        <input
          name="shoulder2"
          value={sample.shoulder2}
          onChange={handleChange}
          className="bg-white p-1.5 rounded-md w-full"
          placeholder="Shoulder 2"
        />
      </div>

      {/* Inspection Fields */}
      <div className="my-5">
        <h2 className="text-lg font-bold mb-2">Inspection</h2>

        <div className="grid grid-cols-1 gap-2">
          {inspectionFields.map((field) => (
            <div
              key={field}
              className="flex items-center justify-between bg-white p-2 rounded"
            >
              <label className="font-medium w-1/2">{formatLabel(field)}</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={field}
                    value="OK"
                    checked={sample.inspection[field] === "OK"}
                    onChange={handleInspectionChange}
                  />
                  OK
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={field}
                    value="Not OK"
                    checked={sample.inspection[field] === "Not OK"}
                    onChange={handleInspectionChange}
                  />
                  Not OK
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleAdd}
        className="bg-cyan-800 text-white p-2 rounded w-full disabled:bg-cyan-600 hover:bg-cyan-900 my-2"
      >
        Add Sample
      </button>
      <button
        className="bg-cyan-800 text-white p-2 rounded w-full disabled:bg-cyan-600 hover:bg-cyan-900"
        onClick={handleClearAndSend}
      >
        End Heat
      </button>

      <hr />
      <h2 className="text-xl font-bold my-3">Your Samples</h2>
      {samples.length === 0 && <p>No Samples To Display</p>}
      {samples.map((item) => (
        <div
          key={item.id}
          className="bg-white p-4 my-2 rounded shadow space-y-2"
        >
          <div className="flex justify-between items-center">
            <label className="text-bold">SAMPLE</label>
            <div className="flex gap-2">
              <button
                onClick={(e) => handleEdit(e, item.id)}
                className="text-blue-700"
              >
                <AiOutlineEdit size={20} />
              </button>
              <button
                onClick={(e) => handleDelete(e, item.id)}
                className="text-red-600"
              >
                <AiOutlineDelete size={20} />
              </button>
            </div>
          </div>
          <div className="ml-6 text-sm">
            <p>
              <strong>Top/ Bottom:</strong> {item.sample.topbottom}{" "}
              {icon(
                isInRange(
                  item.sample.topbottom,
                  parsed.base,
                  parsed.minsize,
                  parsed.maxsize
                )
              )}
            </p>
            <p>
              <strong>Side:</strong> {item.sample.side}{" "}
              {icon(
                isInRange(
                  item.sample.side,
                  parsed.base,
                  parsed.minsize,
                  parsed.maxsize
                )
              )}
            </p>
            <p>
              <strong>Shoulder 1:</strong> {item.sample.shoulder1}{" "}
              {icon(
                isInRange(
                  item.sample.shoulder1,
                  parsed.base,
                  parsed.minsize,
                  parsed.maxsize
                )
              )}
            </p>
            <p>
              <strong>Shoulder 2:</strong> {item.sample.shoulder2}{" "}
              {icon(
                isInRange(
                  item.sample.shoulder2,
                  parsed.base,
                  parsed.minsize,
                  parsed.maxsize
                )
              )}
            </p>
            {(() => {
              const { ok, diff } = isInRange2(
                item.sample.topbottom,
                item.sample.side,
                item.sample.shoulder1,
                item.sample.shoulder2,
                parsed.ovality
              );
              return (
                <p>
                  <strong>Ovality:</strong>{" "}
                  {diff !== null ? diff.toFixed(2) : "N/A"} {icon(ok)}
                </p>
              );
            })()}

            <p className="mt-2 font-semibold">Inspection:</p>
            {Object.entries(item?.sample?.inspection || {}).map(
              ([key, value]) => (
                <p key={key}>
                  {formatLabel(key)}:{" "}
                  <span
                    className={
                      value === "OK" ? "text-green-600" : "text-red-600"
                    }
                  >
                    {value}
                  </span>
                </p>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
