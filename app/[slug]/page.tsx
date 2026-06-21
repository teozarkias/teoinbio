import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import styles from "./styles.module.css";
import Link from "next/link";
import { getPlatform } from "@/lib/platforms";
import PlatformIcon from "@/components/PlatformIcon";
interface Props {
  params: Promise<{ slug: string }>;
}

interface ProfileLink {
  id: string;
  title: string;
  url: string;
  platform: string | null;
  position: number;
  profileId: string;
  createdAt: Date;
}

export default async function PublicProfile({ params }: Props) {
  const { slug } = await params;

  const [profile] = await Promise.all([
    db.profile.findUnique({
      where: { slug },
      include: {
        user: {
          select: { name: true, surname: true, username: true },
        },
        links: {
          orderBy: { position: "asc" },
        },
      },
    }),
    getServerSession(authOptions),
  ]);

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
          {profile.links.map((link: ProfileLink) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkCard}
            >
              <div className={styles.linkLeft}>
                <PlatformIcon platform={link.platform} title={link.title} />
                <span className={styles.linkTitle}>{link.title}</span>
              </div>
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
