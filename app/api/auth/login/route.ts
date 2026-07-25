import { NextRequest, NextResponse } from 'next/server';
import { ensurePrimaryCompany } from '@/lib/tenant';

const SESSION_COOKIE = 'fta_session';

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as {
      email?: string;
      companyCode?: string;
    };

    const email = (data.email || '').trim().toLowerCase();
    const companyCode = (data.companyCode || '').trim().toLowerCase();

    if (!email || !companyCode) {
      return NextResponse.json(
        { error: 'Email and company code are required' },
        { status: 400 }
      );
    }

    const company = await ensurePrimaryCompany();
    const validEmail = company.email.trim().toLowerCase() === email;

    const companyCodes = [company.uaeId, company.taxId, company.trrn]
      .filter((v): v is string => Boolean(v))
      .map((v) => v.trim().toLowerCase());

    const validCode = companyCodes.includes(companyCode);

    if (!validEmail || !validCode) {
      return NextResponse.json(
        { error: 'Invalid company credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
      },
    });

    response.cookies.set(SESSION_COOKIE, company.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
