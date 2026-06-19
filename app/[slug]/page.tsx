import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import styles from "./styles.module.css";

interface Props {
  params: { slug: string };
}

export default async function PublicProfile({ params }: Props) {
  const profile = await db.profile.findUnique({
    where: { slug: params.slug },
    include: {
      user: {
        select: { name: true, surname: true, username: true },
      },
      links: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!profile) notFound();

  const initials =
    `${profile.user.name[0]}${profile.user.surname[0]}`.toUpperCase();
  const fullName = `${profile.user.name} ${profile.user.surname}`;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.avatar}>{initials}</div>
        <h1 className={styles.name}>{fullName}</h1>
        <p className={styles.username}>@{profile.user.username}</p>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

        <div className={styles.links}>
          {profile.links.length === 0 && (
            <p className={styles.empty}>No links yet.</p>
          )}
          {profile.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkCard}
            >
              <span className={styles.linkTitle}>{link.title}</span>
              <span className={styles.linkArrow}>↗</span>
            </a>
          ))}
        </div>

        <p className={styles.footer}>
          Made with <span className={styles.brand}>teoinbio</span>
        </p>
      </div>
    </div>
  );
}
