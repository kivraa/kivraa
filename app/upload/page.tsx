"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [college, setCollege] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");

  const handleUpload = async () => {
  if (!pdf) {
    alert("Please select a PDF.");
    return;
  }

  setLoading(true);

  try {
    // Get logged in user
    const {
  data: { user },
} = await supabase.auth.getUser();

console.log("Current User:", user);

if (!user) {
  alert("Please login first.");
  setLoading(false);
  return;
}

    // Create unique file name
    const fileName = `${Date.now()}-${pdf.name}`;

    // Upload PDF to Storage
    const { error: uploadError } = await supabase.storage
      .from("notes")
      .upload(fileName, pdf);

    if (uploadError) {
  console.log(uploadError);
  alert(JSON.stringify(uploadError));
  throw uploadError;
}

    // Get Public URL
    const { data } = supabase.storage
      .from("notes")
      .getPublicUrl(fileName);

    const pdfUrl = data.publicUrl;

    // Save note in database

    console.log({
  title,
  description,
  subject,
  semester,
  branch,
  college,
  uploaded_by: user?.id,
});

const { data: insertedNote, error: dbError } = await supabase
  .from("notes")
  .insert([
    {
      title,
      description,
      subject,
      semester,
      branch,
      college,
      pdf_url: pdfUrl,
      uploaded_by: user.id,
    },
  ])
  .select();

console.log("Current User:", user);
console.log("User ID:", user.id);
console.log("Inserted Note:", insertedNote);
console.log("DB Error:", dbError);

if (dbError) {
  alert(JSON.stringify(dbError, null, 2));
  throw dbError;
}
    alert("🎉 Note uploaded successfully!");

    setTitle("");
    setDescription("");
    setSubject("");
    setSemester("");
    setBranch("");
    setCollege("");
    setPdf(null);

  } catch (error: any) {
    alert(error.message);
  }

  setLoading(false);
};

  return (
    <div className="min-h-screen bg-[#0B0B0F] py-10 px-6 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-800 bg-[#111118] p-8">

        <h1 className="mb-8 text-center text-4xl font-bold">
          📄 Upload Notes
        </h1>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-[#0B0B0F] px-4 py-3"
          />

          <textarea
            placeholder="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-[#0B0B0F] px-4 py-3"
          />

          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-[#0B0B0F] px-4 py-3"
          />

          <input
            type="text"
            placeholder="Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-[#0B0B0F] px-4 py-3"
          />

          <input
            type="text"
            placeholder="Branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-[#0B0B0F] px-4 py-3"
          />

          <input
            type="text"
            placeholder="College"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-[#0B0B0F] px-4 py-3"
          />

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setPdf(e.target.files[0]);
              }
            }}
            className="w-full rounded-xl border border-gray-700 bg-[#0B0B0F] px-4 py-3"
          />

          <button
  onClick={handleUpload}
  disabled={loading}
  className="w-full rounded-xl bg-[#F5B700] py-3 font-semibold text-black disabled:opacity-50"
>
  {loading ? "Uploading..." : "Upload Notes"}
</button>

        </div>
      </div>
    </div>
  );
}