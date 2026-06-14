export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error('Missing Resend environment variables');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject: '[PickMa] 이메일 인증 코드',
      text: `인증 코드: ${otp}\n유효 시간: 10분\n\n이 코드를 요청하지 않았다면 무시해 주세요.`,
      html: `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PickMa 이메일 인증</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 40px 32px;">
            <tr>
              <td>
                <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #1e8e50;">PickMa</p>
                <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #111827;">이메일 인증</h1>
                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                  아래 인증 코드를 입력해 이메일을 인증해 주세요.
                </p>
                <table cellpadding="0" cellspacing="0" style="margin-bottom: 24px; width: 100%;">
                  <tr>
                    <td align="center" style="background-color: #f0faf4; border: 1px solid #bbf0d3; border-radius: 8px; padding: 20px;">
                      <span style="font-size: 32px; font-weight: 700; letter-spacing: 10px; color: #1e8e50;">${otp}</span>
                    </td>
                  </tr>
                </table>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px 0;" />
                <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                  인증 코드는 10분 후 만료됩니다. 요청하지 않으셨다면 이 이메일을 무시해 주세요.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status}`);
  }
}
