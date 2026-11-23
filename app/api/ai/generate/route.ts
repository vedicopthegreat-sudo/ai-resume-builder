
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const prompt = body?.prompt;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Please provide a prompt." },
        { status: 400 }
      );
    }

    if (prompt.length > 12000) {
      return NextResponse.json(
        {
          error: "Prompt is too long. Maximum length is 12,000 characters.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.SITE_URL || "http://localhost:3000",
          "X-Title": "CareerCraft AI Resume Builder",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content:
                "You are a professional resume writing assistant. Generate clear, professional, ATS-friendly resume content. Avoid inventing qualifications or work experience.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API error:", data);

      return NextResponse.json(
        {
          error:
            response.status === 429
              ? "OpenRouter free usage limit reached. Please try again later."
              : data?.error?.message ||
                "OpenRouter AI request failed.",
        },
        { status: response.status }
      );
    }

    const generatedText = data.choices?.[0]?.message?.content;

    if (
      typeof generatedText !== "string" ||
      !generatedText.trim()
    ) {
      return NextResponse.json(
        { error: "OpenRouter returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ text: generatedText });
  } catch (error) {
    console.error("OpenRouter API error:", error);

    return NextResponse.json(
      { error: "Unable to generate AI content. Please try again." },
      { status: 500 }
    );
  }
}
