'use client';
import { useRouter } from 'next/navigation';

export default function UserHasPena({
  penaId,
  eventId,
}: {
  penaId: number;
  eventId: number;
}) {
  const router = useRouter();
  router.push(`/lagunak/${eventId}/penas/${penaId}`);
  return null;
}
