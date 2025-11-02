import { getPayload } from 'payload';
import path from 'path';

const resetPassword = async () => {
  const configPath = path.resolve(process.cwd(), 'src/payload.config.ts');
  const payload = await getPayload({
    config: (await import(configPath)).default,
  });

  try {
    const userId = '12'; // admin@cyannobat.com
    const newPassword = 'Yzam13880108';

    // Update the user with the new password
    const updatedUser = await payload.update({
      collection: 'users',
      id: userId,
      data: {
        password: newPassword,
      },
    });

    console.log('✓ Password reset successfully for user:', updatedUser.email);
    console.log('✓ New password:', newPassword);
    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to reset password:', error);
    process.exit(1);
  }
};

resetPassword();
