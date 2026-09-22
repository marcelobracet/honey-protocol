import { ImageResponse } from "next/og";

const SIZES = new Set([180, 192, 512]);

/**
 * Generates PNG app icons on the fly (no binary assets in the repo).
 * /icons/192, /icons/512, /icons/180 (Apple). `?maskable=1` adds safe-zone padding.
 */
export async function GET(request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: raw } = await params;
  const size = Number(raw);
  if (!SIZES.has(size)) return new Response(null, { status: 404 });
  const maskable = new URL(request.url).searchParams.get("maskable") === "1";
  const radius = maskable ? 0 : Math.round(size * 0.22);
  const jar = maskable ? size * 0.5 : size * 0.62;

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #3a230f 0%, #241609 100%)",
          borderRadius: radius,
        }}
      >
        <svg viewBox="0 0 132 150" width={jar} height={jar}>
          <rect x="30" y="18" width="72" height="14" rx="4" fill="#8a5a24" />
          <path
            d="M22 40 h88 a6 6 0 016 6 v90 a10 10 0 01-10 10 H26 a10 10 0 01-10-10 V46 a6 6 0 016-6 z"
            fill="#2f1d0f"
            stroke="rgba(246,234,210,0.25)"
            strokeWidth="2"
          />
          <path d="M20 84 h92 v52 a10 10 0 01-10 10 H26 a10 10 0 01-10-10 z" fill="#e3a63e" />
          <path d="M20 84 h92 v10 H16 z" fill="#f6cf7c" />
        </svg>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
  );
}
