import configPromise from '@payload-config';
import { bookingHold } from '@/lib/redis';
import { getPayload } from 'payload';

export const GET = async (request: Request) => {
  await getPayload({
    config: configPromise,
  });

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('serviceId');
  const slot = searchParams.get('slot');

  let holdStatus: Awaited<ReturnType<typeof bookingHold.get>> | null = null;

  if (serviceId && slot) {
    holdStatus = await bookingHold.get({ serviceId, slot });
  }

  return Response.json({
    message: 'This is an example of a custom route.',
    bookingHold: holdStatus,
  });
};
