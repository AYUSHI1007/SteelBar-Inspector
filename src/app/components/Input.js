'use client';
import { useEffect, useState } from 'react';
export const handleClear = (setForm, initialState) => {
  setForm(initialState);
  localStorage.removeItem("formData");
};
export default function MultiInputForm() {
    const initialState={
        heatno: '',
        grade: '',
        base:'',
        maxsize: '',         
        minsize: '',         
        ovality: '',
        time:'', 
        mailid:'', 
        shift:'',    
        rollingdate: ''   
      };
    const [form, setForm] = useState(initialState);

  // Load saved values from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('formData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm({
          heatno: parsed.heatno || '',
          grade: parsed.grade || '',
          base: parsed.base || '',
          maxsize: parsed.maxsize || '',
          minsize: parsed.minsize || '',
          shift: parsed.shift || '',
          time: parsed.time || '',
          mailid: parsed.mailid || '',
          ovality: parsed.ovality || '',
          rollingdate: parsed.rollingdate || ''
        });
      } catch (err) {
        console.error("Error parsing saved data", err);
      }
    }
  }, []);

  // Save on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    localStorage.setItem('formData', JSON.stringify(updated));
  };
  const handleClear = () => {
    setForm(initialState);
    localStorage.removeItem('formData');
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4">INLINE INSPECTION REPORT</h2>
      <div className="flex items-center gap-4">
        <label className="w-25 font-medium">DATE OF ROLLING</label>
        <input
          type="date"
          name="rollingdate"
          value={form.rollingdate}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
         
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="w-25 font-medium">EMail ID</label>
        <input
          type="email"
          name="mailid"
          value={form.mailid}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
         
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="w-25 font-medium">SHIFT</label>
        <input
          type="text"
          name="shift"
          value={form.shift}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
         
        />
        <label className="w-25 font-medium">TIME</label>
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
         
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="w-20 font-medium">HEAT NUMBER</label>
        <input
          type="text"
          name="heatno"
          value={form.heatno}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-20 font-medium">GRADE</label>
        <input
          type="text"
          name="grade"
          value={form.grade}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          
        />
      </div>
      
      <div className=" items-center">
        <label className="w-20 font-medium">SIZE TOLERANCE</label>
        <input
          type="number"
          name="base"
          value={form.base}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          
        />
        <div className='flex gap-2'>
        <label className="w-20 font-medium">MIN</label>
        <input
          type="number"
          step="0.10"
          name="minsize"
          value={form.minsize}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          
        />
        <label className="w-20 font-medium">MAX</label>
        <input
          type="number"
          name="maxsize"
          step="0.10"
          value={form.maxsize}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          
        />
      </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="w-20 font-medium">OVALITY</label>
        <input
          type="text"
          name="ovality"
          value={form.ovality}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          
        />
      </div>
      <div className="text-center pt-2">
        <button
          onClick={handleClear}
          className="bg-blue-300 text-white px-6 py-2 rounded hover:bg-blue-400 transition"
        >
          Clear All
        </button>
      </div>

      
    </div>
  );
}
