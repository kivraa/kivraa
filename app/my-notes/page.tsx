"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Note = {
  id: string;
  title: string | null;
  description: string | null;
  subject: string | null;
  semester: string | null;
  branch: string | null;
  college: string | null;
  pdf_url: string | null;
  uploaded_by: string | null;
  created_at: string | null;
};

export default function MyNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [search, subjectFilter, semesterFilter, notes]);

  async function loadNotes() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
      }

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading notes:", error);
        alert(error.message);
        return;
      }

      setNotes(data || []);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function filterNotes() {
    let result = [...notes];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((note) => {
        return (
          note.title?.toLowerCase().includes(query) ||
          note.description?.toLowerCase().includes(query) ||
          note.subject?.toLowerCase().includes(query) ||
          note.branch?.toLowerCase().includes(query) ||
          note.college?.toLowerCase().includes(query)
        );
      });
    }

    if (subjectFilter) {
      result = result.filter(
        (note) => note.subject === subjectFilter
      );
    }

    if (semesterFilter) {
      result = result.filter(
        (note) => note.semester === semesterFilter
      );
    }

    setFilteredNotes(result);
  }

  async function deleteNote(noteId: string) {
    const confirmed = confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (error) {
        alert(error.message);
        return;
      }

      setNotes((prev) =>
        prev.filter((note) => note.id !== noteId)
      );

      alert("Note deleted successfully");
    } catch (error: any) {
      alert(error.message || "Failed to delete note");
    }
  }

  const subjects = Array.from(
    new Set(
      notes
        .map((note) => note.subject)
        .filter(Boolean)
    )
  );

  const semesters = Array.from(
    new Set(
      notes
        .map((note) => note.semester)
        .filter(Boolean)
    )
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#08090f",
        color: "white",
        padding: "40px 6%",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "10px",
          }}
        >
          📚 My Notes
        </h1>

        <p
          style={{
            color: "#9ca3af",
            fontSize: "16px",
          }}
        >
          Explore, organize and access your study notes.
        </p>
      </div>

      {/* SEARCH + FILTERS */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1",
            minWidth: "250px",
            padding: "15px 18px",
            borderRadius: "12px",
            border: "1px solid #303646",
            background: "#11131c",
            color: "white",
            fontSize: "15px",
          }}
        />

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          style={{
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #303646",
            background: "#11131c",
            color: "white",
          }}
        >
          <option value="">All Subjects</option>

          {subjects.map((subject) => (
            <option key={subject} value={subject || ""}>
              {subject}
            </option>
          ))}
        </select>

        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          style={{
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #303646",
            background: "#11131c",
            color: "white",
          }}
        >
          <option value="">All Semesters</option>

          {semesters.map((semester) => (
            <option key={semester} value={semester || ""}>
              Semester {semester}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearch("");
            setSubjectFilter("");
            setSemesterFilter("");
          }}
          style={{
            padding: "15px 20px",
            borderRadius: "12px",
            border: "none",
            background: "#272b38",
            color: "white",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* NOTES COUNT */}

      {!loading && (
        <p
          style={{
            color: "#9ca3af",
            marginBottom: "25px",
          }}
        >
          {filteredNotes.length} note
          {filteredNotes.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* LOADING */}

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "#9ca3af",
            fontSize: "18px",
          }}
        >
          Loading your notes...
        </div>
      )}

      {/* EMPTY STATE */}

      {!loading && filteredNotes.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "#11131c",
            borderRadius: "20px",
            border: "1px solid #252a38",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              marginBottom: "15px",
            }}
          >
            📭
          </div>

          <h2>No notes found</h2>

          <p
            style={{
              color: "#9ca3af",
            }}
          >
            Upload your first note or try changing the filters.
          </p>
        </div>
      )}

      {/* NOTES GRID */}

      {!loading && filteredNotes.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px",
          }}
        >
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              style={{
                background: "#11131c",
                border: "1px solid #262b38",
                borderRadius: "20px",
                padding: "24px",
                transition: "0.2s",
              }}
            >
              {/* NOTE ICON */}

              <div
                style={{
                  fontSize: "34px",
                  marginBottom: "15px",
                }}
              >
                📄
              </div>

              {/* TITLE */}

              <h2
                style={{
                  fontSize: "22px",
                  marginBottom: "10px",
                }}
              >
                {note.title || "Untitled Note"}
              </h2>

              {/* DESCRIPTION */}

              {note.description && (
                <p
                  style={{
                    color: "#a1a1aa",
                    lineHeight: "1.6",
                    marginBottom: "18px",
                    minHeight: "50px",
                  }}
                >
                  {note.description}
                </p>
              )}

              {/* TAGS */}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {note.subject && (
                  <span
                    style={{
                      background: "#20253a",
                      padding: "7px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    📘 {note.subject}
                  </span>
                )}

                {note.semester && (
                  <span
                    style={{
                      background: "#20253a",
                      padding: "7px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    🎓 Sem {note.semester}
                  </span>
                )}

                {note.branch && (
                  <span
                    style={{
                      background: "#20253a",
                      padding: "7px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    {note.branch}
                  </span>
                )}
              </div>

              {/* COLLEGE */}

              {note.college && (
                <p
                  style={{
                    color: "#71717a",
                    fontSize: "13px",
                    marginBottom: "20px",
                  }}
                >
                  🏫 {note.college}
                </p>
              )}

              {/* ACTION BUTTONS */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {note.pdf_url && (
                  <>
                    <a
                      href={note.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        textAlign: "center",
                        textDecoration: "none",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#ffffff",
                        color: "#000000",
                        fontWeight: "600",
                      }}
                    >
                      👀 View
                    </a>

                    <a
                      href={note.pdf_url}
                      download
                      style={{
                        flex: 1,
                        textAlign: "center",
                        textDecoration: "none",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#242938",
                        color: "white",
                      }}
                    >
                      ⬇ Download
                    </a>
                  </>
                )}
              </div>

              {/* DELETE BUTTON - ONLY OWNER */}

              {currentUserId === note.uploaded_by && (
                <button
                  onClick={() => deleteNote(note.id)}
                  style={{
                    width: "100%",
                    marginTop: "12px",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #4b2020",
                    background: "#211313",
                    color: "#ff8b8b",
                    cursor: "pointer",
                  }}
                >
                  🗑 Delete Note
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}