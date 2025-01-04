import { NextResponse } from "next/server";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

// https://docs.google.com/forms/d/e/1FAIpQLSegkPqJDm5mKrBx49yWLy0WGedpOnsQll6OIpcmOX-reidN4Q/viewform?usp=sf_link
const FORM_ID = "1FAIpQLSegkPqJDm5mKrBx49yWLy0WGedpOnsQll6OIpcmOX-reidN4Q";
const FORM_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = emailSchema.parse(body);

    const formData = new FormData();
    formData.append("entry.1257821246", email);

    const response = await fetch(FORM_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to submit");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save email:", error);
    return NextResponse.json(
      { error: "Failed to save email" },
      { status: 500 },
    );
  }
}
