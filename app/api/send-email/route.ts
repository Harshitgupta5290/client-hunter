import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body, smtp, leadId } = await req.json();

    if (!smtp?.host || !smtp?.user || !smtp?.pass) {
      return NextResponse.json({ error: "SMTP not configured" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port || 587,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });

    // Extract URLs first, escape everything else, then re-insert links
    const urlPlaceholders: string[] = [];
    const withPlaceholders = body.replace(/(https?:\/\/[^\s]+)/g, (url: string) => {
      urlPlaceholders.push(url);
      return `\x00URL${urlPlaceholders.length - 1}\x00`;
    });
    const escaped = withPlaceholders
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
    const html = escaped.replace(/\x00URL(\d+)\x00/g, (_: string, i: string) => {
      const url = urlPlaceholders[parseInt(i)];
      return `<a href="${url}" style="color:#6366f1">${url}</a>`;
    });

    // Tracking pixel — appended to HTML only, invisible to recipient
    const baseUrl = req.headers.get("origin") || "http://localhost:3000";
    const pixel = leadId
      ? `<img src="${baseUrl}/api/track-open?id=${leadId}&t=${Date.now()}" width="1" height="1" style="display:none" />`
      : "";

    await transporter.sendMail({
      from: smtp.fromName ? `"${smtp.fromName}" <${smtp.user}>` : smtp.user,
      to,
      subject,
      text: body,
      html: `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#1a1a1a;max-width:600px">${html}</div>${pixel}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("SMTP send error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
