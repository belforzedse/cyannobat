import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { userIsStaff } from "@/lib/auth";

// define the shape we actually use from payload.login(...)
type StaffLoginResult<User> = {
  user: User;
  token: string;
  exp?: number; // access token exp (seconds)
  refreshToken?: string;
  refreshTokenExpiration?: number; // seconds (epoch) or ms (handle below)
};

export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  const payload = await getPayload({ config: configPromise });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { email?: unknown }).email !== "string" ||
    typeof (body as { password?: unknown }).password !== "string"
  ) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  const { email, password } = body as { email: string; password: string };

  try {
    // tell TS what payload.login returns (narrow to the fields we use)
    const auth = (await payload.login({
      collection: "users",
      data: { email, password },
    })) as StaffLoginResult<{ id: string; email: string; roles?: string[] }>;

    if (!auth.user || !userIsStaff(auth.user)) {
      return NextResponse.json({ message: "حساب کاربری مجاز نیست." }, { status: 403 });
    }

    const roles = Array.isArray(auth.user.roles) ? auth.user.roles : [];

    const res = NextResponse.json({
      user: { id: auth.user.id, email: auth.user.email, roles },
    });

    // --- access token cookie (value must be a string) ---
    if (auth.token) {
      res.cookies.set("payload-token", auth.token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        ...(auth.exp ? { expires: new Date(auth.exp * 1000) } : {}),
      });
    }

    // --- refresh token cookie only if present (avoid string|undefined) ---
    if (auth.refreshToken) {
      const rtExp = auth.refreshTokenExpiration;
      res.cookies.set("payload-refresh-token", auth.refreshToken, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        ...(rtExp
          ? {
              // handle seconds vs ms
              expires: new Date(rtExp > 1e12 ? rtExp : rtExp * 1000),
            }
          : {}),
      });
    }

    return res;
  } catch (error) {
    payload.logger.warn?.("Failed staff login attempt", error);
    return NextResponse.json(
      { message: "ورود ناموفق بود. ایمیل یا رمز عبور را بررسی کنید." },
      { status: 401 }
    );
  }
};
