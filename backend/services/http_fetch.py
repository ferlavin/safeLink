import httpx


def normalize_url(url: str) -> str:
    raw = url.strip()
    if not raw.startswith(("http://", "https://")):
        raw = f"https://{raw}"
    return raw


async def fetch_url(url: str, *, method: str = "GET") -> tuple[str, httpx.Headers, int]:
    raw = normalize_url(url)
    async with httpx.AsyncClient(
        follow_redirects=True, timeout=15.0, verify=False
    ) as client:
        if method.upper() == "HEAD":
            resp = await client.head(raw)
        else:
            resp = await client.get(raw)
        resp.raise_for_status()
        return raw, resp.headers, resp.status_code


async def fetch_html(url: str) -> tuple[str, str, httpx.Headers]:
    raw = normalize_url(url)
    async with httpx.AsyncClient(
        follow_redirects=True, timeout=15.0, verify=False
    ) as client:
        resp = await client.get(raw)
        resp.raise_for_status()
        return raw, resp.text, resp.headers
