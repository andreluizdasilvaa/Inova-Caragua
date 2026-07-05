import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { useNotifications } from '@/components/layout/NotificationContext';
import { Occurrence } from '@/types';

export function useLiveUpdate(
  currentOccurrences: Occurrence[],
  setOccurrences: React.Dispatch<React.SetStateAction<Occurrence[]>>,
  instituicaoId?: string | null
) {
  const { data: session, status } = useSession();
  const { addNotification } = useNotifications();
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;

    const intervalId = setInterval(async () => {
      try {
        // 1. Check user status (Security check)
        // We use a safe fetch block here
        const userRes = await fetch(`/api/usuarios/${session.user.id}`);
        if (!userRes.ok) {
          if (userRes.status === 404) {
            signOut({ callbackUrl: '/' });
            return;
          }
        } else {
          const user = await userRes.json();
          if (!user.ativo || user.papel !== session.user.papel) {
            signOut({ callbackUrl: '/' });
            return;
          }
        }

        // 2. Poll Occurrences (Data update)
        const filters = instituicaoId ? { instituicaoId } : {};
        const newOccurrencesRaw = await api.occurrences.list(filters);
        
        const newOccurrences: Occurrence[] = Array.isArray(newOccurrencesRaw) 
          ? newOccurrencesRaw 
          : (newOccurrencesRaw as any).data || [];

        // 3. Compare to find updates for notifications
        const now = new Date();
        let hasChanges = false;

        newOccurrences.forEach(newOcc => {
          const newUpdated = new Date(newOcc.updatedAt);
          // Add a small buffer to avoid timezone issues or rapid updates missing
          if (newUpdated > lastCheck) {
            
            // Try to find the old one to see what changed
            const oldOcc = currentOccurrences.find(o => o.id === newOcc.id);
            
            // If the timestamps are exactly the same, it hasn't actually changed.
            // Often updatedAt comes from DB with milliseconds, comparing string ISO might be better
            if (oldOcc && new Date(oldOcc.updatedAt).getTime() === newUpdated.getTime()) {
              return;
            }

            hasChanges = true;
            
            if (!oldOcc) {
              addNotification({
                title: `Nova ocorrência #${newOcc.numero}`,
                message: newOcc.titulo,
                type: 'info'
              });
            } else if (oldOcc.status !== newOcc.status) {
              addNotification({
                title: `Ocorrência #${newOcc.numero} atualizada`,
                message: `Status mudou para: ${newOcc.status}`,
                type: 'status_change'
              });
            } else {
              addNotification({
                title: `Ocorrência #${newOcc.numero} editada`,
                message: 'Detalhes foram atualizados.',
                type: 'info'
              });
            }
          }
        });

        if (hasChanges) {
          setOccurrences(newOccurrences);
          setLastCheck(now);
        }

      } catch (error) {
        console.error('Error in live update polling:', error);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [session, status, currentOccurrences, setOccurrences, instituicaoId, addNotification, lastCheck]);
}
