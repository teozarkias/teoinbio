"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";

interface Link {
  id: string;
  title: string;
  url: string;
  position: number;
}

interface Profile {
  slug: string;
  bio: string | null;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [links, setLinks] = useState<Link[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [bio, setBio] = useState("");
  const [slug, setSlug] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchLinks();
    fetchProfile();
  }, [status]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function fetchLinks() {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(Array.isArray(data) ? data : []);
  }

  async function fetchProfile() {
    const res = await fetch("/api/profile");
    const data = await res.json();
    setProfile(data);
    setBio(data?.bio || "");
    setSlug(data?.slug || "");
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLink),
    });

    if (res.ok) {
      setNewLink({ title: "", url: "" });
      setAddOpen(false);
      await fetchLinks();
      showToast("Link added");
    } else {
      showToast("Failed to add link");
    }

    setAdding(false);
  }

  async function handleDeleteLink(id: string) {
    setDeletingId(id);

    const res = await fetch(`/api/links/${id}`, { method: "DELETE" });

    if (res.ok) {
      setLinks((prev) => prev.filter((l) => l.id !== id));
      showToast("Link deleted");
    } else {
      showToast("Failed to delete link");
    }

    setDeletingId(null);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, slug }),
    });

    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setProfileOpen(false);
      showToast("Profile saved");
    } else {
      const data = await res.json();
      showToast(data.error || "Failed to save profile");
    }

    setSaving(false);
  }

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>T</div>
          <span className={styles.logoText}>teoinbio</span>
        </div>
        <div className={styles.headerActions}>
          {profile && (
            <a
              href={`/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewLink}
            >
              View page ↗
            </a>
          )}
          <button
            className={styles.signOutBtn}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1 className={styles.welcomeTitle}>Hey, {session?.user?.name} 👋</h1>
          <p className={styles.welcomeSub}>
            Manage your links and profile below.
          </p>
        </div>

        {/* Profile section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Profile</h2>
            <button
              className={styles.editBtn}
              onClick={() => setProfileOpen((v) => !v)}
            >
              {profileOpen ? "Cancel" : "Edit"}
            </button>
          </div>

          {profileOpen ? (
            <form onSubmit={handleSaveProfile} className={styles.profileForm}>
              <div className={styles.field}>
                <label className={styles.label}>Slug</label>
                <input
                  type="text"
                  className={styles.input}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="your-slug"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Bio</label>
                <textarea
                  className={styles.textarea}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world about yourself..."
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className={styles.saveBtn}
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
            </form>
          ) : (
            <div className={styles.profilePreview}>
              <p className={styles.profileSlug}>/{profile?.slug}</p>
              <p className={styles.profileBio}>
                {profile?.bio || "No bio yet."}
              </p>
            </div>
          )}
        </section>

        {/* Links section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Links</h2>
            <button
              className={styles.addBtn}
              onClick={() => setAddOpen((v) => !v)}
            >
              {addOpen ? "Cancel" : "+ Add link"}
            </button>
          </div>

          {addOpen && (
            <form onSubmit={handleAddLink} className={styles.addForm}>
              <div className={styles.field}>
                <label className={styles.label}>Title</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newLink.title}
                  onChange={(e) =>
                    setNewLink({ ...newLink, title: e.target.value })
                  }
                  placeholder="My Website"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>URL</label>
                <input
                  type="url"
                  className={styles.input}
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink({ ...newLink, url: e.target.value })
                  }
                  placeholder="https://example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={adding}
                className={styles.saveBtn}
              >
                {adding ? "Adding..." : "Add link"}
              </button>
            </form>
          )}

          <ul className={styles.linkList}>
            {links.length === 0 && (
              <p className={styles.empty}>No links yet. Add your first one!</p>
            )}
            {links.map((link) => (
              <li key={link.id} className={styles.linkItem}>
                <div className={styles.linkInfo}>
                  <span className={styles.linkTitle}>{link.title}</span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkUrl}
                  >
                    {link.url}
                  </a>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteLink(link.id)}
                  disabled={deletingId === link.id}
                >
                  {deletingId === link.id ? "..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
