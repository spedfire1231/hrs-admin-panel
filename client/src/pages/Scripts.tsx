import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type ScriptRow = {
  id: string;
  title: string;
  language: "en" | "ru" | "ua";
  content: string;
  created_at: string;
  updated_at: string;
};

const LANGS: Array<ScriptRow["language"]> = ["en", "ua", "ru"];

function langLabel(l: ScriptRow["language"]) {
  if (l === "en") return "EN";
  if (l === "ua") return "UA";
  return "RU";
}

export default function Scripts() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [rows, setRows] = useState<ScriptRow[]>([]);
  const [query, setQuery] = useState("");
  const [langFilter, setLangFilter] = useState<"" | ScriptRow["language"]>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScriptRow | null>(null);

  // form state
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<ScriptRow["language"]>("en");
  const [content, setContent] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const okQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q);
      const okL = !langFilter || r.language === langFilter;
      return okQ && okL;
    });
  }, [rows, query, langFilter]);

  async function fetchScripts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("scripts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Failed to load scripts: " + error.message);
      setLoading(false);
      return;
    }

    setRows((data || []) as ScriptRow[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchScripts();
  }, []);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setLanguage("en");
    setContent("");
    setIsModalOpen(true);
  }

  function openEdit(row: ScriptRow) {
    setEditing(row);
    setTitle(row.title);
    setLanguage(row.language);
    setContent(row.content);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setIsModalOpen(false);
    setEditing(null);
  }

  async function save() {
    const t = title.trim();
    if (!t) return alert("Title is required");

    setSaving(true);

    if (!editing) {
      const { error } = await supabase.from("scripts").insert({
        title: t,
        language,
        content: content ?? "",
      });

      if (error) {
        console.error(error);
        alert("Create failed: " + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("scripts")
        .update({
          title: t,
          language,
          content: content ?? "",
        })
        .eq("id", editing.id);

      if (error) {
        console.error(error);
        alert("Update failed: " + error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setIsModalOpen(false);
    setEditing(null);
    await fetchScripts();
  }

  async function remove(row: ScriptRow) {
    const ok = confirm(`Delete script "${row.title}"?`);
    if (!ok) return;

    const { error } = await supabase.from("scripts").delete().eq("id", row.id);
    if (error) {
      console.error(error);
      alert("Delete failed: " + error.message);
      return;
    }

    setRows((prev) => prev.filter((x) => x.id !== row.id));
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied ✅");
    } catch {
      alert("Clipboard blocked by browser 😅");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Scripts</div>
          <div className="page-subtitle">
            Create and manage HRS scripts (EN / UA / RU)
          </div>
        </div>

        <button className="cy-btn primary" onClick={openCreate}>
          + New Script
        </button>
      </div>

      <div className="cy-card">
        <div className="cy-toolbar">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="cy-input"
              style={{ width: 320 }}
              placeholder="Search by title or content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <select
              className="cy-select"
              style={{ width: 140 }}
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value as any)}
            >
              <option value="">All languages</option>
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {langLabel(l)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="cy-btn ghost" onClick={fetchScripts}>
              Refresh
            </button>
          </div>
        </div>

        <div className="cy-table-wrap">
          {loading ? (
            <div style={{ padding: 16 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 16 }}>No scripts found.</div>
          ) : (
            <table className="cy-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Language</th>
                  <th>Updated</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="cy-row">
                    <td>
                      <div style={{ fontWeight: 800, color: "var(--text-main)" }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {r.content?.slice(0, 90)}
                        {r.content?.length > 90 ? "…" : ""}
                      </div>
                    </td>

                    <td>
                      <span className={`ui-badge lang-${r.language}`}>
                        {langLabel(r.language)}
                      </span>
                    </td>

                    <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(r.updated_at || r.created_at).toLocaleString()}
                    </td>

                    <td>
                      <div className="actions">
                        <button className="icon-btn" onClick={() => copyText(r.content)}>
                          📋
                        </button>
                        <button className="icon-btn primary" onClick={() => openEdit(r)}>
                          ✏️
                        </button>
                        <button className="icon-btn danger" onClick={() => remove(r)}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="cy-modal-overlay" onMouseDown={closeModal}>
          <div className="cy-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="cy-modal-header">
              <div className="cy-modal-title">
                {editing ? "Edit Script" : "New Script"}
              </div>
            </div>

            <div className="cy-modal-body">
              <div className="cy-grid">
                <div className="cy-field">
                  <label>Title</label>
                  <input
                    className="cy-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. First contact / Greeting / etc..."
                  />
                </div>

                <div className="cy-field">
                  <label>Language</label>
                  <select
                    className="cy-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                  >
                    {LANGS.map((l) => (
                      <option key={l} value={l}>
                        {langLabel(l)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cy-field">
                  <label>Content</label>
                  <textarea
                    className="cy-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your script..."
                    rows={10}
                  />
                </div>
              </div>
            </div>

            <div className="cy-modal-footer">
              <button className="cy-btn ghost" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button className="cy-btn primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}