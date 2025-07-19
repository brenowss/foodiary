import { JwtPayload, sign, verify } from 'jsonwebtoken';

export function signAccessToken(userId: string) {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return sign({ sub: userId }, JWT_SECRET, { expiresIn: '3d' });
}

export function validateAccessToken(accessToken: string) {
  try {
    const { JWT_SECRET } = process.env;

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    return verify(accessToken, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Token de acesso inválido');
  }
}
