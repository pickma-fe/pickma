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
      html: `<p>PickMa 이메일 인증 코드입니다.</p><p>인증 코드: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p><p>유효 시간: 10분</p><p style="color:#888;font-size:12px">이 코드를 요청하지 않았다면 무시해 주세요.</p>`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status}`);
  }
}
